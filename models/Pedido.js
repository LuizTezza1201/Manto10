const crypto = require('crypto');
const pool = require('../config/database');

// Cria erros com status HTTP para facilitar o tratamento nos controllers.
function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// Retorna o tempo máximo que um pedido pode permanecer pendente.
function obterExpiracaoSegundos() {
    const segundos = Number(
        process.env.PEDIDO_EXPIRACAO_SEGUNDOS || 1800
    );

    return Number.isInteger(segundos) && segundos > 0
        ? segundos
        : 1800;
}

// Gera um número único e fácil de identificar para cada pedido.
function gerarNumeroPedido() {
    const codigo = crypto
        .randomBytes(2)
        .toString('hex')
        .toUpperCase();

    return `M10-${Date.now()}-${codigo}`;
}

// Reserva estoque real para uma Box Misteriosa.
//
// A box é um produto virtual e não possui unidades próprias. Cada unidade
// comprada consome uma camisa real do mesmo tipo e tamanho. As reservas
// ficam registradas para que um cancelamento devolva exatamente as mesmas
// unidades ao estoque.
async function reservarEstoqueBox({
    connection,
    itemPedidoId,
    tipoCamisa,
    tamanho,
    quantidade
}) {
    const [fontes] = await connection.execute(`
        SELECT
            pt.id AS produto_tamanho_id,
            pt.estoque
        FROM produto_tamanhos pt
        INNER JOIN produtos p ON p.id = pt.produto_id
        INNER JOIN categorias c ON c.id = p.categoria_id
        INNER JOIN tamanhos t ON t.id = pt.tamanho_id
        WHERE p.tipo_camisa = ?
          AND p.status = 'Ativo'
          AND c.status = 'Ativo'
          AND c.slug <> 'box-misteriosas'
          AND t.nome = ?
          AND pt.estoque > 0
        ORDER BY pt.estoque DESC, pt.id ASC
        FOR UPDATE
    `, [tipoCamisa, tamanho]);

    let restante = Number(quantidade);

    for (const fonte of fontes) {
        if (restante <= 0) {
            break;
        }

        const estoqueAtual = Number(fonte.estoque);
        const reservar = Math.min(restante, estoqueAtual);

        if (reservar <= 0) {
            continue;
        }

        const [resultado] = await connection.execute(`
            UPDATE produto_tamanhos
            SET estoque = estoque - ?
            WHERE id = ? AND estoque >= ?
        `, [
            reservar,
            fonte.produto_tamanho_id,
            reservar
        ]);

        if (resultado.affectedRows === 0) {
            throw criarErro(
                'O estoque disponível para a Box Misteriosa mudou. Tente novamente.'
            );
        }

        await connection.execute(`
            INSERT INTO itens_pedido_reservas (
                item_pedido_id,
                produto_tamanho_id,
                quantidade
            )
            VALUES (?, ?, ?)
        `, [
            itemPedidoId,
            fonte.produto_tamanho_id,
            reservar
        ]);

        restante -= reservar;
    }

    if (restante > 0) {
        throw criarErro(
            `Não há estoque suficiente para a Box Misteriosa no tamanho ${tamanho}.`
        );
    }
}

