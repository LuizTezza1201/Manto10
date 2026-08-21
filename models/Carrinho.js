const pool = require('../config/database');

function criarErroCarrinho(
    mensagem,
    status = 400
) {

    const erro = new Error(mensagem);

    erro.status = status;

    return erro;
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

                pt.id AS produto_tamanho_id,
                pt.estoque,

                tam.nome AS tamanho,

                p.id AS produto_id,
                p.codigo,
                p.nome,
                p.slug,
                p.tipo_camisa,
                p.preco,
                p.preco_promocional,

                CASE
                    WHEN
                        p.preco_promocional IS NOT NULL
                        AND p.preco_promocional < p.preco
                    THEN p.preco_promocional
                    ELSE p.preco
                END AS preco_unitario,

                (
                    SELECT pi.caminho
                    FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY
                        pi.principal DESC,
                        pi.ordem ASC,
                        pi.id ASC
                    LIMIT 1
                ) AS imagem

            FROM carrinhos c

            INNER JOIN itens_carrinho ic
                ON ic.carrinho_id = c.id

            INNER JOIN produto_tamanhos pt
                ON pt.id = ic.produto_tamanho_id

            INNER JOIN tamanhos tam
                ON tam.id = pt.tamanho_id

            INNER JOIN produtos p
                ON p.id = pt.produto_id

            WHERE
                c.id = (
                    SELECT id
                    FROM carrinhos
                    WHERE
                        usuario_id = ?
                        AND status = 'Ativo'
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
        quantidade
    }) {

        const connection =
            await pool.getConnection();

        try {

            await connection.beginTransaction();

            // ==============================================
            // PROCURAR CARRINHO ATIVO
            // ==============================================

            const [carrinhos] =
                await connection.execute(`
                    SELECT id
                    FROM carrinhos
                    WHERE
                        usuario_id = ?
                        AND status = 'Ativo'
                    ORDER BY id DESC
                    LIMIT 1
                    FOR UPDATE
                `, [usuarioId]);

            let carrinhoId;

            if (carrinhos.length > 0) {

                carrinhoId =
                    carrinhos[0].id;

            } else {

                const [resultado] =
                    await connection.execute(`
                        INSERT INTO carrinhos (
                            usuario_id,
                            status
                        )
                        VALUES (?, 'Ativo')
                    `, [usuarioId]);

                carrinhoId =
                    resultado.insertId;
            }

            // ==============================================
            // CONFERIR PRODUTO, TAMANHO E ESTOQUE
            // ==============================================

            const [variacoes] =
                await connection.execute(`
                    SELECT
                        pt.id,
                        pt.estoque,
                        p.nome,
                        p.status

                    FROM produto_tamanhos pt

                    INNER JOIN produtos p
                        ON p.id = pt.produto_id

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

            const variacao =
                variacoes[0];

            if (
                variacao.status !== 'Ativo'
            ) {

                throw criarErroCarrinho(
                    'Este produto não está disponível.'
                );
            }

            if (
                Number(
                    variacao.estoque
                ) <= 0
            ) {

                throw criarErroCarrinho(
                    'Este tamanho está sem estoque.'
                );
            }

            // ==============================================
            // ITEM JÁ EXISTE?
            // ==============================================

            const [itensExistentes] =
                await connection.execute(`
                    SELECT
                        id,
                        quantidade

                    FROM itens_carrinho

                    WHERE
                        carrinho_id = ?
                        AND produto_tamanho_id = ?

                    LIMIT 1

                    FOR UPDATE
                `, [
                    carrinhoId,
                    produtoTamanhoId
                ]);

            const quantidadeAtual =
                itensExistentes.length > 0
                    ? Number(
                        itensExistentes[0]
                            .quantidade
                    )
                    : 0;

            const novaQuantidade =
                quantidadeAtual +
                quantidade;

            if (
                novaQuantidade >
                Number(
                    variacao.estoque
                )
            ) {

                throw criarErroCarrinho(
                    `Existem apenas ${variacao.estoque} unidade(s) disponíveis neste tamanho.`
                );
            }

            if (
                itensExistentes.length > 0
            ) {

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
                        quantidade
                    )
                    VALUES (?, ?, ?)
                `, [
                    carrinhoId,
                    produtoTamanhoId,
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

        const connection =
            await pool.getConnection();

        try {

            await connection.beginTransaction();

            const [rows] =
                await connection.execute(`
                    SELECT
                        ic.id,
                        pt.estoque

                    FROM itens_carrinho ic

                    INNER JOIN carrinhos c
                        ON c.id = ic.carrinho_id

                    INNER JOIN produto_tamanhos pt
                        ON pt.id =
                           ic.produto_tamanho_id

                    WHERE
                        ic.id = ?
                        AND c.usuario_id = ?
                        AND c.status = 'Ativo'

                    LIMIT 1

                    FOR UPDATE
                `, [
                    itemId,
                    usuarioId
                ]);

            if (rows.length === 0) {

                throw criarErroCarrinho(
                    'Item do carrinho não encontrado.',
                    404
                );
            }

            const estoque =
                Number(
                    rows[0].estoque
                );

            if (
                quantidade >
                estoque
            ) {

                throw criarErroCarrinho(
                    `Existem apenas ${estoque} unidade(s) disponíveis.`
                );
            }

            await connection.execute(`
                UPDATE itens_carrinho

                SET quantidade = ?

                WHERE id = ?
            `, [
                quantidade,
                itemId
            ]);

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

    async removerItem({
        usuarioId,
        itemId
    }) {

        const [resultado] =
            await pool.execute(`
                DELETE ic

                FROM itens_carrinho ic

                INNER JOIN carrinhos c
                    ON c.id = ic.carrinho_id

                WHERE
                    ic.id = ?
                    AND c.usuario_id = ?
                    AND c.status = 'Ativo'
            `, [
                itemId,
                usuarioId
            ]);

        if (
            resultado.affectedRows === 0
        ) {

            throw criarErroCarrinho(
                'Item do carrinho não encontrado.',
                404
            );
        }

        return true;
    }

};

module.exports = Carrinho;