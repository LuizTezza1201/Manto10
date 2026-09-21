// ============================================================
// SERVIÇO DE INTEGRAÇÃO COM A INFINITEPAY
// ============================================================

// Endpoints utilizados para criar o checkout e consultar
// o estado de uma transação.
const API_CHECKOUT =
    'https://api.checkout.infinitepay.io/links';

const API_PAYMENT_CHECK =
    'https://api.checkout.infinitepay.io/payment_check';


// ============================================================
// TRATAMENTO DE ERROS
// ============================================================

// Cria erros contendo também um código HTTP.
// Isso permite que o controller escolha a resposta adequada.
function criarErro(mensagem, status = 502) {
    const erro = new Error(mensagem);

    erro.status = status;

    return erro;
}


function obterTimeoutInfinitePayMs() {
    const timeout = Number(
        process.env.INFINITEPAY_TIMEOUT_MS || 15000
    );

    return Number.isInteger(timeout) && timeout > 0
        ? timeout
        : 15000;
}

function validarUrlHttp(url) {
    try {
        const parsed = new URL(String(url || '').trim());

        return ['http:', 'https:'].includes(parsed.protocol)
            ? parsed.toString()
            : '';
    } catch {
        return '';
    }
}


// ============================================================
// CONFIGURAÇÕES DA INFINITEPAY
// ============================================================

// Obtém o identificador da conta InfinitePay.
//
// O valor fica no .env para não deixar configurações
// específicas da conta diretamente no código.
function obterHandle() {
    const handle = String(
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


// Retorna a URL principal utilizada pelo sistema.
//
// Durante o desenvolvimento utiliza localhost.
// Em produção, APP_URL deve possuir o domínio público.
function obterUrlProjeto() {
    return String(
        process.env.APP_URL ||
        'http://localhost:8000'
    )
        .trim()
        .replace(/\/+$/, '');
}


// Define qual URL será utilizada pelo webhook.
//
// Em localhost o webhook automático fica desativado,
// pois a InfinitePay precisa acessar um endereço público.
function obterWebhookUrl() {
    const webhookConfigurado = String(
        process.env.INFINITEPAY_WEBHOOK_URL || ''
    )
        .trim()
        .replace(/\/+$/, '');

    if (webhookConfigurado) {
        return webhookConfigurado;
    }

    const urlProjeto = obterUrlProjeto();

    try {
        const url = new URL(urlProjeto);

        const host =
            url.hostname.toLowerCase();

        const ambienteLocal =
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host === '::1';

        if (ambienteLocal) {
            return '';
        }

        return (
            `${urlProjeto}` +
            '/pagamento/infinitepay/webhook'
        );

    } catch {
        return '';
    }
}


// ============================================================
// REQUISIÇÕES HTTP
// ============================================================

// Executa uma requisição POST enviando JSON.
//
// A função centraliza uma lógica utilizada tanto na criação
// do checkout quanto na verificação do pagamento.
async function enviarPostJson(
    url,
    payload,
    mensagemErroConexao
) {
    let resposta;
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        obterTimeoutInfinitePayMs()
    );

    try {
        resposta = await fetch(
            url,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    Accept:
                        'application/json'
                },

                body:
                    JSON.stringify(payload),

                signal:
                    controller.signal
            }
        );

    } catch {
        throw criarErro(
            mensagemErroConexao
        );
    } finally {
        clearTimeout(timeout);
    }

    let dados = {};

    try {
        dados =
            await resposta.json();

    } catch {
        // Algumas respostas de erro podem não possuir JSON.
        // Nesse caso, mantemos um objeto vazio.
        dados = {};
    }

    return {
        resposta,
        dados
    };
}


// ============================================================
// ITENS DO PEDIDO
// ============================================================

