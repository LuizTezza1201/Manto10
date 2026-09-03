const Usuario =
    require('../models/Usuario');

const Pagamento =
    require('../models/Pagamento');

const InfinitePayService =
    require(
        '../services/InfinitePayService'
    );


const InfinitePayController = {

    // ==================================================
    // ABRIR CHECKOUT
    // ==================================================

    async iniciar(
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


            const pedido =
                await Usuario
                    .buscarPedidoDoUsuario(
                        pedidoId,
                        usuarioId
                    );


            if (!pedido) {

                return res
                    .status(404)
                    .send(
                        'Pedido não encontrado.'
                    );
            }


            if (
                pedido.status !==
                'Pendente'
            ) {

                return res.redirect(
                    `/minha-conta/pedidos/${pedido.id}`
                );
            }


            const itens =
                await Usuario
                    .listarItensPedido(
                        pedidoId
                    );


            if (
                itens.length === 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Este pedido não possui produtos.'
                    );
            }


            const url =
                await InfinitePayService
                    .criarLinkPagamento({

                        numeroPedido:
                            pedido.numero_pedido,

                        itens,

                        cliente: {

                            nome:
                                req.session
                                    .usuario.nome,

                            email:
                                req.session
                                    .usuario.email
                        },

                        endereco: {

                            cep:
                                pedido.cep,

                            logradouro:
                                pedido.logradouro,

                            numero:
                                pedido.endereco_numero,

                            complemento:
                                pedido.complemento,

                            bairro:
                                pedido.bairro
                        }

                    });


            return res.redirect(
                url
            );


        } catch (erro) {

            if (
                erro.status === 500 ||
                erro.status === 502
            ) {

                console.error(
                    'Erro InfinitePay:',
                    erro
                );


                return res
                    .status(
                        erro.status
                    )
                    .render(
                        'pagamento/erro',
                        {

                            titulo:
                                'Pagamento',

                            paginaAtual:
                                'pagamento',

                            mensagem:
                                erro.message,

                            pedidoId:
                                req.params.id
                        }
                    );
            }


            return next(erro);
        }
    },


    // ==================================================
    // RETORNO DA INFINITEPAY
    // ==================================================

    async retorno(
        req,
        res,
        next
    ) {

        try {

            const usuarioId =
                req.session.usuario.id;


            const orderNsu =
                String(
                    req.query.order_nsu ||
                    ''
                ).trim();


            const transactionNsu =
                String(
                    req.query.transaction_nsu ||
                    ''
                ).trim();


            const slug =
                String(
                    req.query.slug ||
                    ''
                ).trim();


            const captureMethodUrl =
                String(
                    req.query.capture_method ||
                    ''
                ).trim();


            const receiptUrl =
                String(
                    req.query.receipt_url ||
                    ''
                ).trim();


            if (
                !orderNsu ||
                !transactionNsu ||
                !slug
            ) {

                return res
                    .status(400)
                    .send(
                        'Retorno de pagamento inválido.'
                    );
            }


            // ==========================================
            // NÃO CONFIAR SOMENTE NA URL
            // ==========================================

            const verificacao =
                await InfinitePayService
                    .verificarPagamento({

                        orderNsu,

                        transactionNsu,

                        slug
                    });


            if (
                !verificacao.success ||
                !verificacao.paid
            ) {

                return res.render(
                    'pagamento/nao-confirmado',
                    {

                        titulo:
                            'Pagamento não confirmado',

                        paginaAtual:
                            'pagamento',

                        orderNsu
                    }
                );
            }


            // ==========================================
            // CONFIRMAR NO NOSSO BANCO
            // ==========================================

            const pagamento =
                await Pagamento
                    .confirmarInfinitePay({

                        usuarioId,

                        numeroPedido:
                            orderNsu,

                        transactionNsu,

                        invoiceSlug:
                            slug,

                        comprovanteUrl:
                            receiptUrl,

                        captureMethod:
                            verificacao
                                .captureMethod ||
                            captureMethodUrl,

                        amountCentavos:
                            verificacao.amount
                    });


            return res.render(
                'pagamento/sucesso',
                {

                    titulo:
                        'Pagamento confirmado',

                    paginaAtual:
                        'pagamento',

                    pagamento,

                    comprovanteUrl:
                        receiptUrl
                }
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
    }

};


module.exports =
    InfinitePayController;