const Pedido = {
    // ======================================================
    // ENDEREÇO
    // ======================================================

    // Busca o endereço principal ou o endereço mais recente do cliente.
    async buscarEnderecoPrincipal(usuarioId) {
        const [rows] = await pool.execute(`
            SELECT
                id,
                apelido,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                principal
            FROM enderecos
            WHERE usuario_id = ?
            ORDER BY principal DESC, id DESC
            LIMIT 1
        `, [usuarioId]);

        return rows[0] || null;
    },

    // ======================================================
    // CRIAÇÃO DO PEDIDO
    // ======================================================

    async criarDoCarrinho({ usuarioId, endereco }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Localiza e bloqueia o carrinho ativo durante a finalização.
            const [carrinhos] = await connection.execute(`
                SELECT id
                FROM carrinhos
                WHERE usuario_id = ? AND status = 'Ativo'
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
            `, [usuarioId]);

            if (carrinhos.length === 0) {
                throw criarErro('Seu carrinho está vazio.');
            }

            const carrinhoId = carrinhos[0].id;

            // Busca os itens do carrinho. Para produtos comuns, o estoque vem
            // da própria variação. Para Box Misteriosa, a reserva é feita no
            // estoque compartilhado durante a criação dos itens do pedido.
            const [itens] = await connection.execute(`
                SELECT
                    ic.id AS item_id,
                    ic.quantidade,
                    ic.preferencia_box,
                    pt.id AS produto_tamanho_id,
                    pt.estoque,
                    tam.nome AS tamanho,
                    p.id AS produto_id,
                    p.codigo,
                    p.nome,
                    p.status,
                    p.tipo_camisa,
                    p.preco,
                    p.preco_promocional,
                    cat.slug AS categoria_slug,
                    CASE
                        WHEN p.preco_promocional IS NOT NULL
                             AND p.preco_promocional < p.preco
                        THEN p.preco_promocional
                        ELSE p.preco
                    END AS preco_unitario
                FROM itens_carrinho ic
                INNER JOIN produto_tamanhos pt ON pt.id = ic.produto_tamanho_id
                INNER JOIN tamanhos tam ON tam.id = pt.tamanho_id
                INNER JOIN produtos p ON p.id = pt.produto_id
                INNER JOIN categorias cat ON cat.id = p.categoria_id
                WHERE ic.carrinho_id = ?
                ORDER BY ic.id ASC
                FOR UPDATE
            `, [carrinhoId]);

            if (itens.length === 0) {
                throw criarErro('Seu carrinho está vazio.');
            }

            let subtotalCentavos = 0;

            for (const item of itens) {
                const quantidade = Number(item.quantidade);

                if (item.status !== 'Ativo') {
                    throw criarErro(
                        `${item.nome} não está mais disponível.`
                    );
                }

                // Produtos comuns são conferidos imediatamente.
                // O estoque da box é conferido e bloqueado ao fazer a reserva.
                if (
                    item.categoria_slug !== 'box-misteriosas' &&
                    Number(item.estoque) < quantidade
                ) {
                    throw criarErro(
                        `O estoque de ${item.nome} - tamanho ${item.tamanho} mudou. Disponível: ${item.estoque}.`
                    );
                }

                const precoCentavos = Math.round(
                    Number(item.preco_unitario) * 100
                );

                subtotalCentavos += precoCentavos * quantidade;
            }

            const subtotal = subtotalCentavos / 100;
            const frete = 0;
            const desconto = 0;
            const total = subtotal + frete - desconto;

            // Mantém apenas o novo endereço utilizado como principal.
            await connection.execute(`
                UPDATE enderecos
                SET principal = 0
                WHERE usuario_id = ?
            `, [usuarioId]);

            const [enderecoResultado] = await connection.execute(`
                INSERT INTO enderecos (
                    usuario_id,
                    apelido,
                    cep,
                    logradouro,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    principal
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                usuarioId,
                'Entrega',
                endereco.cep,
                endereco.logradouro,
                endereco.numero,
                endereco.complemento,
                endereco.bairro,
                endereco.cidade,
                endereco.estado
            ]);

            const enderecoId = enderecoResultado.insertId;
            const numeroPedido = gerarNumeroPedido();

            const expiraEm = new Date(
                Date.now() + obterExpiracaoSegundos() * 1000
            );

            const [pedidoResultado] = await connection.execute(`
                INSERT INTO pedidos (
                    numero_pedido,
                    usuario_id,
                    endereco_id,
                    cupom_id,
                    subtotal,
                    frete,
                    desconto,
                    total,
                    status,
                    observacao,
                    estoque_restituido,
                    expira_em
                )
                VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'Pendente', NULL, 0, ?)
            `, [
                numeroPedido,
                usuarioId,
                enderecoId,
                subtotal,
                frete,
                desconto,
                total,
                expiraEm
            ]);

            const pedidoId = pedidoResultado.insertId;

            // Registra os itens e reserva o estoque correspondente.
            for (const item of itens) {
                const quantidade = Number(item.quantidade);
                const preco = Number(item.preco_unitario);
                const subtotalItem =
                    Math.round(preco * quantidade * 100) / 100;

                const [itemResultado] = await connection.execute(`
                    INSERT INTO itens_pedido (
                        pedido_id,
                        produto_id,
                        codigo_produto,
                        nome_produto,
                        tamanho,
                        preferencia_box,
                        quantidade,
                        preco_unitario,
                        subtotal
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    pedidoId,
                    item.produto_id,
                    item.codigo,
                    item.nome,
                    item.tamanho,
                    item.preferencia_box || null,
                    quantidade,
                    preco,
                    subtotalItem
                ]);

                if (item.categoria_slug === 'box-misteriosas') {
                    await reservarEstoqueBox({
                        connection,
                        itemPedidoId: itemResultado.insertId,
                        tipoCamisa: item.tipo_camisa,
                        tamanho: item.tamanho,
                        quantidade
                    });

                    continue;
                }

                // Produto comum: baixa diretamente a própria variação.
                const [estoqueResultado] = await connection.execute(`
                    UPDATE produto_tamanhos
                    SET estoque = estoque - ?
                    WHERE id = ? AND estoque >= ?
                `, [
                    quantidade,
                    item.produto_tamanho_id,
                    quantidade
                ]);

                if (estoqueResultado.affectedRows === 0) {
                    throw criarErro(
                        `Não foi possível reservar o estoque de ${item.nome}.`
                    );
                }
            }

            await connection.execute(`
                UPDATE carrinhos
                SET status = 'Finalizado'
                WHERE id = ? AND usuario_id = ?
            `, [carrinhoId, usuarioId]);

            await connection.commit();

            return {
                id: pedidoId,
                numeroPedido,
                total
            };
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    },

    // ======================================================
    // CANCELAMENTO E RESTITUIÇÃO DE ESTOQUE
    // ======================================================

    async cancelarERestituirEstoque({
        pedidoId,
        usuarioId = null,
        somentePendente = false
    }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let sqlPedido = `
                SELECT id, usuario_id, status, estoque_restituido
                FROM pedidos
                WHERE id = ?
            `;
            const parametros = [pedidoId];

            if (usuarioId !== null) {
                sqlPedido += ' AND usuario_id = ?';
                parametros.push(usuarioId);
            }

            sqlPedido += ' LIMIT 1 FOR UPDATE';

            const [pedidos] = await connection.execute(
                sqlPedido,
                parametros
            );

            if (pedidos.length === 0) {
                throw criarErro('Pedido não encontrado.', 404);
            }

            const pedido = pedidos[0];

            if (somentePendente && pedido.status !== 'Pendente') {
                throw criarErro(
                    'Este pedido não pode mais ser cancelado.'
                );
            }

            if (!['Pendente', 'Cancelado'].includes(pedido.status)) {
                throw criarErro(
                    'O estoque deste pedido não pode ser restituído neste status.'
                );
            }

            if (Number(pedido.estoque_restituido) === 1) {
                throw criarErro(
                    'O estoque deste pedido já foi restituído.'
                );
            }

            const [itens] = await connection.execute(`
                SELECT
                    ip.id AS item_pedido_id,
                    ip.produto_id,
                    ip.tamanho,
                    ip.quantidade,
                    c.slug AS categoria_slug
                FROM itens_pedido ip
                LEFT JOIN produtos p ON p.id = ip.produto_id
                LEFT JOIN categorias c ON c.id = p.categoria_id
                WHERE ip.pedido_id = ?
                FOR UPDATE
            `, [pedidoId]);

            if (itens.length === 0) {
                throw criarErro('O pedido não possui produtos.');
            }

            for (const item of itens) {
                if (item.categoria_slug === 'box-misteriosas') {
                    // Devolve as unidades reais que foram reservadas para a box.
                    const [reservas] = await connection.execute(`
                        SELECT produto_tamanho_id, quantidade
                        FROM itens_pedido_reservas
                        WHERE item_pedido_id = ?
                        FOR UPDATE
                    `, [item.item_pedido_id]);

                    for (const reserva of reservas) {
                        await connection.execute(`
                            UPDATE produto_tamanhos
                            SET estoque = estoque + ?
                            WHERE id = ?
                        `, [
                            Number(reserva.quantidade),
                            reserva.produto_tamanho_id
                        ]);
                    }

                    // Pedidos de box criados antes desta nova regra não possuem
                    // reservas e não devem acrescentar estoque virtual.
                    continue;
                }

                const [resultado] = await connection.execute(`
                    UPDATE produto_tamanhos pt
                    INNER JOIN tamanhos t ON t.id = pt.tamanho_id
                    SET pt.estoque = pt.estoque + ?
                    WHERE pt.produto_id = ? AND t.nome = ?
                `, [
                    Number(item.quantidade),
                    item.produto_id,
                    item.tamanho
                ]);

                if (resultado.affectedRows === 0) {
                    throw criarErro(
                        `Não foi possível restituir o estoque do tamanho ${item.tamanho}.`
                    );
                }
            }

            await connection.execute(`
                UPDATE pedidos
                SET
                    status = 'Cancelado',
                    estoque_restituido = 1,
                    expira_em = NULL
                WHERE id = ?
            `, [pedidoId]);

            await connection.commit();
            return true;
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    }
};

module.exports = Pedido;
