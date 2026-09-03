const fs =
    require('fs');

const AdminProduto =
    require(
        '../models/AdminProduto'
    );

// ======================================================
// GERAR SLUG
// ======================================================

function gerarSlug(
    nome,
    tipoCamisa,
    codigo
) {

    return `${nome}-${tipoCamisa}-${codigo}`

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9]+/g,
            '-'
        )

        .replace(
            /^-+|-+$/g,
            ''
        );
}

// ======================================================
// DECIMAL
// ======================================================

function converterDecimal(
    valor,
    permitirVazio = false
) {

    const texto =
        String(
            valor ?? ''
        )
            .trim()
            .replace(
                ',',
                '.'
            );

    if (
        permitirVazio &&
        texto === ''
    ) {

        return null;
    }

    return Number(texto);
}

// ======================================================
// REMOVER UPLOAD NÃO UTILIZADO
// ======================================================

function removerUpload(
    arquivo
) {

    if (
        !arquivo ||
        !arquivo.path
    ) {

        return;
    }

    try {

        if (
            fs.existsSync(
                arquivo.path
            )
        ) {

            fs.unlinkSync(
                arquivo.path
            );
        }

    } catch (erro) {

        console.error(
            'Não foi possível remover upload temporário:',
            erro.message
        );
    }
}

// ======================================================
// VALORES INICIAIS
// ======================================================

function valoresPadrao() {

    return {

        codigo:
            '',

        nome:
            '',

        tipo_camisa:
            'Tailandesa',

        categoria_id:
            '',

        time_id:
            '',

        temporada:
            '',

        descricao:
            '',

        preco:
            '149.99',

        preco_promocional:
            '119.99',

        desconto_pix:
            '5',

        estoque_p:
            '0',

        estoque_m:
            '0',

        estoque_g:
            '0',

        estoque_gg:
            '0',

        destaque:
            false,

        mais_vendido:
            false

    };
}

// ======================================================
// RENDERIZAR FORMULÁRIO
// ======================================================

async function renderizarFormulario(
    res,
    {
        status = 200,
        erro = '',
        sucesso = false,
        valores = valoresPadrao()
    } = {}
) {

    const [
        categorias,
        times
    ] =
        await Promise.all([

            AdminProduto
                .listarCategorias(),

            AdminProduto
                .listarTimes()

        ]);

    return res
        .status(status)
        .render(
            'admin/produto-novo',
            {

                titulo:
                    'Nova camisa',

                paginaAtual:
                    'admin',

                categorias,

                times,

                valores,

                erro,

                sucesso

            }
        );
}

// ======================================================
// CONTROLLER
// ======================================================

