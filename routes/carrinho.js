// ============================================================
// ROTAS DO CARRINHO, CHECKOUT E PAGAMENTO
// ============================================================

const express = require('express');

const CarrinhoController = require('../controllers/CarrinhoController');
const CheckoutController = require('../controllers/CheckoutController');
const { exigirLogin, exigirLoginApi } = require('../middlewares/auth');

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
// EXPORTAÇÃO
// ============================================================

module.exports = router;