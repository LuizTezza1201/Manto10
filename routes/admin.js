const express = require(
    'express'
);

const AdminController =
    require(
        '../controllers/AdminController'
    );

const {
    exigirAdmin
} = require(
    '../middlewares/auth'
);

const router =
    express.Router();

// Todas as rotas abaixo exigem administrador.
router.use(
    exigirAdmin
);

// Dashboard
router.get(
    '/',
    AdminController.inicio
);

// Produtos
router.get(
    '/produtos',
    AdminController.produtos
);

// Estoque
router.post(
    '/produtos/:id/estoque',
    AdminController.atualizarEstoque
);

module.exports = router;