const AdminProdutoController = {

    // ==================================================
    // TELA NOVO PRODUTO
    // ==================================================

    async novo(
        req,
        res,
        next
    ) {

        try {

            return await
                renderizarFormulario(
                    res,
                    {
                        sucesso:
                            req.query.sucesso ===
                            '1'
                    }
                );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // CRIAR PRODUTO
    // ==================================================

    async criar(
        req,
        res,
        next
    ) {

        const valores = {

            codigo:
                String(
                    req.body.codigo ||
                    ''
                )
                    .trim()
                    .toUpperCase()
                    .slice(
                        0,
                        50
                    ),

            nome:
                String(
                    req.body.nome ||
                    ''
                )
                    .trim()
                    .slice(
                        0,
                        180
                    ),

            tipo_camisa:
                String(
                    req.body.tipo_camisa ||
                    ''
                )
                    .trim(),

            categoria_id:
                String(
                    req.body.categoria_id ||
                    ''
                ),

            time_id:
                String(
                    req.body.time_id ||
                    ''
                ),

            temporada:
                String(
                    req.body.temporada ||
                    ''
                )
                    .trim()
                    .slice(
                        0,
                        30
                    ),

            descricao:
                String(
                    req.body.descricao ||
                    ''
                )
                    .trim()
                    .slice(
                        0,
                        5000
                    ),

            preco:
                String(
                    req.body.preco ||
                    ''
                ),

            preco_promocional:
                String(
                    req.body.preco_promocional ||
                    ''
                ),

            desconto_pix:
                String(
                    req.body.desconto_pix ||
                    '0'
                ),

            estoque_p:
                String(
                    req.body.estoque_p ??
                    '0'
                ),

            estoque_m:
                String(
                    req.body.estoque_m ??
                    '0'
                ),

            estoque_g:
                String(
                    req.body.estoque_g ??
                    '0'
                ),

            estoque_gg:
                String(
                    req.body.estoque_gg ??
                    '0'
                ),

            destaque:
                req.body.destaque ===
                '1',

            mais_vendido:
                req.body.mais_vendido ===
                '1'

        };

        try {

            // ==========================================
            // CONVERSÕES
            // ==========================================

            const categoriaId =
                Number(
                    valores.categoria_id
                );

            const timeId =
                valores.time_id
                    ? Number(
                        valores.time_id
                    )
                    : null;

            const preco =
                converterDecimal(
                    valores.preco
                );

            const precoPromocional =
                converterDecimal(
                    valores.preco_promocional,
                    true
                );

            const descontoPix =
                converterDecimal(
                    valores.desconto_pix
                );

            const estoques = {

                P:
                    Number(
                        valores.estoque_p
                    ),

                M:
                    Number(
                        valores.estoque_m
                    ),

                G:
                    Number(
                        valores.estoque_g
                    ),

                GG:
                    Number(
                        valores.estoque_gg
                    )

            };

            // ==========================================
            // CAMPOS OBRIGATÓRIOS
            // ==========================================

            if (
                !valores.codigo ||
                !valores.nome
            ) {

                throw Object.assign(
                    new Error(
                        'Código e nome são obrigatórios.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // TIPO
            // ==========================================

            if (
                valores.tipo_camisa !==
                    'Tailandesa' &&
                valores.tipo_camisa !==
                    'Nacional Premium'
            ) {

                throw Object.assign(
                    new Error(
                        'Tipo de camisa inválido.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // CATEGORIA
            // ==========================================

            if (
                !Number.isInteger(
                    categoriaId
                ) ||
                categoriaId <= 0
            ) {

                throw Object.assign(
                    new Error(
                        'Selecione uma categoria.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // TIME
            // ==========================================

            if (
                timeId !== null &&
                (
                    !Number.isInteger(
                        timeId
                    ) ||
                    timeId <= 0
                )
            ) {

                throw Object.assign(
                    new Error(
                        'Selecione um time válido.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // PREÇO
            // ==========================================

            if (
                !Number.isFinite(
                    preco
                ) ||
                preco <= 0
            ) {

                throw Object.assign(
                    new Error(
                        'O preço original deve ser maior que zero.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            if (
                precoPromocional !== null &&
                (
                    !Number.isFinite(
                        precoPromocional
                    ) ||
                    precoPromocional < 0
                )
            ) {

                throw Object.assign(
                    new Error(
                        'Preço promocional inválido.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            if (
                precoPromocional !== null &&
                precoPromocional >=
                    preco
            ) {

                throw Object.assign(
                    new Error(
                        'O preço promocional deve ser menor que o preço original.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // PIX
            // ==========================================

            if (
                !Number.isFinite(
                    descontoPix
                ) ||
                descontoPix < 0 ||
                descontoPix > 100
            ) {

                throw Object.assign(
                    new Error(
                        'O desconto Pix deve estar entre 0 e 100.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            // ==========================================
            // ESTOQUE
            // ==========================================

            for (
                const [
                    tamanho,
                    quantidade
                ]
                of Object.entries(
                    estoques
                )
            ) {

                if (
                    !Number.isInteger(
                        quantidade
                    ) ||
                    quantidade < 0
                ) {

                    throw Object.assign(
                        new Error(
                            `Estoque inválido para o tamanho ${tamanho}.`
                        ),
                        {
                            status: 400
                        }
                    );
                }
            }

            // ==========================================
            // SLUG
            // ==========================================

            const slug =
                gerarSlug(

                    valores.nome,

                    valores.tipo_camisa,

                    valores.codigo

                );

            // ==========================================
            // IMAGEM
            // ==========================================

            const imagemCaminho =
                req.file
                    ? `/images/produtos/uploads/${req.file.filename}`
                    : null;

            // ==========================================
            // CADASTRAR
            // ==========================================

            await AdminProduto.criar({

                codigo:
                    valores.codigo,

                nome:
                    valores.nome,

                slug,

                timeId,

                categoriaId,

                temporada:
                    valores.temporada ||
                    null,

                descricao:
                    valores.descricao ||
                    null,

                tipoCamisa:
                    valores.tipo_camisa,

                preco,

                precoPromocional,

                descontoPix,

                destaque:
                    valores.destaque
                        ? 1
                        : 0,

                maisVendido:
                    valores.mais_vendido
                        ? 1
                        : 0,

                imagemCaminho,

                estoques

            });

            return res.redirect(
                '/admin/produtos/novo?sucesso=1'
            );

        } catch (erro) {

            removerUpload(
                req.file
            );

            if (
                erro.status === 400
            ) {

                try {

                    return await
                        renderizarFormulario(
                            res,
                            {

                                status:
                                    400,

                                erro:
                                    erro.message,

                                valores

                            }
                        );

                } catch (
                    erroFormulario
                ) {

                    return next(
                        erroFormulario
                    );
                }
            }

            return next(erro);
        }
    }

};

module.exports =
    AdminProdutoController;