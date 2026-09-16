const crypto = require('crypto');
const pool = require('../config/database');

const ORIGENS_PERMITIDAS = ['Loja física', 'Venda externa'];
const FORMAS_PAGAMENTO = ['Pix', 'Cartão', 'Dinheiro'];

// Cria erros com status HTTP para que o controller possa tratá-los corretamente.
function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// Gera um identificador único para cada venda realizada fora do site.
function gerarNumeroVenda() {
    const codigo = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `VENDA-${Date.now()}-${codigo}`;
}

// Formulários com um único item podem enviar um valor simples em vez de array.
function normalizarArray(valor) {
    if (Array.isArray(valor)) return valor;
    if (valor === undefined || valor === null || valor === '') return [];
    return [valor];
}

const AdminVenda = {
    // ======================================================
    // RESUMO DE VENDAS
    // ======================================================

    // Soma vendas do site e vendas manuais para os indicadores do painel.
    async obterResumo() {
        const [rows] = await pool.execute(`
            SELECT
                COALESCE(SUM(CASE
                    WHEN DATE(v.criado_em) = CURDATE() THEN v.total
                    ELSE 0
                END), 0) AS hoje,

                COALESCE(SUM(CASE
                    WHEN YEARWEEK(v.criado_em, 1) = YEARWEEK(CURDATE(), 1)
                    THEN v.total ELSE 0
                END), 0) AS semana,

                COALESCE(SUM(CASE
                    WHEN YEAR(v.criado_em) = YEAR(CURDATE())
                    AND MONTH(v.criado_em) = MONTH(CURDATE())
                    THEN v.total ELSE 0
                END), 0) AS mes,

                COALESCE(SUM(CASE
                    WHEN YEAR(v.criado_em) = YEAR(CURDATE())
                    THEN v.total ELSE 0
                END), 0) AS ano,

                COUNT(*) AS total_vendas
            FROM (
                SELECT p.total, p.criado_em
                FROM pedidos p
                WHERE p.status IN ('Pago', 'Preparando', 'Enviado', 'Entregue')

                UNION ALL

                SELECT vm.total, vm.criado_em
                FROM vendas_manuais vm
                WHERE vm.status = 'Concluída'
            ) AS v
        `);

        return rows[0];
    },

    // ======================================================
    // HISTÓRICO DE VENDAS
    // ======================================================

    // Reúne vendas feitas pelo site e vendas registradas manualmente.
    async listarUltimas(limite = 10) {
        const limiteSeguro = Number.isInteger(limite) && limite > 0
            ? Math.min(limite, 50)
            : 10;

        // O limite é interpolado somente após ser validado como número inteiro.
        const [rows] = await pool.query(`
            SELECT *
            FROM (
                SELECT
                    p.id,
                    p.numero_pedido,
                    p.total,
                    p.status,
                    p.criado_em,
                    u.nome AS cliente_nome,
                    u.email AS cliente_email,
                    (
                        SELECT COALESCE(SUM(ip.quantidade), 0)
                        FROM itens_pedido ip
                        WHERE ip.pedido_id = p.id
                    ) AS total_itens,
                    'Site' AS origem,
                    'pedido' AS tipo_registro
                FROM pedidos p
                INNER JOIN usuarios u ON u.id = p.usuario_id
                WHERE p.status IN ('Pago', 'Preparando', 'Enviado', 'Entregue')

                UNION ALL

                SELECT
                    vm.id,
                    vm.numero_venda AS numero_pedido,
                    vm.total,
                    CASE
                        WHEN vm.status = 'Concluída' THEN 'Pago'
                        ELSE 'Cancelada'
                    END AS status,
                    vm.criado_em,
                    COALESCE(NULLIF(vm.cliente_nome, ''), 'Cliente não informado') AS cliente_nome,
                    NULL AS cliente_email,
                    (
                        SELECT COALESCE(SUM(ivm.quantidade), 0)
                        FROM itens_venda_manual ivm
                        WHERE ivm.venda_id = vm.id
                    ) AS total_itens,
                    vm.origem,
                    'manual' AS tipo_registro
                FROM vendas_manuais vm
            ) AS vendas
            ORDER BY vendas.criado_em DESC
            LIMIT ${limiteSeguro}
        `);

        if (rows.length === 0) {
            return rows;
        }

        const itensPorRegistro = new Map();

        const idsPedidos = rows
            .filter(venda => venda.tipo_registro === 'pedido')
            .map(venda => Number(venda.id));

        if (idsPedidos.length > 0) {
            const placeholders = idsPedidos
                .map(() => '?')
                .join(', ');

            const [itensPedido] = await pool.execute(`
                SELECT
                    ip.pedido_id AS registro_id,
                    ip.codigo_produto,
                    ip.nome_produto,
                    ip.tamanho,
                    ip.preferencia_box,
                    ip.quantidade,
                    (
                        SELECT pi.caminho
                        FROM produto_imagens pi
                        WHERE pi.produto_id = ip.produto_id
                        ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                        LIMIT 1
                    ) AS imagem
                FROM itens_pedido ip
                WHERE ip.pedido_id IN (${placeholders})
                ORDER BY ip.pedido_id, ip.id
            `, idsPedidos);

            itensPedido.forEach(item => {
                const chave = `pedido:${Number(item.registro_id)}`;

                if (!itensPorRegistro.has(chave)) {
                    itensPorRegistro.set(chave, []);
                }

                itensPorRegistro.get(chave).push(item);
            });
        }

        const idsManuais = rows
            .filter(venda => venda.tipo_registro === 'manual')
            .map(venda => Number(venda.id));

        if (idsManuais.length > 0) {
            const placeholders = idsManuais
                .map(() => '?')
                .join(', ');

            const [itensManuais] = await pool.execute(`
                SELECT
                    ivm.venda_id AS registro_id,
                    ivm.codigo_produto,
                    ivm.nome_produto,
                    ivm.tamanho,
                    NULL AS preferencia_box,
                    ivm.quantidade,
                    (
                        SELECT pi.caminho
                        FROM produto_imagens pi
                        WHERE pi.produto_id = ivm.produto_id
                        ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                        LIMIT 1
                    ) AS imagem
                FROM itens_venda_manual ivm
                WHERE ivm.venda_id IN (${placeholders})
                ORDER BY ivm.venda_id, ivm.id
            `, idsManuais);

            itensManuais.forEach(item => {
                const chave = `manual:${Number(item.registro_id)}`;

                if (!itensPorRegistro.has(chave)) {
                    itensPorRegistro.set(chave, []);
                }

                itensPorRegistro.get(chave).push(item);
            });
        }

        return rows.map(venda => ({
            ...venda,
            itens: itensPorRegistro.get(
                `${venda.tipo_registro}:${Number(venda.id)}`
            ) || []
        }));
    },

    // ======================================================
    // PRODUTOS DISPONÍVEIS PARA VENDA MANUAL
    // ======================================================

    // Exibe somente produtos ativos e tamanhos que possuem estoque.
    async listarProdutosParaVenda() {
        const [rows] = await pool.execute(`
            SELECT
                pt.id AS produto_tamanho_id,
                p.id AS produto_id,
                p.codigo,
                p.nome,
                p.tipo_camisa,
                t.nome AS tamanho,
                pt.estoque,
                CASE
                    WHEN p.preco_promocional IS NOT NULL
                    AND p.preco_promocional < p.preco
                    THEN p.preco_promocional
                    ELSE p.preco
                END AS preco_venda,
                (
                    SELECT pi.caminho
                    FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem
            FROM produto_tamanhos pt
            INNER JOIN produtos p ON p.id = pt.produto_id
            INNER JOIN categorias c ON c.id = p.categoria_id
            INNER JOIN tamanhos t ON t.id = pt.tamanho_id
            WHERE p.status = 'Ativo'
                AND pt.estoque > 0
                AND c.slug <> 'box-misteriosas'
            ORDER BY p.nome ASC, FIELD(t.nome, 'P', 'M', 'G', 'GG')
        `);

        return rows;
    },

    // ======================================================
    // CRIAR VENDA MANUAL
    // ======================================================

    async criarManual({
        administradorId,
        origem,
        clienteNome,
        formaPagamento,
        observacao,
        produtoTamanhoIds,
        quantidades
    }) {
        const adminId = Number(administradorId);

        if (!Number.isInteger(adminId) || adminId <= 0) {
            throw criarErro('Administrador inválido.');
        }

        if (!ORIGENS_PERMITIDAS.includes(origem)) {
            throw criarErro('Origem da venda inválida.');
        }

        if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
            throw criarErro('Forma de pagamento inválida.');
        }

        const ids = normalizarArray(produtoTamanhoIds);
        const quantidadesArray = normalizarArray(quantidades);

        if (ids.length === 0 || ids.length !== quantidadesArray.length) {
            throw criarErro('Adicione pelo menos um produto à venda.');
        }

        // Agrupa a mesma variação caso ela tenha sido adicionada mais de uma vez.
        const itensAgrupados = new Map();

        for (let i = 0; i < ids.length; i++) {
            const produtoTamanhoId = Number(ids[i]);
            const quantidade = Number(quantidadesArray[i]);

            if (!Number.isInteger(produtoTamanhoId) || produtoTamanhoId <= 0) {
                throw criarErro('Produto inválido.');
            }

            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                throw criarErro('Quantidade inválida.');
            }

            const quantidadeAtual = itensAgrupados.get(produtoTamanhoId) || 0;
            itensAgrupados.set(produtoTamanhoId, quantidadeAtual + quantidade);
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let totalCentavos = 0;
            const itensVenda = [];

            // Valida novamente os produtos e bloqueia o estoque durante a venda.
            for (const [produtoTamanhoId, quantidade] of itensAgrupados) {
                const [produtos] = await connection.execute(`
                    SELECT
                        pt.id AS produto_tamanho_id,
                        pt.produto_id,
                        pt.estoque,
                        p.codigo,
                        p.nome,
                        p.tipo_camisa,
                        t.nome AS tamanho,
                        CASE
                            WHEN p.preco_promocional IS NOT NULL
                            AND p.preco_promocional < p.preco
                            THEN p.preco_promocional
                            ELSE p.preco
                        END AS preco_venda
                    FROM produto_tamanhos pt
                    INNER JOIN produtos p ON p.id = pt.produto_id
                    INNER JOIN tamanhos t ON t.id = pt.tamanho_id
                    WHERE pt.id = ?
                    LIMIT 1
                    FOR UPDATE
                `, [produtoTamanhoId]);

                if (produtos.length === 0) {
                    throw criarErro('Produto não encontrado.', 404);
                }

                const produto = produtos[0];

                if (Number(produto.estoque) < quantidade) {
                    throw criarErro(
                        `Estoque insuficiente para ${produto.nome} - tamanho ${produto.tamanho}.`
                    );
                }

                // Os valores são calculados em centavos para evitar erros de ponto flutuante.
                const precoCentavos = Math.round(Number(produto.preco_venda) * 100);
                const subtotalCentavos = precoCentavos * quantidade;
                totalCentavos += subtotalCentavos;

                itensVenda.push({
                    produtoTamanhoId: Number(produto.produto_tamanho_id),
                    produtoId: Number(produto.produto_id),
                    codigo: produto.codigo,
                    nome: produto.nome,
                    tipoCamisa: produto.tipo_camisa,
                    tamanho: produto.tamanho,
                    quantidade,
                    precoUnitario: precoCentavos / 100,
                    subtotal: subtotalCentavos / 100
                });
            }

            const numeroVenda = gerarNumeroVenda();
            const total = totalCentavos / 100;

            // Registra a venda principal antes de salvar seus itens.
            const [resultadoVenda] = await connection.execute(`
                INSERT INTO vendas_manuais (
                    numero_venda,
                    administrador_id,
                    origem,
                    cliente_nome,
                    forma_pagamento,
                    total,
                    observacao,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Concluída')
            `, [
                numeroVenda,
                adminId,
                origem,
                clienteNome ? clienteNome.trim() : null,
                formaPagamento,
                total,
                observacao ? observacao.trim() : null
            ]);

            const vendaId = resultadoVenda.insertId;

            // Salva o histórico da venda e reduz o estoque de cada item.
            for (const item of itensVenda) {
                await connection.execute(`
                    INSERT INTO itens_venda_manual (
                        venda_id,
                        produto_id,
                        produto_tamanho_id,
                        codigo_produto,
                        nome_produto,
                        tipo_camisa,
                        tamanho,
                        quantidade,
                        preco_unitario,
                        subtotal
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    vendaId,
                    item.produtoId,
                    item.produtoTamanhoId,
                    item.codigo,
                    item.nome,
                    item.tipoCamisa,
                    item.tamanho,
                    item.quantidade,
                    item.precoUnitario,
                    item.subtotal
                ]);

                // A condição de estoque impede que a quantidade fique negativa.
                const [resultadoEstoque] = await connection.execute(`
                    UPDATE produto_tamanhos
                    SET estoque = estoque - ?
                    WHERE id = ? AND estoque >= ?
                `, [
                    item.quantidade,
                    item.produtoTamanhoId,
                    item.quantidade
                ]);

                if (resultadoEstoque.affectedRows === 0) {
                    throw criarErro(
                        `Não foi possível atualizar o estoque de ${item.nome}.`
                    );
                }
            }

            await connection.commit();

            return {
                id: vendaId,
                numeroVenda,
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
    // DETALHES DA VENDA MANUAL
    // ======================================================

    // Busca os dados gerais da venda e o administrador responsável.
    async buscarManualPorId(vendaId) {
        const [rows] = await pool.execute(`
            SELECT
                vm.id,
                vm.numero_venda,
                vm.origem,
                vm.cliente_nome,
                vm.forma_pagamento,
                vm.total,
                vm.observacao,
                vm.status,
                vm.estoque_restituido,
                vm.criado_em,
                vm.atualizado_em,
                u.nome AS administrador_nome,
                u.email AS administrador_email
            FROM vendas_manuais vm
            INNER JOIN usuarios u ON u.id = vm.administrador_id
            WHERE vm.id = ?
            LIMIT 1
        `, [vendaId]);

        return rows[0] || null;
    },

    // Retorna os produtos registrados no histórico da venda manual.
    async listarItensManual(vendaId) {
        const [rows] = await pool.execute(`
            SELECT
                ivm.id,
                ivm.produto_id,
                ivm.produto_tamanho_id,
                ivm.codigo_produto,
                ivm.nome_produto,
                ivm.tipo_camisa,
                ivm.tamanho,
                ivm.quantidade,
                ivm.preco_unitario,
                ivm.subtotal,
                (
                    SELECT pi.caminho
                    FROM produto_imagens pi
                    WHERE pi.produto_id = ivm.produto_id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem
            FROM itens_venda_manual ivm
            WHERE ivm.venda_id = ?
            ORDER BY ivm.id ASC
        `, [vendaId]);

        return rows;
    },

    // ======================================================
    // CANCELAMENTO DA VENDA MANUAL
    // ======================================================

    async cancelarManualERestituirEstoque(vendaId) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Bloqueia a venda para impedir dois cancelamentos simultâneos.
            const [vendas] = await connection.execute(`
                SELECT id, numero_venda, status, estoque_restituido
                FROM vendas_manuais
                WHERE id = ?
                LIMIT 1
                FOR UPDATE
            `, [vendaId]);

            if (vendas.length === 0) {
                throw criarErro('Venda não encontrada.', 404);
            }

            const venda = vendas[0];

            if (venda.status === 'Cancelada') {
                throw criarErro('Esta venda já foi cancelada.');
            }

            if (Number(venda.estoque_restituido) === 1) {
                throw criarErro('O estoque desta venda já foi restituído.');
            }

            if (venda.status !== 'Concluída') {
                throw criarErro('Esta venda não pode ser cancelada.');
            }

            const [itens] = await connection.execute(`
                SELECT id, produto_tamanho_id, nome_produto, tamanho, quantidade
                FROM itens_venda_manual
                WHERE venda_id = ?
                FOR UPDATE
            `, [vendaId]);

            if (itens.length === 0) {
                throw criarErro('A venda não possui produtos.');
            }

            // Devolve ao estoque exatamente as quantidades registradas na venda.
            for (const item of itens) {
                if (!item.produto_tamanho_id) {
                    throw criarErro(
                        `Não foi possível localizar o estoque de ${item.nome_produto} - tamanho ${item.tamanho}.`
                    );
                }

                const [resultado] = await connection.execute(`
                    UPDATE produto_tamanhos
                    SET estoque = estoque + ?
                    WHERE id = ?
                `, [
                    Number(item.quantidade),
                    item.produto_tamanho_id
                ]);

                if (resultado.affectedRows === 0) {
                    throw criarErro(
                        `Não foi possível restituir o estoque de ${item.nome_produto}.`
                    );
                }
            }

            // A flag impede que o estoque seja devolvido novamente no futuro.
            await connection.execute(`
                UPDATE vendas_manuais
                SET status = 'Cancelada', estoque_restituido = 1
                WHERE id = ?
            `, [vendaId]);

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

module.exports = AdminVenda;