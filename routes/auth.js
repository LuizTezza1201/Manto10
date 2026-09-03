const express =
    require('express');

const AuthController =
    require(
        '../controllers/AuthController'
    );

const ContaController =
    require(
        '../controllers/ContaController'
    );

const {
    exigirLogin
} =
    require(
        '../middlewares/auth'
    );

const router =
    express.Router();


// ======================================================
// CADASTRO
// ======================================================

router.get(
    '/cadastro',
    AuthController.exibirCadastro
);

router.post(
    '/cadastro',
    AuthController.cadastrar
);


// ======================================================
// LOGIN
// ======================================================

router.get(
    '/login',
    AuthController.exibirLogin
);

router.post(
    '/login',
    AuthController.login
);


// ======================================================
// MINHA CONTA
// ======================================================

router.get(
    '/minha-conta',
    exigirLogin,
    ContaController.inicio
);

router.get(
    '/minha-conta/pedidos/:id',
    exigirLogin,
    ContaController.pedidoDetalhe
);

router.post(
    '/minha-conta/pedidos/:id/cancelar',
    exigirLogin,
    ContaController.cancelarPedido
);


// ======================================================
// LOGOUT
// ======================================================

router.post(
    '/logout',
    AuthController.logout
);


module.exports = router;