// Converte os itens armazenados no banco para o formato
// exigido pelo checkout da InfinitePay.
//
// Os preços são convertidos de Real para centavos.
function montarItensCheckout(itens) {
    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {
        throw criarErro(
            'O pedido não possui itens.'
        );
    }

    return itens.map(item => {
        const quantidade =
            Number(item.quantidade);

        const precoCentavos =
            Math.round(
                Number(
                    item.preco_unitario
                ) * 100
            );

        if (
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            throw criarErro(
                'Quantidade inválida no pedido.'
            );
        }

        if (
            !Number.isInteger(precoCentavos) ||
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
                (
                    `${item.nome_produto}` +
                    ` - Tam. ${item.tamanho}` +
                    (item.preferencia_box
                        ? ` - ${item.preferencia_box}`
                        : '')
                )
                    .slice(0, 200)
        };
    });
}


// ============================================================
// DADOS DO CLIENTE
// ============================================================

// Monta os dados do comprador no formato aceito
// pela InfinitePay.
function montarCliente(cliente) {
    if (
        !cliente ||
        !cliente.nome ||
        !cliente.email
    ) {
        return null;
    }

    const dadosCliente = {
        name:
            String(cliente.nome)
                .trim()
                .slice(0, 150),

        email:
            String(cliente.email)
                .trim()
                .toLowerCase()
                .slice(0, 190)
    };

    // O telefone é armazenado internamente somente com números.
    // Para a InfinitePay ele é enviado no padrão internacional.
    const telefone =
        String(cliente.telefone || '')
            .replace(/\D/g, '');

    if (
        telefone.length === 13 &&
        telefone.startsWith('55')
    ) {
        dadosCliente.phone_number =
            `+${telefone}`;
    }

    return dadosCliente;
}


// ============================================================
// ENDEREÇO
// ============================================================

// Converte o endereço do pedido para o formato
// utilizado no checkout.
function montarEndereco(endereco) {
    if (!endereco) {
        return null;
    }

    return {
        cep:
            String(endereco.cep || '')
                .replace(/\D/g, ''),

        street:
            String(
                endereco.logradouro || ''
            ).trim(),

        neighborhood:
            String(
                endereco.bairro || ''
            ).trim(),

        number:
            String(
                endereco.numero || ''
            ).trim(),

        complement:
            String(
                endereco.complemento || ''
            ).trim()
    };
}


// ============================================================
// CRIAÇÃO DO CHECKOUT
// ============================================================

// Cria um link de pagamento para um pedido da Manto 10.
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

    const items =
        montarItensCheckout(itens);

    const payload = {
        handle,

        order_nsu:
            String(numeroPedido),

        redirect_url:
            (
                `${urlProjeto}` +
                '/pagamento/infinitepay/retorno'
            ),

        items
    };


    // O webhook só é enviado quando existe uma URL pública.
    if (webhookUrl) {
        payload.webhook_url =
            webhookUrl;
    }


    const dadosCliente =
        montarCliente(cliente);

    if (dadosCliente) {
        payload.customer =
            dadosCliente;
    }


    const dadosEndereco =
        montarEndereco(endereco);

    if (dadosEndereco) {
        payload.address =
            dadosEndereco;
    }


    // Envia o pedido para a API da InfinitePay.
    const {
        resposta,
        dados
    } = await enviarPostJson(
        API_CHECKOUT,
        payload,
        'Não foi possível conectar com a InfinitePay.'
    );


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


    const urlPagamento = validarUrlHttp(dados.url);

    if (!urlPagamento) {
        throw criarErro(
            'A InfinitePay não retornou um link de pagamento válido.'
        );
    }


    return urlPagamento;
}


// ============================================================
// VERIFICAÇÃO DO PAGAMENTO
// ============================================================

// Consulta diretamente a InfinitePay para confirmar
// se determinada transação realmente foi paga.
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


    const payload = {
        handle,

        order_nsu:
            String(orderNsu),

        transaction_nsu:
            String(transactionNsu),

        slug:
            String(slug)
    };


    const {
        resposta,
        dados
    } = await enviarPostJson(
        API_PAYMENT_CHECK,
        payload,
        'Não foi possível verificar o pagamento na InfinitePay.'
    );


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


    // Retorna somente as informações que o restante
    // da aplicação precisa utilizar.
    return {
        success:
            dados.success === true,

        paid:
            dados.paid === true,

        amount:
            Number(
                dados.amount || 0
            ),

        captureMethod:
            String(
                dados.capture_method || ''
            )
    };
}


// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = {
    criarLinkPagamento,
    verificarPagamento
};