const express = require('express');
const InfinitePayController = require('../controllers/InfinitePayController');
const { exigirLogin } = require('../middlewares/auth');

const router = express.Router();

router.post('/pagamento/infinitepay/webhook', InfinitePayController.webhook);
router.get('/pagamento/infinitepay/retorno', InfinitePayController.retorno);
router.get('/pagamento/infinitepay/:id', exigirLogin, InfinitePayController.iniciar);

module.exports = router;
