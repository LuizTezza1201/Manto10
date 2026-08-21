const Carrinho = require(
    '../models/Carrinho'
);

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}

async function montarResumo(
    usuarioId
) {

    const itensBanco =
        await Carrinho.listarItens(
            usuarioId
        );

    let subtotal = 0;
    let quantidadeTotal = 0;

    const itens =
        itensBanco.map(
            (item) => {

                const preco =
                    Number(
                        item.preco_unitario
                    );

                const quantidade =
                    Number(
                        item.quantidade
                    );

                const subtotalItem =
                    preco * quantidade;

                subtotal +=
                    subtotalItem;

                quantidadeTotal +=
                    quantidade;

                return {

                    itemId:
                        item.item_id,

                    produtoId:
                        item.produto_id,

                    produtoTamanhoId:
                        item.produto_tamanho_id,

                    codigo:
                        item.codigo,

                    nome:
                        item.nome,

                    slug:
                        item.slug,

                    tipoCamisa:
                        item.tipo_camisa,

                    tamanho:
                        item.tamanho,

                    quantidade,

                    estoque:
                        Number(
                            item.estoque
                        ),

                    preco,

                    precoFormatado:
                        formatarMoeda(
                            preco
                        ),

                    subtotal:
                        subtotalItem,

                    subtotalFormatado:
                        formatarMoeda(
                            subtotalItem
                        ),

                    imagem:
                        item.imagem ||
                        '/images/produtos/placeholder.svg'
                };
            }
        );

    return {

        autenticado: true,

        quantidade:
            quantidadeTotal,

        subtotal,

        subtotalFormatado:
            formatarMoeda(
                subtotal
            ),

        total:
            subtotal,

        totalFormatado:
            formatarMoeda(
                subtotal
            ),

        itens
    };
}

const CarrinhoController = {

    // ======================================================
    // PÁGINA COMPLETA
    // ======================================================

    async pagina(
        req,
        res,
        next
    ) {

        try {

            const carrinho =
                await montarResumo(
                    req.session.usuario.id
                );

            return res.render(
                'carrinho/index',
                {
                    titulo:
                        'Carrinho',

                    paginaAtual:
                        'carrinho',

                    carrinho
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ======================================================
    // RESUMO
    // ======================================================

    async resumo(
        req,
        res,
        next
    ) {

        try {

            if (
                !req.session.usuario
            ) {

                return res.json({

                    autenticado: false,

                    quantidade: 0,

                    subtotal: 0,

                    subtotalFormatado:
                        'R$ 0,00',

                    total: 0,

                    totalFormatado:
                        'R$ 0,00',

                    itens: []
                });
            }

            const resumo =
                await montarResumo(
                    req.session.usuario.id
                );

            return res.json(
                resumo
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ======================================================
    // ADICIONAR
    // ======================================================

    async adicionar(
        req,
        res,
        next
    ) {

        try {

            const produtoTamanhoId =
                Number(
                    req.body
                        .produto_tamanho_id
                );

            const quantidade =
                Number(
                    req.body.quantidade
                );

            if (
                !Number.isInteger(
                    produtoTamanhoId
                ) ||
                produtoTamanhoId <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            'Selecione um tamanho válido.'
                    });
            }

            if (
                !Number.isInteger(
                    quantidade
                ) ||
                quantidade < 1
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            'Quantidade inválida.'
                    });
            }

            await Carrinho.adicionarItem({

                usuarioId:
                    req.session.usuario.id,

                produtoTamanhoId,

                quantidade
            });

            const carrinho =
                await montarResumo(
                    req.session.usuario.id
                );

            return res
                .status(201)
                .json({

                    sucesso: true,

                    mensagem:
                        'Produto adicionado ao carrinho.',

                    carrinho
                });

        } catch (erro) {

            if (erro.status) {

                return res
                    .status(
                        erro.status
                    )
                    .json({
                        sucesso: false,
                        mensagem:
                            erro.message
                    });
            }

            return next(erro);
        }
    },

    // ======================================================
    // ALTERAR QUANTIDADE
    // ======================================================

    async atualizarQuantidade(
        req,
        res,
        next
    ) {

        try {

            const itemId =
                Number(
                    req.params.id
                );

            const quantidade =
                Number(
                    req.body.quantidade
                );

            if (
                !Number.isInteger(
                    itemId
                ) ||
                itemId <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            'Item inválido.'
                    });
            }

            if (
                !Number.isInteger(
                    quantidade
                ) ||
                quantidade < 1
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            'Quantidade inválida.'
                    });
            }

            await Carrinho
                .atualizarQuantidade({

                    usuarioId:
                        req.session
                            .usuario.id,

                    itemId,

                    quantidade
                });

            const carrinho =
                await montarResumo(
                    req.session.usuario.id
                );

            return res.json({

                sucesso: true,

                carrinho
            });

        } catch (erro) {

            if (erro.status) {

                return res
                    .status(
                        erro.status
                    )
                    .json({
                        sucesso: false,
                        mensagem:
                            erro.message
                    });
            }

            return next(erro);
        }
    },

    // ======================================================
    // REMOVER
    // ======================================================

    async remover(
        req,
        res,
        next
    ) {

        try {

            const itemId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    itemId
                ) ||
                itemId <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            'Item inválido.'
                    });
            }

            await Carrinho.removerItem({

                usuarioId:
                    req.session.usuario.id,

                itemId
            });

            const carrinho =
                await montarResumo(
                    req.session.usuario.id
                );

            return res.json({

                sucesso: true,

                mensagem:
                    'Produto removido do carrinho.',

                carrinho
            });

        } catch (erro) {

            if (erro.status) {

                return res
                    .status(
                        erro.status
                    )
                    .json({
                        sucesso: false,
                        mensagem:
                            erro.message
                    });
            }

            return next(erro);
        }
    }

};

module.exports =
    CarrinhoController;