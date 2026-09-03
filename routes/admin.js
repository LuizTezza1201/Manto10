const express =
    require('express');

const AdminController =
    require(
        '../controllers/AdminController'
    );

const AdminProdutoController =
    require(
        '../controllers/AdminProdutoController'
    );

const AdminUsuarioController =
    require(
        '../controllers/AdminUsuarioController'
    );

const AdminPedidoController =
    require(
        '../controllers/AdminPedidoController'
    );

const AdminVendaController =
    require(
        '../controllers/AdminVendaController'
    );

const uploadImagemProduto =
    require(
        '../middlewares/uploadProduto'
    );

const {
    exigirAdmin
} =
    require(
        '../middlewares/auth'
    );


const router =
    express.Router();


// ======================================================
// TODAS AS ROTAS EXIGEM ADMINISTRADOR
// ======================================================

router.use(
    exigirAdmin
);


// ======================================================
// DASHBOARD
// ======================================================

router.get(
    '/',
    AdminController.inicio
);


// ======================================================
// USUÁRIOS
// ======================================================

router.get(
    '/usuarios',
    AdminUsuarioController.listar
);

router.post(
    '/usuarios/:id/status',
    AdminUsuarioController.alternarStatus
);


// ======================================================
// PEDIDOS
// ======================================================

router.get(
    '/pedidos',
    AdminPedidoController.listar
);

router.get(
    '/pedidos/:id',
    AdminPedidoController.detalhes
);

router.post(
    '/pedidos/:id/status',
    AdminPedidoController.atualizarStatus
);

router.post(
    '/pedidos/:id/cancelar',
    AdminPedidoController.cancelarPedido
);


// ======================================================
// VENDAS
// ======================================================

router.get(
    '/vendas',
    AdminVendaController.listar
);


router.get(
    '/vendas/nova',
    AdminVendaController.nova
);


router.post(
    '/vendas/nova',
    AdminVendaController.criar
);


// ======================================================
// DETALHES DA VENDA MANUAL
// ======================================================

router.get(
    '/vendas/manuais/:id',
    AdminVendaController.detalhesManual
);


router.post(
    '/vendas/manuais/:id/cancelar',
    AdminVendaController.cancelarManual
);


// ======================================================
// PRODUTOS
// ======================================================

router.get(
    '/produtos',
    AdminController.produtos
);


// ======================================================
// NOVO PRODUTO
// ======================================================

router.get(
    '/produtos/novo',
    AdminProdutoController.novo
);

router.post(
    '/produtos/novo',

    uploadImagemProduto,

    AdminProdutoController.criar
);


// ======================================================
// EDITAR PRODUTO
// ======================================================

router.get(
    '/produtos/:id/editar',
    AdminController.editarProduto
);

router.post(
    '/produtos/:id/editar',
    AdminController.salvarProduto
);


// ======================================================
// ESTOQUE
// ======================================================

router.post(
    '/produtos/:id/estoque',
    AdminController.atualizarEstoque
);


// ======================================================
// ATIVAR / DESATIVAR PRODUTO
// ======================================================

router.post(
    '/produtos/:id/status',
    AdminController.alternarStatusProduto
);


module.exports =
    router;