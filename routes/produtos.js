const express = require('express');

const ProdutoController = require(
    '../controllers/ProdutoController'
);

const router = express.Router();

router.get(
    '/camisas',
    ProdutoController.catalogo
);

router.get(
    '/produto/:slug',
    ProdutoController.detalhe
);

module.exports = router;