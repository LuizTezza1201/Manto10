const pool = require('../config/database');

function criarErroCarrinho(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

const PREFERENCIA_BOX_ESTRANGEIROS =
    'Apenas times estrangeiros e seleções';

const PREFERENCIAS_BOX_PERMITIDAS = [
    'Todas as camisas',
    PREFERENCIA_BOX_ESTRANGEIROS
];

// Retorna o estoque real que pode atender uma Box Misteriosa.
// As boxes não possuem unidades próprias: elas compartilham o estoque
// das camisas normais do mesmo tipo e tamanho.
async function obterEstoqueCompartilhadoBox(
    executor,
    tipoCamisa,
    tamanho,
    preferenciaBox = ''
) {
    const [[resultado]] = await executor.execute(`
        SELECT COALESCE(SUM(pt.estoque), 0) AS estoque
        FROM produto_tamanhos pt
        INNER JOIN produtos p ON p.id = pt.produto_id
        INNER JOIN categorias c ON c.id = p.categoria_id
        INNER JOIN tamanhos t ON t.id = pt.tamanho_id
        LEFT JOIN ligas l ON l.id = p.liga_id
        WHERE p.tipo_camisa = ?
          AND p.status = 'Ativo'
          AND c.status = 'Ativo'
          AND c.slug <> 'box-misteriosas'
          AND t.nome = ?
          AND (
              ? <> 'Apenas times estrangeiros e seleções'
              OR (l.slug IS NOT NULL AND l.slug <> 'brasileirao')
          )
    `, [
        tipoCamisa,
        tamanho,
        preferenciaBox
    ]);

    return Number(resultado.estoque || 0);
}

const Carrinho = {
    // ======================================================
    // LISTAR ITENS DO CARRINHO ATIVO
    // ======================================================

    async listarItens(usuarioId) {
        const [rows] = await pool.execute(`
            SELECT
                ic.id AS item_id,
                ic.quantidade,
                ic.preferencia_box,

                pt.id AS produto_tamanho_id,

                CASE
                    WHEN cat.slug = 'box-misteriosas' THEN (
                        SELECT COALESCE(SUM(pt_pool.estoque), 0)
                        FROM produto_tamanhos pt_pool
                        INNER JOIN produtos p_pool ON p_pool.id = pt_pool.produto_id
                        INNER JOIN categorias c_pool ON c_pool.id = p_pool.categoria_id
                        INNER JOIN tamanhos t_pool ON t_pool.id = pt_pool.tamanho_id
                        LEFT JOIN ligas l_pool ON l_pool.id = p_pool.liga_id
                        WHERE p_pool.tipo_camisa = p.tipo_camisa
                          AND p_pool.status = 'Ativo'
                          AND c_pool.status = 'Ativo'
                          AND c_pool.slug <> 'box-misteriosas'
                          AND t_pool.nome = tam.nome
                          AND (
                              ic.preferencia_box <> 'Apenas times estrangeiros e seleções'
                              OR (l_pool.slug IS NOT NULL AND l_pool.slug <> 'brasileirao')
                          )
                    )
                    ELSE pt.estoque
                END AS estoque,

                tam.nome AS tamanho,

                p.id AS produto_id,
                p.codigo,
                p.nome,
                p.slug,
                p.tipo_camisa,
                p.preco,
                p.preco_promocional,
                cat.slug AS categoria_slug,

                CASE
                    WHEN p.preco_promocional IS NOT NULL
                         AND p.preco_promocional < p.preco
                    THEN p.preco_promocional
                    ELSE p.preco
                END AS preco_unitario,

                (
                    SELECT pi.caminho
                    FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem

            FROM carrinhos c
            INNER JOIN itens_carrinho ic ON ic.carrinho_id = c.id
            INNER JOIN produto_tamanhos pt ON pt.id = ic.produto_tamanho_id
            INNER JOIN tamanhos tam ON tam.id = pt.tamanho_id
            INNER JOIN produtos p ON p.id = pt.produto_id
            INNER JOIN categorias cat ON cat.id = p.categoria_id

            WHERE c.id = (
                SELECT id
                FROM carrinhos
                WHERE usuario_id = ? AND status = 'Ativo'
                ORDER BY id DESC
                LIMIT 1
            )

            ORDER BY ic.id DESC
        `, [usuarioId]);

        return rows;
    },

    // ======================================================
    // ADICIONAR ITEM
    // ======================================================

    async adicionarItem({
        usuarioId,
        produtoTamanhoId,
        quantidade,
        preferenciaBox = ''
    }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Procura ou cria o carrinho ativo do cliente.
            const [carrinhos] = await connection.execute(`
                SELECT id
                FROM carrinhos
                WHERE usuario_id = ? AND status = 'Ativo'
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
            `, [usuarioId]);

            let carrinhoId;

            if (carrinhos.length > 0) {
                carrinhoId = carrinhos[0].id;
            } else {
                const [resultado] = await connection.execute(`
                    INSERT INTO carrinhos (usuario_id, status)
                    VALUES (?, 'Ativo')
                `, [usuarioId]);

                carrinhoId = resultado.insertId;
            }

            // Confere produto e tamanho selecionados.
            const [variacoes] = await connection.execute(`
                SELECT
                    pt.id,
                    pt.estoque,
                    p.nome,
                    p.status,
                    p.tipo_camisa,
                    c.slug AS categoria_slug,
                    t.nome AS tamanho
                FROM produto_tamanhos pt
                INNER JOIN produtos p ON p.id = pt.produto_id
                INNER JOIN categorias c ON c.id = p.categoria_id
                INNER JOIN tamanhos t ON t.id = pt.tamanho_id
                WHERE pt.id = ?
                LIMIT 1
                FOR UPDATE
            `, [produtoTamanhoId]);

            if (variacoes.length === 0) {
                throw criarErroCarrinho(
                    'Produto ou tamanho não encontrado.',
                    404
                );
            }

            const variacao = variacoes[0];

            if (variacao.status !== 'Ativo') {
                throw criarErroCarrinho(
                    'Este produto não está disponível.'
                );
            }

            const ehBox =
                variacao.categoria_slug === 'box-misteriosas';

            let preferenciaNormalizada = '';

            if (ehBox) {
                preferenciaNormalizada = String(
                    preferenciaBox || ''
                ).trim();

                if (!PREFERENCIAS_BOX_PERMITIDAS.includes(preferenciaNormalizada)) {
                    throw criarErroCarrinho(
                        'Escolha uma preferência válida para a Box Misteriosa.'
                    );
                }
            }

            const estoqueDisponivel = ehBox
                ? await obterEstoqueCompartilhadoBox(
                    connection,
                    variacao.tipo_camisa,
                    variacao.tamanho,
                    preferenciaNormalizada
                )
                : Number(variacao.estoque);

            if (estoqueDisponivel <= 0) {
                throw criarErroCarrinho(
                    'Este tamanho está sem estoque.'
                );
            }

            const [itensExistentes] = await connection.execute(`
                SELECT id, quantidade
                FROM itens_carrinho
                WHERE carrinho_id = ?
                  AND produto_tamanho_id = ?
                  AND preferencia_box = ?
                LIMIT 1
                FOR UPDATE
            `, [
                carrinhoId,
                produtoTamanhoId,
                preferenciaNormalizada
            ]);

            const quantidadeAtual = itensExistentes.length > 0
                ? Number(itensExistentes[0].quantidade)
                : 0;

            const novaQuantidade = quantidadeAtual + quantidade;

            if (novaQuantidade > estoqueDisponivel) {
                throw criarErroCarrinho(
                    'Não há unidades suficientes disponíveis neste tamanho.'
                );
            }

            if (itensExistentes.length > 0) {
                await connection.execute(`
                    UPDATE itens_carrinho
                    SET quantidade = ?
                    WHERE id = ?
                `, [
                    novaQuantidade,
                    itensExistentes[0].id
                ]);
            } else {
                await connection.execute(`
                    INSERT INTO itens_carrinho (
                        carrinho_id,
                        produto_tamanho_id,
                        preferencia_box,
                        quantidade
                    )
                    VALUES (?, ?, ?, ?)
                `, [
                    carrinhoId,
                    produtoTamanhoId,
                    preferenciaNormalizada,
                    quantidade
                ]);
            }

            await connection.commit();
            return true;
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    },

    // ======================================================
    // ALTERAR QUANTIDADE
    // ======================================================

    async atualizarQuantidade({
        usuarioId,
        itemId,
        quantidade
    }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute(`
                SELECT
                    ic.id,
                    ic.preferencia_box,
                    pt.estoque,
                    p.tipo_camisa,
                    cat.slug AS categoria_slug,
                    t.nome AS tamanho
                FROM itens_carrinho ic
                INNER JOIN carrinhos c ON c.id = ic.carrinho_id
                INNER JOIN produto_tamanhos pt ON pt.id = ic.produto_tamanho_id
                INNER JOIN tamanhos t ON t.id = pt.tamanho_id
                INNER JOIN produtos p ON p.id = pt.produto_id
                INNER JOIN categorias cat ON cat.id = p.categoria_id
                WHERE ic.id = ?
                  AND c.usuario_id = ?
                  AND c.status = 'Ativo'
                LIMIT 1
                FOR UPDATE
            `, [itemId, usuarioId]);

            if (rows.length === 0) {
                throw criarErroCarrinho(
                    'Item do carrinho não encontrado.',
                    404
                );
            }

            const item = rows[0];
            const ehBox = item.categoria_slug === 'box-misteriosas';

            const estoqueDisponivel = ehBox
                ? await obterEstoqueCompartilhadoBox(
                    connection,
                    item.tipo_camisa,
                    item.tamanho,
                    item.preferencia_box || ''
                )
                : Number(item.estoque);

            if (quantidade > estoqueDisponivel) {
                throw criarErroCarrinho(
                    'Não há unidades suficientes disponíveis neste tamanho.'
                );
            }

            await connection.execute(`
                UPDATE itens_carrinho
                SET quantidade = ?
                WHERE id = ?
            `, [quantidade, itemId]);

            await connection.commit();
            return true;
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    },

    // ======================================================
    // REMOVER ITEM
    // ======================================================

    async removerItem({ usuarioId, itemId }) {
        const [resultado] = await pool.execute(`
            DELETE ic
            FROM itens_carrinho ic
            INNER JOIN carrinhos c ON c.id = ic.carrinho_id
            WHERE ic.id = ?
              AND c.usuario_id = ?
              AND c.status = 'Ativo'
        `, [itemId, usuarioId]);

        if (resultado.affectedRows === 0) {
            throw criarErroCarrinho(
                'Item do carrinho não encontrado.',
                404
            );
        }

        return true;
    }
};

module.exports = Carrinho;
