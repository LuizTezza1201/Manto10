const Usuario = require('../models/Usuario');

const Pedido =
    require('../models/Pedido');

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
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) {
        return '';
    }

    return new Date(data)
        .toLocaleDateString('pt-BR');
}


// ======================================================
// FORMATAR DATA E HORA
// ======================================================

function formatarDataHora(data) {

    if (!data) {
        return '';
    }

    return new Date(data)
        .toLocaleString(
            'pt-BR',
            {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        );
}


// ======================================================
// CONTROLLER
// ======================================================

const ContaController = {

    // ==================================================
    // MINHA CONTA
    // ==================================================

    async inicio(req, res, next) {

        try {

            const usuarioId =
                req.session.usuario.id;

            const [
                usuario,
                pedidosBanco
            ] = await Promise.all([

                Usuario.buscarPorId(
                    usuarioId
                ),

                Usuario.listarPedidos(
                    usuarioId
                )

            ]);

            if (!usuario) {

                return res
                    .status(404)
                    .send(
                        'Usuário não encontrado.'
                    );
            }

            const pedidos =
                pedidosBanco.map(
                    pedido => ({

                        ...pedido,

                        total_itens:
                            Number(
                                pedido.total_itens || 0
                            ),

                        total_formatado:
                            formatarMoeda(
                                pedido.total
                            ),

                        data_formatada:
                            formatarData(
                                pedido.criado_em
                            )

                    })
                );

            return res.render(
                'conta/inicio',
                {

                    titulo:
                        'Minha conta',

                    paginaAtual:
                        'conta',

                    contaUsuario:
                        usuario,

                    pedidos,

                    totalPedidos:
                        pedidos.length

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },


    // ==================================================
    // DETALHES DO PEDIDO
    // ==================================================

    async pedidoDetalhe(
        req,
        res,
        next
    ) {

        try {

            const pedidoId =
                Number(
                    req.params.id
                );

            const usuarioId =
                req.session.usuario.id;

            if (
                !Number.isInteger(
                    pedidoId
                ) ||
                pedidoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Pedido inválido.'
                    );
            }

            const pedidoBanco =
                await Usuario
                    .buscarPedidoDoUsuario(
                        pedidoId,
                        usuarioId
                    );

            /*
             * IMPORTANTE:
             *
             * A consulta verifica simultaneamente
             * pedido_id + usuario_id.
             *
             * Portanto, um cliente não consegue
             * acessar o pedido de outro usuário
             * mudando apenas o número da URL.
             */

            if (!pedidoBanco) {

                return res
                    .status(404)
                    .send(
                        'Pedido não encontrado.'
                    );
            }

            const itensBanco =
                await Usuario
                    .listarItensPedido(
                        pedidoId
                    );

            const pedido = {

                ...pedidoBanco,

                subtotal_formatado:
                    formatarMoeda(
                        pedidoBanco.subtotal
                    ),

                frete_formatado:
                    formatarMoeda(
                        pedidoBanco.frete
                    ),

                desconto_formatado:
                    formatarMoeda(
                        pedidoBanco.desconto
                    ),

                total_formatado:
                    formatarMoeda(
                        pedidoBanco.total
                    ),

                criado_em_formatado:
                    formatarDataHora(
                        pedidoBanco.criado_em
                    )

            };

            const itens =
                itensBanco.map(
                    item => ({

                        ...item,

                        preco_unitario_formatado:
                            formatarMoeda(
                                item.preco_unitario
                            ),

                        subtotal_formatado:
                            formatarMoeda(
                                item.subtotal
                            )

                    })
                );

            return res.render(
                'conta/pedido-detalhe',
                {

                    titulo:
                        `Pedido ${pedido.numero_pedido}`,

                    paginaAtual:
                        'conta',

                    pedido,

                    itens

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
// CANCELAR PEDIDO
// ==================================================

async cancelarPedido(
    req,
    res,
    next
) {

    try {

        const pedidoId =
            Number(
                req.params.id
            );

        const usuarioId =
            req.session.usuario.id;


        if (
            !Number.isInteger(
                pedidoId
            ) ||
            pedidoId <= 0
        ) {

            return res
                .status(400)
                .send(
                    'Pedido inválido.'
                );
        }


        await Pedido
            .cancelarERestituirEstoque({

                pedidoId,

                usuarioId,

                somentePendente:
                    true
            });


        return res.redirect(
            `/minha-conta/pedidos/${pedidoId}?cancelado=1`
        );


    } catch (erro) {

        if (
            erro.status === 400
        ) {

            return res
                .status(400)
                .send(
                    erro.message
                );
        }


        if (
            erro.status === 404
        ) {

            return res
                .status(404)
                .send(
                    erro.message
                );
        }


        return next(erro);
    }
}

};

module.exports = ContaController;