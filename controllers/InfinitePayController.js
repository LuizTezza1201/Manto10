// ============================================================
// CONTROLLER DE PAGAMENTOS - INFINITEPAY
// ============================================================

const Usuario = require('../models/Usuario');
const Pagamento = require('../models/Pagamento');
const InfinitePayService = require('../services/InfinitePayService');


// ============================================================
// LEITURA DOS DADOS RECEBIDOS DA INFINITEPAY
// ============================================================

// O retorno pelo navegador e o webhook utilizam nomes
// ligeiramente diferentes para alguns campos.
//
// Esta função centraliza a leitura desses dados e evita
// repetir a mesma lógica nos dois fluxos.
function limparUrlComprovante(url) {
    try {
        const parsed = new URL(String(url || '').trim());

        return ['http:', 'https:'].includes(parsed.protocol)
            ? parsed.toString()
            : '';
    } catch {
        return '';
    }
}

function lerDadosPagamento(origem, origemWebhook = false) {
    const orderNsu = String(
        origem.order_nsu || ''
    ).trim();

    const transactionNsu = String(
        origem.transaction_nsu || ''
    ).trim();

    const invoiceSlug = String(
        origemWebhook
            ? origem.invoice_slug || ''
            : origem.slug || ''
    ).trim();

    const captureMethod = String(
        origem.capture_method || ''
    ).trim();

    const receiptUrl = limparUrlComprovante(
        origem.receipt_url
    );

    return {
        orderNsu,
        transactionNsu,
        invoiceSlug,
        captureMethod,
        receiptUrl
    };
}


// ============================================================
// CONTROLLER
// ============================================================

const InfinitePayController = {

    // ========================================================
    // INICIAR PAGAMENTO
    // ========================================================

    // Confere se o pedido pertence ao usuário autenticado
    // e solicita à InfinitePay a criação do checkout.
    async iniciar(req, res, next) {
        try {
            const pedidoId = Number(req.params.id);
            const usuarioId = req.session.usuario.id;

            // O ID recebido pela URL precisa representar
            // um pedido válido.
            if (
                !Number.isInteger(pedidoId) ||
                pedidoId <= 0
            ) {
                return res
                    .status(400)
                    .send('Pedido inválido.');
            }

            // Impede que um cliente tente pagar um pedido
            // pertencente a outro usuário.
            const pedido =
                await Usuario.buscarPedidoDoUsuario(
                    pedidoId,
                    usuarioId
                );

            if (!pedido) {
                return res
                    .status(404)
                    .send('Pedido não encontrado.');
            }

            // Apenas pedidos pendentes podem iniciar
            // uma nova tentativa de pagamento.
            if (pedido.status !== 'Pendente') {
                return res.redirect(
                    `/minha-conta/pedidos/${pedido.id}`
                );
            }

            const itens =
                await Usuario.listarItensPedido(
                    pedidoId
                );

            if (itens.length === 0) {
                return res
                    .status(400)
                    .send(
                        'Este pedido não possui produtos.'
                    );
            }

            // Cria o checkout utilizando os dados do pedido,
            // cliente, produtos e endereço de entrega.
            const url =
                await InfinitePayService.criarLinkPagamento({
                    numeroPedido:
                        pedido.numero_pedido,

                    itens,

                    cliente: {
                        nome:
                            req.session.usuario.nome,

                        email:
                            req.session.usuario.email,

                        telefone:
                            req.session.usuario.telefone
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

            // O cliente é enviado para o checkout
            // hospedado pela InfinitePay.
            return res.redirect(url);

        } catch (erro) {
            // Erros relacionados à criação do checkout
            // recebem uma página específica de pagamento.
            if (
                erro.status === 500 ||
                erro.status === 502
            ) {
                console.error(
                    'Erro InfinitePay:',
                    erro
                );

                return res
                    .status(erro.status)
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


    // ========================================================
    // RETORNO DO PAGAMENTO
    // ========================================================

    // Esta ação é executada quando o cliente retorna
    // da InfinitePay para a Manto 10.
    async retorno(req, res, next) {
        try {
            const {
                orderNsu,
                transactionNsu,
                invoiceSlug,
                captureMethod,
                receiptUrl
            } = lerDadosPagamento(req.query);

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


            // =================================================
            // VERIFICAÇÃO DIRETA COM A INFINITEPAY
            // =================================================

            // Os parâmetros da URL não são considerados
            // suficientes para aprovar um pagamento.
            //
            // O servidor consulta diretamente a InfinitePay
            // para verificar se a transação realmente foi paga.
            const verificacao =
                await InfinitePayService.verificarPagamento({
                    orderNsu,
                    transactionNsu,
                    slug: invoiceSlug
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


            // =================================================
            // CONFIRMAÇÃO NO BANCO DA MANTO 10
            // =================================================

            const pagamento =
                await Pagamento.confirmarInfinitePay({
                    numeroPedido:
                        orderNsu,

                    transactionNsu,

                    invoiceSlug,

                    comprovanteUrl:
                        receiptUrl,

                    captureMethod:
                        verificacao.captureMethod ||
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
            // Erros previstos do fluxo são apresentados
            // diretamente ao cliente.
            if (
                erro.status === 400 ||
                erro.status === 404 ||
                erro.status === 409
            ) {
                return res
                    .status(erro.status)
                    .send(erro.message);
            }

            return next(erro);
        }
    },


    // ========================================================
    // WEBHOOK DA INFINITEPAY
    // ========================================================

    // O webhook permite que a InfinitePay confirme o pagamento
    // diretamente com o servidor da Manto 10.
    //
    // Dessa forma, a confirmação não depende de o cliente
    // retornar ao site depois de realizar o pagamento.
    async webhook(req, res) {
        try {
            const {
                orderNsu,
                transactionNsu,
                invoiceSlug,
                captureMethod,
                receiptUrl
            } = lerDadosPagamento(
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


            // =================================================
            // VERIFICAÇÃO DIRETA COM A INFINITEPAY
            // =================================================

            // Mesmo recebendo o webhook, o sistema não confia
            // apenas nos dados enviados na requisição.
            //
            // A transação é consultada novamente diretamente
            // na InfinitePay antes de ser confirmada.
            const verificacao =
                await InfinitePayService.verificarPagamento({
                    orderNsu,
                    transactionNsu,
                    slug: invoiceSlug
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


            // =================================================
            // REGISTRO IDEMPOTENTE
            // =================================================

            // A confirmação foi preparada para ser idempotente.
            //
            // Isso permite que o retorno do navegador e o webhook
            // processem a mesma transação sem cadastrar pagamento
            // duplicado ou executar novamente alterações de estoque.
            const pagamento =
                await Pagamento.confirmarInfinitePay({
                    numeroPedido:
                        orderNsu,

                    transactionNsu,

                    invoiceSlug,

                    comprovanteUrl:
                        receiptUrl,

                    captureMethod:
                        verificacao.captureMethod ||
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

            // Uma resposta de erro permite que uma nova
            // tentativa de processamento seja realizada
            // conforme o fluxo do provedor de pagamento.
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        'Não foi possível processar o pagamento.'
                });
        }
    }
};


// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = InfinitePayController;