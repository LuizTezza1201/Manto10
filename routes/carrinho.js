const express =
    require('express');

const CarrinhoController =
    require(
        '../controllers/CarrinhoController'
    );

const CheckoutController =
    require(
        '../controllers/CheckoutController'
    );

const InfinitePayController =
    require(
        '../controllers/InfinitePayController'
    );

const {
    exigirLogin,
    exigirLoginApi
} =
    require(
        '../middlewares/auth'
    );

const router =
    express.Router();


// ======================================================
// CARRINHO
// ======================================================

router.get(
    '/carrinho',
    exigirLogin,
    CarrinhoController.pagina
);


// ======================================================
// RESUMO LATERAL
// ======================================================

router.get(
    '/carrinho/resumo',
    CarrinhoController.resumo
);


// ======================================================
// ADICIONAR
// ======================================================

router.post(
    '/carrinho/adicionar',
    exigirLoginApi,
    CarrinhoController.adicionar
);


// ======================================================
// ALTERAR QUANTIDADE
// ======================================================

router.post(
    '/carrinho/item/:id/quantidade',
    exigirLoginApi,
    CarrinhoController.atualizarQuantidade
);


// ======================================================
// REMOVER
// ======================================================

router.post(
    '/carrinho/item/:id/remover',
    exigirLoginApi,
    CarrinhoController.remover
);


// ======================================================
// CHECKOUT
// ======================================================

router.get(
    '/checkout',
    exigirLogin,
    CheckoutController.pagina
);

router.post(
    '/checkout/finalizar',
    exigirLogin,
    CheckoutController.finalizar
);


// ======================================================
// INFINITEPAY
// ======================================================

/*
 * O webhook não usa sessão.
 * Ele é chamado diretamente pelos servidores
 * da InfinitePay.
 */

router.post(
    '/pagamento/infinitepay/webhook',
    InfinitePayController.webhook
);


/*
 * O retorno também não depende da sessão.
 * Assim, mesmo se a sessão expirar ou o servidor
 * reiniciar, a confirmação ainda pode ser processada.
 */

router.get(
    '/pagamento/infinitepay/retorno',
    InfinitePayController.retorno
);


/*
 * A rota dinâmica precisa ficar por último.
 * Caso contrário, "retorno" ou "webhook"
 * poderiam ser interpretados como :id.
 */

router.get(
    '/pagamento/infinitepay/:id',
    exigirLogin,
    InfinitePayController.iniciar
);


module.exports = router;
