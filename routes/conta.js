const express = require('express');
const ContaController = require('../controllers/ContaController');
const { exigirLogin } = require('../middlewares/auth');

const router = express.Router();

router.get('/minha-conta', exigirLogin, ContaController.inicio);
router.get('/minha-conta/pedidos/:id', exigirLogin, ContaController.pedidoDetalhe);
router.post('/minha-conta/pedidos/:id/cancelar', exigirLogin, ContaController.cancelarPedido);

module.exports = router;
