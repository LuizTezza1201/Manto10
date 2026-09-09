const API_CHECKOUT =
    'https://api.checkout.infinitepay.io/links';

const API_PAYMENT_CHECK =
    'https://api.checkout.infinitepay.io/payment_check';


function criarErro(
    mensagem,
    status = 502
) {

    const erro =
        new Error(mensagem);

    erro.status =
        status;

    return erro;
}


// ======================================================
// CONFIGURAÇÃO
// ======================================================

function obterHandle() {

    const handle =
        String(
            process.env.INFINITEPAY_HANDLE || ''
        )
            .trim()
            .replace(/^\$/, '');

    if (!handle) {

        throw criarErro(
            'InfinitePay não configurada no servidor.',
            500
        );
    }

    return handle;
}


function obterUrlProjeto() {

    return String(
        process.env.APP_URL ||
        'http://localhost:8000'
    )
        .trim()
        .replace(/\/+$/, '');
}


function obterWebhookUrl() {

    const webhookConfigurado =
        String(
            process.env.INFINITEPAY_WEBHOOK_URL || ''
        )
            .trim()
            .replace(/\/+$/, '');


    if (webhookConfigurado) {
        return webhookConfigurado;
    }


    const urlProjeto =
        obterUrlProjeto();


    try {

        const url =
            new URL(urlProjeto);

        const host =
            url.hostname.toLowerCase();

        const ambienteLocal =
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host === '::1';


        if (ambienteLocal) {
            return '';
        }


        return `${urlProjeto}/pagamento/infinitepay/webhook`;

    } catch {

        return '';
    }
}


// ======================================================
// CRIAR CHECKOUT
// ======================================================

async function criarLinkPagamento({
    numeroPedido,
    itens,
    cliente,
    endereco
}) {

    const handle =
        obterHandle();

    const urlProjeto =
        obterUrlProjeto();

    const webhookUrl =
        obterWebhookUrl();


    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {

        throw criarErro(
            'O pedido não possui itens.'
        );
    }


    const items =
        itens.map(
            item => {

                const quantidade =
                    Number(
                        item.quantidade
                    );

                const precoCentavos =
                    Math.round(
                        Number(
                            item.preco_unitario
                        ) * 100
                    );


                if (
                    !Number.isInteger(
                        quantidade
                    ) ||
                    quantidade <= 0
                ) {

                    throw criarErro(
                        'Quantidade inválida no pedido.'
                    );
                }


                if (
                    !Number.isInteger(
                        precoCentavos
                    ) ||
                    precoCentavos <= 0
                ) {

                    throw criarErro(
                        'Preço inválido no pedido.'
                    );
                }


                return {

                    quantity:
                        quantidade,

                    price:
                        precoCentavos,

                    description:
                        `${item.nome_produto} - Tam. ${item.tamanho}`
                            .slice(0, 200)
                };
            }
        );


    const payload = {

        handle,

        order_nsu:
            String(
                numeroPedido
            ),

        redirect_url:
            `${urlProjeto}/pagamento/infinitepay/retorno`,

        items
    };


    if (webhookUrl) {

        payload.webhook_url =
            webhookUrl;
    }


    // ==================================================
    // CLIENTE
    // ==================================================

    if (
        cliente &&
        cliente.nome &&
        cliente.email
    ) {

        payload.customer = {

            name:
                String(
                    cliente.nome
                )
                    .trim()
                    .slice(0, 150),

            email:
                String(
                    cliente.email
                )
                    .trim()
                    .toLowerCase()
                    .slice(0, 190)
        };


        const telefone =
            String(
                cliente.telefone || ''
            )
                .replace(/\D/g, '');


        if (
            telefone.length === 13 &&
            telefone.startsWith('55')
        ) {

            payload.customer.phone_number =
                `+${telefone}`;
        }
    }


    // ==================================================
    // ENDEREÇO
    // ==================================================

    if (endereco) {

        payload.address = {

            cep:
                String(
                    endereco.cep || ''
                )
                    .replace(/\D/g, ''),

            street:
                String(
                    endereco.logradouro || ''
                )
                    .trim(),

            neighborhood:
                String(
                    endereco.bairro || ''
                )
                    .trim(),

            number:
                String(
                    endereco.numero || ''
                )
                    .trim(),

            complement:
                String(
                    endereco.complemento || ''
                )
                    .trim()
        };
    }


    let resposta;


    try {

        resposta =
            await fetch(
                API_CHECKOUT,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Accept:
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

    } catch {

        throw criarErro(
            'Não foi possível conectar com a InfinitePay.'
        );
    }


    let dados = {};


    try {

        dados =
            await resposta.json();

    } catch {

        dados = {};
    }


    if (!resposta.ok) {

        console.error(
            'Erro InfinitePay:',
            resposta.status,
            dados
        );

        throw criarErro(
            'A InfinitePay não conseguiu gerar o checkout.'
        );
    }


    if (
        !dados.url ||
        typeof dados.url !== 'string'
    ) {

        throw criarErro(
            'A InfinitePay não retornou o link de pagamento.'
        );
    }


    return dados.url;
}


// ======================================================
// VERIFICAR PAGAMENTO
// ======================================================

async function verificarPagamento({
    orderNsu,
    transactionNsu,
    slug
}) {

    const handle =
        obterHandle();


    if (
        !orderNsu ||
        !transactionNsu ||
        !slug
    ) {

        throw criarErro(
            'Dados insuficientes para verificar o pagamento.',
            400
        );
    }


    let resposta;


    try {

        resposta =
            await fetch(
                API_PAYMENT_CHECK,
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Accept:
                            'application/json'
                    },

                    body:
                        JSON.stringify({

                            handle,

                            order_nsu:
                                String(
                                    orderNsu
                                ),

                            transaction_nsu:
                                String(
                                    transactionNsu
                                ),

                            slug:
                                String(
                                    slug
                                )
                        })
                }
            );

    } catch {

        throw criarErro(
            'Não foi possível verificar o pagamento na InfinitePay.'
        );
    }


    let dados = {};


    try {

        dados =
            await resposta.json();

    } catch {

        dados = {};
    }


    if (!resposta.ok) {

        console.error(
            'Erro payment_check:',
            resposta.status,
            dados
        );

        throw criarErro(
            'Não foi possível confirmar o pagamento na InfinitePay.'
        );
    }


    return {

        success:
            dados.success === true,

        paid:
            dados.paid === true,

        amount:
            Number(
                dados.amount || 0
            ),

        paidAmount:
            Number(
                dados.paid_amount || 0
            ),

        installments:
            Number(
                dados.installments || 1
            ),

        captureMethod:
            String(
                dados.capture_method || ''
            )
    };
}


module.exports = {
    criarLinkPagamento,
    verificarPagamento
};
