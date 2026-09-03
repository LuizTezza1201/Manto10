const AdminPedido =
    require(
        '../models/AdminPedido'
    );

    const Pedido =
    require('../models/Pedido');

// ======================================================
// FORMATAR MOEDA
// ======================================================

function formatarMoeda(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
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

const AdminPedidoController = {

    // ==================================================
    // LISTAR
    // ==================================================

    async listar(
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

            const status =
                String(
                    req.query.status || ''
                );

            const ordem =
                String(
                    req.query.ordem ||
                    'recentes'
                );

            const pedidosBanco =
                await AdminPedido.listar({
                    busca,
                    status,
                    ordem
                });

            const pedidos =
                pedidosBanco.map(
                    pedido => ({

                        ...pedido,

                        total_itens:
                            Number(
                                pedido.total_itens ||
                                0
                            ),

                        total_formatado:
                            formatarMoeda(
                                pedido.total
                            ),

                        criado_em_formatado:
                            formatarDataHora(
                                pedido.criado_em
                            )

                    })
                );

            return res.render(
                'admin/pedidos',
                {

                    titulo:
                        'Pedidos',

                    paginaAtual:
                        'admin',

                    pedidos,

                    filtros: {
                        busca,
                        status,
                        ordem
                    },

                    sucesso:
                        req.query.sucesso ===
                        'status'

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
// CANCELAR / RESTITUIR ESTOQUE
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

                somentePendente:
                    false
            });


        return res.redirect(
            `/admin/pedidos/${pedidoId}?sucesso=cancelamento`
        );


    } catch (erro) {

        if (
            erro.status === 400 ||
            erro.status === 404
        ) {

            return res
                .status(
                    erro.status
                )
                .send(
                    erro.message
                );
        }


        return next(erro);
    }
},

    // ==================================================
    // DETALHES
    // ==================================================

    async detalhes(
        req,
        res,
        next
    ) {

        try {

            const pedidoId =
                Number(
                    req.params.id
                );

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

            const [
                pedidoBanco,
                itensBanco
            ] =
                await Promise.all([

                    AdminPedido
                        .buscarPorId(
                            pedidoId
                        ),

                    AdminPedido
                        .listarItens(
                            pedidoId
                        )

                ]);

            if (!pedidoBanco) {

                return res
                    .status(404)
                    .send(
                        'Pedido não encontrado.'
                    );
            }

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

                pagamento_valor_formatado:
                    formatarMoeda(
                        pedidoBanco.pagamento_valor
                    ),

                criado_em_formatado:
                    formatarDataHora(
                        pedidoBanco.criado_em
                    ),

                atualizado_em_formatado:
                    formatarDataHora(
                        pedidoBanco.atualizado_em
                    ),

                pago_em_formatado:
                    pedidoBanco.pago_em
                        ? formatarDataHora(
                            pedidoBanco.pago_em
                        )
                        : ''

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
                'admin/pedido-detalhe',
                {

                    titulo:
                        `Pedido ${pedido.numero_pedido}`,

                    paginaAtual:
                        'admin',

                    pedido,

                    itens,

                    sucesso:
    req.query.sucesso || ''

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // ATUALIZAR STATUS
    // ==================================================

    async atualizarStatus(
        req,
        res,
        next
    ) {

        try {

            const pedidoId =
                Number(
                    req.params.id
                );

            const novoStatus =
                String(
                    req.body.status || ''
                );

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

            await AdminPedido
                .atualizarStatus(
                    pedidoId,
                    novoStatus
                );

            return res.redirect(
                `/admin/pedidos/${pedidoId}?sucesso=status`
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

module.exports =
    AdminPedidoController;