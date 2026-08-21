const express = require('express');

const AuthController = require(
    '../controllers/AuthController'
);

const router = express.Router();

router.get(
    '/cadastro',
    AuthController.exibirCadastro
);

router.post(
    '/cadastro',
    AuthController.cadastrar
);

router.get(
    '/login',
    AuthController.exibirLogin
);

router.post(
    '/login',
    AuthController.login
);

router.post(
    '/logout',
    AuthController.logout
);

module.exports = router;