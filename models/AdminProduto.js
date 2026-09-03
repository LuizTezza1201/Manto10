const pool =
    require('../config/database');

const AdminProduto = {

    // ======================================================
    // CATEGORIAS
    // ======================================================

    async listarCategorias() {

        const [rows] =
            await pool.execute(`
                SELECT
                    id,
                    nome

                FROM categorias

                WHERE status = 'Ativo'

                ORDER BY
                    nome ASC
            `);

        return rows;
    },

    // ======================================================
    // TIMES
    // ======================================================

    async listarTimes() {

        const [rows] =
            await pool.execute(`
                SELECT
                    id,
                    nome

                FROM times

                WHERE status = 'Ativo'

                ORDER BY
                    nome ASC
            `);

        return rows;
    },

    // ======================================================
    // CRIAR PRODUTO
    // ======================================================

    async criar({

        codigo,
        nome,
        slug,

        timeId,
        categoriaId,

        temporada,
        descricao,

        tipoCamisa,

        preco,
        precoPromocional,
        descontoPix,

        destaque,
        maisVendido,

        imagemCaminho,

        estoques

    }) {

        const connection =
            await pool.getConnection();

        try {

            await connection
                .beginTransaction();

            // ==============================================
            // VERIFICAR CÓDIGO
            // ==============================================

            const [codigoExistente] =
                await connection.execute(`
                    SELECT id

                    FROM produtos

                    WHERE codigo = ?

                    LIMIT 1
                `, [
                    codigo
                ]);

            if (
                codigoExistente.length >
                0
            ) {

                const erro =
                    new Error(
                        'Já existe uma camisa com esse código.'
                    );

                erro.status = 400;

                throw erro;
            }

            // ==============================================
            // VERIFICAR SLUG
            // ==============================================

            const [slugExistente] =
                await connection.execute(`
                    SELECT id

                    FROM produtos

                    WHERE slug = ?

                    LIMIT 1
                `, [
                    slug
                ]);

            if (
                slugExistente.length >
                0
            ) {

                const erro =
                    new Error(
                        'Já existe uma camisa com esse nome e código.'
                    );

                erro.status = 400;

                throw erro;
            }

            // ==============================================
            // VERIFICAR CATEGORIA
            // ==============================================

            const [categorias] =
                await connection.execute(`
                    SELECT id

                    FROM categorias

                    WHERE
                        id = ?
                        AND status = 'Ativo'

                    LIMIT 1
                `, [
                    categoriaId
                ]);

            if (
                categorias.length === 0
            ) {

                const erro =
                    new Error(
                        'Categoria não encontrada.'
                    );

                erro.status = 400;

                throw erro;
            }

            // ==============================================
            // VERIFICAR TIME
            // ==============================================

            if (
                timeId !== null
            ) {

                const [times] =
                    await connection.execute(`
                        SELECT id

                        FROM times

                        WHERE
                            id = ?
                            AND status = 'Ativo'

                        LIMIT 1
                    `, [
                        timeId
                    ]);

                if (
                    times.length === 0
                ) {

                    const erro =
                        new Error(
                            'Time não encontrado.'
                        );

                    erro.status = 400;

                    throw erro;
                }
            }

            // ==============================================
            // CRIAR PRODUTO
            // ==============================================

            const [resultado] =
                await connection.execute(`
                    INSERT INTO produtos (

                        codigo,
                        nome,
                        slug,

                        time_id,
                        categoria_id,

                        temporada,
                        descricao,

                        tipo_camisa,

                        preco,
                        preco_promocional,
                        desconto_pix,

                        destaque,
                        mais_vendido,

                        status

                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'Ativo'
                    )
                `, [

                    codigo,
                    nome,
                    slug,

                    timeId,
                    categoriaId,

                    temporada,
                    descricao,

                    tipoCamisa,

                    preco,
                    precoPromocional,
                    descontoPix,

                    destaque,
                    maisVendido

                ]);

            const produtoId =
                resultado.insertId;

            // ==============================================
            // BUSCAR TAMANHOS
            // ==============================================

            const [tamanhos] =
                await connection.execute(`
                    SELECT
                        id,
                        nome

                    FROM tamanhos

                    WHERE
                        status = 'Ativo'

                        AND nome IN (
                            'P',
                            'M',
                            'G',
                            'GG'
                        )

                    ORDER BY
                        ordem ASC
                `);

            const mapaTamanhos =
                new Map(
                    tamanhos.map(
                        tamanho => [
                            tamanho.nome,
                            tamanho.id
                        ]
                    )
                );

            // ==============================================
            // VALIDAR TAMANHOS
            // ==============================================

            for (
                const tamanho
                of [
                    'P',
                    'M',
                    'G',
                    'GG'
                ]
            ) {

                if (
                    !mapaTamanhos.has(
                        tamanho
                    )
                ) {

                    throw new Error(
                        `O tamanho ${tamanho} não está cadastrado no banco.`
                    );
                }
            }

            // ==============================================
            // CRIAR ESTOQUE
            // ==============================================

            for (
                const tamanho
                of [
                    'P',
                    'M',
                    'G',
                    'GG'
                ]
            ) {

                await connection.execute(`
                    INSERT INTO produto_tamanhos (
                        produto_id,
                        tamanho_id,
                        estoque
                    )
                    VALUES (
                        ?,
                        ?,
                        ?
                    )
                `, [

                    produtoId,

                    mapaTamanhos.get(
                        tamanho
                    ),

                    estoques[
                        tamanho
                    ]

                ]);
            }

            // ==============================================
            // IMAGEM PRINCIPAL
            // ==============================================

            if (
                imagemCaminho
            ) {

                await connection.execute(`
                    INSERT INTO produto_imagens (

                        produto_id,

                        caminho,

                        texto_alternativo,

                        principal,

                        ordem

                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        TRUE,
                        1
                    )
                `, [

                    produtoId,

                    imagemCaminho,

                    nome

                ]);
            }

            // ==============================================
            // FINALIZAR
            // ==============================================

            await connection.commit();

            return produtoId;

        } catch (erro) {

            await connection.rollback();

            if (
                erro.code ===
                'ER_DUP_ENTRY'
            ) {

                const erroDuplicado =
                    new Error(
                        'Já existe uma camisa com esses dados.'
                    );

                erroDuplicado.status =
                    400;

                throw erroDuplicado;
            }

            throw erro;

        } finally {

            connection.release();
        }
    }

};

module.exports =
    AdminProduto;