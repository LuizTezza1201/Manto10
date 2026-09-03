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

router.get(
    '/pagamento/infinitepay/:id',
    exigirLogin,
    InfinitePayController.iniciar
);

router.get(
    '/pagamento/infinitepay/retorno',
    exigirLogin,
    InfinitePayController.retorno
);


module.exports = router;