// ============================================================
// ROTAS ADMINISTRATIVAS
// ============================================================

const express = require('express');

// Controllers responsáveis pelas áreas do painel.
const AdminController = require('../controllers/AdminController');
const AdminProdutoController = require('../controllers/AdminProdutoController');
const AdminUsuarioController = require('../controllers/AdminUsuarioController');
const AdminPedidoController = require('../controllers/AdminPedidoController');
const AdminVendaController = require('../controllers/AdminVendaController');

// Middleware responsável pelo upload da imagem de novos produtos.
const uploadImagemProduto = require('../middlewares/uploadProduto');

// Middleware que restringe o acesso ao painel administrativo.
const { exigirAdmin } = require('../middlewares/auth');

const router = express.Router();


// ============================================================
// PROTEÇÃO DAS ROTAS
// ============================================================

// Todas as rotas definidas abaixo exigem que o usuário
// esteja autenticado com o perfil Administrador.
router.use(exigirAdmin);


// ============================================================
// DASHBOARD
// ============================================================

// Exibe os indicadores gerais do sistema.
router.get(
    '/',
    AdminController.inicio
);


// ============================================================
// USUÁRIOS
// ============================================================

// Lista os usuários cadastrados no sistema.
router.get(
    '/usuarios',
    AdminUsuarioController.listar
);

// Ativa ou desativa uma conta de usuário.
router.post(
    '/usuarios/:id/status',
    AdminUsuarioController.alternarStatus
);


// ============================================================
// PEDIDOS
// ============================================================

// Lista os pedidos realizados pelo site.
router.get(
    '/pedidos',
    AdminPedidoController.listar
);

// Exibe todos os dados de um pedido específico.
router.get(
    '/pedidos/:id',
    AdminPedidoController.detalhes
);

// Altera o status operacional do pedido.
router.post(
    '/pedidos/:id/status',
    AdminPedidoController.atualizarStatus
);

// Salva ou atualiza o código de rastreio.
router.post(
    '/pedidos/:id/rastreio',
    AdminPedidoController.salvarRastreio
);

// Cancela o pedido e executa as regras necessárias,
// incluindo a restituição do estoque quando aplicável.
router.post(
    '/pedidos/:id/cancelar',
    AdminPedidoController.cancelarPedido
);


// ============================================================
// VENDAS
// ============================================================

// Lista as vendas registradas no sistema.
router.get(
    '/vendas',
    AdminVendaController.listar
);

// Exibe o formulário para cadastrar uma venda manual.
router.get(
    '/vendas/nova',
    AdminVendaController.nova
);

// Registra uma nova venda manual.
router.post(
    '/vendas/nova',
    AdminVendaController.criar
);

// Exibe os detalhes de uma venda manual.
router.get(
    '/vendas/manuais/:id',
    AdminVendaController.detalhesManual
);

// Cancela uma venda manual e restitui seu estoque
// quando as regras da operação permitirem.
router.post(
    '/vendas/manuais/:id/cancelar',
    AdminVendaController.cancelarManual
);


// ============================================================
// PRODUTOS
// ============================================================

// Lista os produtos para gerenciamento administrativo.
router.get(
    '/produtos',
    AdminController.produtos
);


// ============================================================
// CADASTRO DE PRODUTO
// ============================================================

// Exibe o formulário de cadastro.
router.get(
    '/produtos/novo',
    AdminProdutoController.novo
);

// Recebe os dados do produto e sua imagem principal.
//
// O middleware de upload é executado antes do controller,
// permitindo que a imagem seja validada e armazenada.
router.post(
    '/produtos/novo',
    uploadImagemProduto,
    AdminProdutoController.criar
);


// ============================================================
// EDIÇÃO DE PRODUTO
// ============================================================

// Exibe os dados atuais do produto para edição.
router.get(
    '/produtos/:id/editar',
    AdminController.editarProduto
);

// Salva as alterações feitas nos dados do produto.
router.post(
    '/produtos/:id/editar',
    AdminController.salvarProduto
);


// ============================================================
// ESTOQUE
// ============================================================

// Atualiza individualmente as quantidades dos tamanhos
// disponíveis para o produto.
router.post(
    '/produtos/:id/estoque',
    AdminController.atualizarEstoque
);


// ============================================================
// STATUS DO PRODUTO
// ============================================================

// Permite ativar ou desativar o produto sem removê-lo
// definitivamente do banco de dados.
router.post(
    '/produtos/:id/status',
    AdminController.alternarStatusProduto
);


// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = router;