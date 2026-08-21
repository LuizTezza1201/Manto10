const express = require(
    'express'
);

const CarrinhoController =
    require(
        '../controllers/CarrinhoController'
    );

const {
    exigirLogin,
    exigirLoginApi
} = require(
    '../middlewares/auth'
);

const router =
    express.Router();

// Página completa
router.get(
    '/carrinho',
    exigirLogin,
    CarrinhoController.pagina
);

// Resumo lateral
router.get(
    '/carrinho/resumo',
    CarrinhoController.resumo
);

// Adicionar
router.post(
    '/carrinho/adicionar',
    exigirLoginApi,
    CarrinhoController.adicionar
);

// Quantidade
router.post(
    '/carrinho/item/:id/quantidade',
    exigirLoginApi,
    CarrinhoController.atualizarQuantidade
);

// Remover
router.post(
    '/carrinho/item/:id/remover',
    exigirLoginApi,
    CarrinhoController.remover
);

module.exports = router;