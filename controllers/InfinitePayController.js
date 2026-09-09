const Usuario =
    require('../models/Usuario');

const Pagamento =
    require('../models/Pagamento');

const InfinitePayService =
    require(
        '../services/InfinitePayService'
    );


// ======================================================
// LER CAMPOS DA INFINITEPAY
// ======================================================

function lerDadosPagamento(
    origem,
    origemWebhook = false
) {

    const orderNsu =
        String(
            origem.order_nsu || ''
        ).trim();

    const transactionNsu =
        String(
            origem.transaction_nsu || ''
        ).trim();

    const invoiceSlug =
        String(
            origemWebhook
                ? origem.invoice_slug || ''
                : origem.slug || ''
        ).trim();

    const captureMethod =
        String(
            origem.capture_method || ''
        ).trim();

    const receiptUrl =
        String(
            origem.receipt_url || ''
        ).trim();


    return {
        orderNsu,
        transactionNsu,
        invoiceSlug,
        captureMethod,
        receiptUrl
    };
}


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
                                    .usuario.email,

                            telefone:
                                req.session
                                    .usuario.telefone
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

            const {
                orderNsu,
                transactionNsu,
                invoiceSlug,
                captureMethod,
                receiptUrl
            } =
                lerDadosPagamento(
                    req.query
                );


            if (
                !orderNsu ||
                !transactionNsu ||
                !invoiceSlug
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

                        slug:
                            invoiceSlug
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

                        numeroPedido:
                            orderNsu,

                        transactionNsu,

                        invoiceSlug,

                        comprovanteUrl:
                            receiptUrl,

                        captureMethod:
                            verificacao
                                .captureMethod ||
                            captureMethod,

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
                erro.status === 404 ||
                erro.status === 409
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
    // WEBHOOK DA INFINITEPAY
    // ==================================================

    async webhook(
        req,
        res
    ) {

        try {

            const {
                orderNsu,
                transactionNsu,
                invoiceSlug,
                captureMethod,
                receiptUrl
            } =
                lerDadosPagamento(
                    req.body,
                    true
                );


            if (
                !orderNsu ||
                !transactionNsu ||
                !invoiceSlug
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            'Dados do webhook inválidos.'
                    });
            }


            // ==========================================
            // CONFIRMAR DIRETAMENTE COM A INFINITEPAY
            // ==========================================

            const verificacao =
                await InfinitePayService
                    .verificarPagamento({

                        orderNsu,

                        transactionNsu,

                        slug:
                            invoiceSlug
                    });


            if (
                !verificacao.success ||
                !verificacao.paid
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            'Pagamento ainda não confirmado.'
                    });
            }


            // ==========================================
            // REGISTRAR DE FORMA IDEMPOTENTE
            // ==========================================

            const pagamento =
                await Pagamento
                    .confirmarInfinitePay({

                        numeroPedido:
                            orderNsu,

                        transactionNsu,

                        invoiceSlug,

                        comprovanteUrl:
                            receiptUrl,

                        captureMethod:
                            verificacao
                                .captureMethod ||
                            captureMethod,

                        amountCentavos:
                            verificacao.amount
                    });


            console.log(
                `Pagamento confirmado por webhook: ${pagamento.numeroPedido}`
            );


            return res
                .status(200)
                .json({
                    success: true,
                    message: null
                });


        } catch (erro) {

            console.error(
                'Erro no webhook InfinitePay:',
                erro
            );


            /*
             * A InfinitePay informa que, ao receber
             * resposta de erro, fará uma nova tentativa.
             */

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        erro.message ||
                        'Não foi possível processar o pagamento.'
                });
        }
    }

};


module.exports =
    InfinitePayController;
