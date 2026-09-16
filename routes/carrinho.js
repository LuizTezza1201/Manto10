// ============================================================
// ROTAS DO CARRINHO, CHECKOUT E PAGAMENTO
// ============================================================

const express = require('express');

const CarrinhoController = require('../controllers/CarrinhoController');
const CheckoutController = require('../controllers/CheckoutController');
const InfinitePayController = require('../controllers/InfinitePayController');

const {
    exigirLogin,
    exigirLoginApi
} = require('../middlewares/auth');

const router = express.Router();


// ============================================================
// CARRINHO
// ============================================================

// Exibe a página completa do carrinho.
// O usuário precisa estar autenticado.
router.get(
    '/carrinho',
    exigirLogin,
    CarrinhoController.pagina
);


// Retorna o resumo utilizado no carrinho lateral.
//
// Esta rota pode ser acessada mesmo sem login.
// O controller é responsável por retornar o estado adequado
// quando não existe um carrinho associado ao usuário.
router.get(
    '/carrinho/resumo',
    CarrinhoController.resumo
);


// Adiciona um produto e tamanho ao carrinho.
//
// Como a operação é realizada por JavaScript, utiliza
// exigirLoginApi para retornar JSON em caso de usuário não logado.
router.post(
    '/carrinho/adicionar',
    exigirLoginApi,
    CarrinhoController.adicionar
);


// Atualiza a quantidade de um item existente no carrinho.
router.post(
    '/carrinho/item/:id/quantidade',
    exigirLoginApi,
    CarrinhoController.atualizarQuantidade
);


// Remove um item do carrinho.
router.post(
    '/carrinho/item/:id/remover',
    exigirLoginApi,
    CarrinhoController.remover
);


// ============================================================
// CHECKOUT
// ============================================================

// Exibe os dados necessários para finalizar o pedido.
router.get(
    '/checkout',
    exigirLogin,
    CheckoutController.pagina
);


// Valida o checkout e cria o pedido no banco de dados.
router.post(
    '/checkout/finalizar',
    exigirLogin,
    CheckoutController.finalizar
);


// ============================================================
// PAGAMENTO - INFINITEPAY
// ============================================================

// Recebe notificações enviadas diretamente pela InfinitePay.
//
// Esta rota não utiliza sessão porque a requisição é feita
// entre os servidores da InfinitePay e da Manto 10.
router.post(
    '/pagamento/infinitepay/webhook',
    InfinitePayController.webhook
);


// Processa o retorno do cliente após o checkout da InfinitePay.
//
// A confirmação não depende da sessão do usuário. Dessa forma,
// o pagamento ainda pode ser verificado caso a sessão expire.
router.get(
    '/pagamento/infinitepay/retorno',
    InfinitePayController.retorno
);


// Inicia o pagamento de um pedido específico.
//
// IMPORTANTE:
// Esta rota dinâmica deve permanecer depois de "webhook"
// e "retorno". Caso fosse declarada antes, o Express poderia
// interpretar "retorno" como se fosse o parâmetro :id.
router.get(
    '/pagamento/infinitepay/:id',
    exigirLogin,
    InfinitePayController.iniciar
);


// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = router;