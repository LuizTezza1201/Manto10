const Admin =
    require('../models/Admin');

const Produto =
    require('../models/Produto');

// ======================================================
// FORMATAR MOEDA
// ======================================================

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        );
}

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
// CONVERTER VALOR DECIMAL
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
            .replace(',', '.');

    if (
        permitirVazio &&
        texto === ''
    ) {

        return null;
    }

    return Number(texto);
}

// ======================================================
// ADMIN CONTROLLER
// ======================================================

const AdminController = {

    // ==================================================
    // DASHBOARD
    // ==================================================

    async inicio(
    req,
    res,
    next
) {

    try {

        const resumo =
            await Admin.obterResumo();

        resumo.totalVendasFormatado =
            formatarMoeda(
                resumo.totalVendas
            );

        resumo.vendasHojeFormatado =
            formatarMoeda(
                resumo.vendasHoje
            );

        resumo.vendasSemanaFormatado =
            formatarMoeda(
                resumo.vendasSemana
            );

        resumo.vendasMesFormatado =
            formatarMoeda(
                resumo.vendasMes
            );

        resumo.vendasAnoFormatado =
            formatarMoeda(
                resumo.vendasAno
            );

        return res.render(
            'admin/inicio',
            {
                titulo:
                    'Dashboard',

                paginaAtual:
                    'admin',

                resumo
            }
        );

    } catch (erro) {

        return next(erro);
    }
},

    // ==================================================
    // LISTAR PRODUTOS
    // ==================================================

    async produtos(
        req,
        res,
        next
    ) {

        try {

            const busca =
                String(
                    req.query.busca || ''
                )
                    .trim()
                    .slice(0, 100);

            const tipo =
                String(
                    req.query.tipo || ''
                );

            const status =
                String(
                    req.query.status || ''
                );

            const estoque =
                String(
                    req.query.estoque || ''
                );

            const ordem =
                String(
                    req.query.ordem || 'az'
                );

            const produtos =
                await Produto.listarAdmin({
                    busca,
                    tipo,
                    status,
                    estoque,
                    ordem
                });

            const mensagens = {

                estoque:
                    'Estoque atualizado com sucesso.',

                dados:
                    'Camisa atualizada com sucesso.',

                status:
                    'Status da camisa atualizado com sucesso.'
            };

            const mensagemSucesso =
                mensagens[
                    req.query.sucesso
                ] || '';

            return res.render(
                'admin/produtos',
                {
                    titulo:
                        'Gerenciar camisas',

                    paginaAtual:
                        'admin',

                    produtos,

                    filtros: {
                        busca,
                        tipo,
                        status,
                        estoque,
                        ordem
                    },

                    mensagemSucesso
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // ATUALIZAR ESTOQUE
    // ==================================================

    async atualizarEstoque(
        req,
        res,
        next
    ) {

        try {

            const produtoId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    produtoId
                ) ||
                produtoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Produto inválido.'
                    );
            }

            const campos = {

                P:
                    req.body.estoque_p,

                M:
                    req.body.estoque_m,

                G:
                    req.body.estoque_g,

                GG:
                    req.body.estoque_gg
            };

            const estoques = {};

            for (
                const [
                    tamanho,
                    valor
                ]
                of Object.entries(
                    campos
                )
            ) {

                const quantidade =
                    Number(valor);

                if (
                    !Number.isInteger(
                        quantidade
                    ) ||
                    quantidade < 0
                ) {

                    return res
                        .status(400)
                        .send(
                            `Estoque inválido para tamanho ${tamanho}.`
                        );
                }

                estoques[tamanho] =
                    quantidade;
            }

            await Produto
                .atualizarEstoqueAdmin({
                    produtoId,
                    estoques
                });

            return res.redirect(
                '/admin/produtos?sucesso=estoque'
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // TELA DE EDIÇÃO
    // ==================================================

    async editarProduto(
        req,
        res,
        next
    ) {

        try {

            const produtoId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    produtoId
                ) ||
                produtoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Produto inválido.'
                    );
            }

            const [
                produto,
                categorias,
                times
            ] =
                await Promise.all([

                    Produto
                        .buscarPorIdAdmin(
                            produtoId
                        ),

                    Produto
                        .listarCategoriasAdmin(),

                    Produto
                        .listarTimesAdmin()

                ]);

            if (!produto) {

                return res
                    .status(404)
                    .send(
                        'Produto não encontrado.'
                    );
            }

            return res.render(
                'admin/produto-editar',
                {
                    titulo:
                        'Editar camisa',

                    paginaAtual:
                        'admin',

                    produto,

                    categorias,

                    times,

                    erro:
                        '',

                    sucesso:
                        req.query.sucesso ===
                        'dados'
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // SALVAR EDIÇÃO
    // ==================================================

    async salvarProduto(
        req,
        res,
        next
    ) {

        const produtoId =
            Number(
                req.params.id
            );

        try {

            if (
                !Number.isInteger(
                    produtoId
                ) ||
                produtoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Produto inválido.'
                    );
            }

            const codigo =
                String(
                    req.body.codigo || ''
                )
                    .trim()
                    .slice(0, 50);

            const nome =
                String(
                    req.body.nome || ''
                )
                    .trim()
                    .slice(0, 180);

            const tipoCamisa =
                String(
                    req.body.tipo_camisa || ''
                )
                    .trim();

            const categoriaId =
                Number(
                    req.body.categoria_id
                );

            const timeId =
                req.body.time_id
                    ? Number(
                        req.body.time_id
                    )
                    : null;

            const temporada =
                String(
                    req.body.temporada || ''
                )
                    .trim()
                    .slice(0, 30) ||
                null;

            const descricao =
                String(
                    req.body.descricao || ''
                )
                    .trim() ||
                null;

            const preco =
                converterDecimal(
                    req.body.preco
                );

            const precoPromocional =
                converterDecimal(
                    req.body.preco_promocional,
                    true
                );

            const descontoPix =
                converterDecimal(
                    req.body.desconto_pix || 0
                );

            const destaque =
                req.body.destaque === '1'
                    ? 1
                    : 0;

            const maisVendido =
                req.body.mais_vendido === '1'
                    ? 1
                    : 0;

            // ==========================================
            // VALIDAÇÕES
            // ==========================================

            if (
                !codigo ||
                !nome
            ) {

                throw Object.assign(
                    new Error(
                        'Nome e código são obrigatórios.'
                    ),
                    {
                        status: 400
                    }
                );
            }

            if (
                tipoCamisa !==
                    'Tailandesa' &&
                tipoCamisa !==
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

            if (
                !Number.isInteger(
                    categoriaId
                ) ||
                categoriaId <= 0
            ) {

                throw Object.assign(
                    new Error(
                        'Selecione uma categoria válida.'
                    ),
                    {
                        status: 400
                    }
                );
            }

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

            if (
                !Number.isFinite(
                    preco
                ) ||
                preco <= 0
            ) {

                throw Object.assign(
                    new Error(
                        'O preço deve ser maior que zero.'
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
                precoPromocional >= preco
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

            const slug =
                gerarSlug(
                    nome,
                    tipoCamisa,
                    codigo
                );

            await Produto
                .atualizarDadosAdmin({

                    produtoId,

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
                });

            return res.redirect(
                `/admin/produtos/${produtoId}/editar?sucesso=dados`
            );

        } catch (erro) {

            if (
                erro.status === 400
            ) {

                try {

                    const [
                        produto,
                        categorias,
                        times
                    ] =
                        await Promise.all([

                            Produto
                                .buscarPorIdAdmin(
                                    produtoId
                                ),

                            Produto
                                .listarCategoriasAdmin(),

                            Produto
                                .listarTimesAdmin()

                        ]);

                    if (!produto) {

                        return res
                            .status(404)
                            .send(
                                'Produto não encontrado.'
                            );
                    }

                    return res
                        .status(400)
                        .render(
                            'admin/produto-editar',
                            {
                                titulo:
                                    'Editar camisa',

                                paginaAtual:
                                    'admin',

                                produto,

                                categorias,

                                times,

                                erro:
                                    erro.message,

                                sucesso:
                                    false
                            }
                        );

                } catch (
                    erroCarregamento
                ) {

                    return next(
                        erroCarregamento
                    );
                }
            }

            return next(erro);
        }
    },

    // ==================================================
    // ATIVAR / DESATIVAR
    // ==================================================

    async alternarStatusProduto(
        req,
        res,
        next
    ) {

        try {

            const produtoId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    produtoId
                ) ||
                produtoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Produto inválido.'
                    );
            }

            await Produto
                .alternarStatusAdmin(
                    produtoId
                );

            return res.redirect(
                '/admin/produtos?sucesso=status'
            );

        } catch (erro) {

            return next(erro);
        }
    }

};

module.exports =
    AdminController;