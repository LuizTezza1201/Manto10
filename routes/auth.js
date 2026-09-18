const express = require('express');
const rateLimit = require('express-rate-limit');

const AuthController = require('../controllers/AuthController');
const ContaController = require('../controllers/ContaController');
const { exigirLogin } = require('../middlewares/auth');

const router = express.Router();

// ======================================================
// LIMITADOR DE TENTATIVAS DE LOGIN
// ======================================================
//
// Objetivo:
// impedir tentativas repetidas de senha no formulário de login.
//
// Regra:
// no máximo 5 tentativas em 15 minutos por IP.
//
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res
            .status(429)
            .render('auth/login', {
                titulo: 'Entrar',
                paginaAtual: '',
                erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
                sucesso: null,
                dados: {
                    email: String(req.body.email || '')
                        .trim()
                        .toLowerCase()
                }
            });
    }
});

// ======================================================
// CADASTRO E LOGIN
// ======================================================

router.get('/cadastro', AuthController.exibirCadastro);
router.post('/cadastro', AuthController.cadastrar);

router.get('/login', AuthController.exibirLogin);
router.post('/login', loginLimiter, AuthController.login);

// ======================================================
// MINHA CONTA
// ======================================================

router.get('/minha-conta', exigirLogin, ContaController.inicio);
router.get('/minha-conta/pedidos/:id', exigirLogin, ContaController.pedidoDetalhe);
router.post('/minha-conta/pedidos/:id/cancelar', exigirLogin, ContaController.cancelarPedido);

// ======================================================
// LOGOUT
// ======================================================

router.post('/logout', AuthController.logout);

module.exports = router;