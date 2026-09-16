-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: manto10
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrinhos`
--

DROP TABLE IF EXISTS `carrinhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrinhos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `cupom_id` int unsigned DEFAULT NULL,
  `status` enum('Ativo','Finalizado','Abandonado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_carrinhos_cupom` (`cupom_id`),
  KEY `idx_carrinhos_usuario` (`usuario_id`),
  KEY `idx_carrinhos_status` (`status`),
  CONSTRAINT `fk_carrinhos_cupom` FOREIGN KEY (`cupom_id`) REFERENCES `cupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_carrinhos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrinhos`
--

LOCK TABLES `carrinhos` WRITE;
/*!40000 ALTER TABLE `carrinhos` DISABLE KEYS */;
INSERT INTO `carrinhos` VALUES (3,3,NULL,'Finalizado','2026-09-16 15:52:54','2026-09-16 17:51:40');
/*!40000 ALTER TABLE `carrinhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Camisas','camisas','Camisas disponíveis no catálogo da Manto 10.','Ativo','2026-08-19 23:51:26','2026-09-16 17:28:50'),(2,'Retrô','retro','Camisas clássicas e históricas.','Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(3,'Infantil','infantil','Camisas destinadas ao público infantil.','Inativo','2026-08-19 23:51:26','2026-09-16 17:28:50'),(4,'Box Misteriosas','box-misteriosas','Caixas surpresa com produtos selecionados.','Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons`
--

DROP TABLE IF EXISTS `cupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('Percentual','Valor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `valor_minimo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `data_inicio` datetime DEFAULT NULL,
  `data_fim` datetime DEFAULT NULL,
  `limite_uso` int unsigned DEFAULT NULL,
  `quantidade_usada` int unsigned NOT NULL DEFAULT '0',
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  CONSTRAINT `cupons_chk_1` CHECK ((`valor` >= 0)),
  CONSTRAINT `cupons_chk_2` CHECK ((`valor_minimo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons`
--

LOCK TABLES `cupons` WRITE;
/*!40000 ALTER TABLE `cupons` DISABLE KEYS */;
INSERT INTO `cupons` VALUES (1,'MANTO10','10% de desconto em compras elegíveis.','Percentual',10.00,100.00,NULL,NULL,NULL,0,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(2,'BEMVINDO20','R$ 20,00 de desconto em compras acima de R$ 200,00.','Valor',20.00,200.00,NULL,NULL,NULL,0,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26');
/*!40000 ALTER TABLE `cupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enderecos`
--

DROP TABLE IF EXISTS `enderecos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `apelido` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logradouro` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `complemento` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cidade` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enderecos_usuario` (`usuario_id`),
  CONSTRAINT `fk_enderecos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos`
--

LOCK TABLES `enderecos` WRITE;
/*!40000 ALTER TABLE `enderecos` DISABLE KEYS */;
INSERT INTO `enderecos` VALUES (3,3,'Entrega','85884000','R. Ver. Hilário Bordignon','1555','Casa','Centro','Medianeira','PR',1,'2026-09-16 17:51:40','2026-09-16 17:51:40');
/*!40000 ALTER TABLE `enderecos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_carrinho`
--

DROP TABLE IF EXISTS `itens_carrinho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_carrinho` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `carrinho_id` int unsigned NOT NULL,
  `produto_tamanho_id` int unsigned NOT NULL,
  `preferencia_box` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `quantidade` int unsigned NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_carrinho_produto_tamanho_preferencia` (`carrinho_id`,`produto_tamanho_id`,`preferencia_box`),
  KEY `fk_itens_carrinho_produto_tamanho` (`produto_tamanho_id`),
  KEY `idx_itens_carrinho_carrinho` (`carrinho_id`),
  CONSTRAINT `fk_itens_carrinho_carrinho` FOREIGN KEY (`carrinho_id`) REFERENCES `carrinhos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_carrinho_produto_tamanho` FOREIGN KEY (`produto_tamanho_id`) REFERENCES `produto_tamanhos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `itens_carrinho_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_carrinho`
--

LOCK TABLES `itens_carrinho` WRITE;
/*!40000 ALTER TABLE `itens_carrinho` DISABLE KEYS */;
INSERT INTO `itens_carrinho` VALUES (10,3,423,'Apenas times estrangeiros e seleções',1,'2026-09-16 17:51:07','2026-09-16 17:51:07');
/*!40000 ALTER TABLE `itens_carrinho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_pedido`
--

DROP TABLE IF EXISTS `itens_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_pedido` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pedido_id` int unsigned NOT NULL,
  `produto_id` int unsigned DEFAULT NULL,
  `codigo_produto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_produto` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tamanho` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferencia_box` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantidade` int unsigned NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_itens_pedido_pedido` (`pedido_id`),
  KEY `idx_itens_pedido_produto` (`produto_id`),
  CONSTRAINT `fk_itens_pedido_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_pedido_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `itens_pedido_chk_1` CHECK ((`quantidade` > 0)),
  CONSTRAINT `itens_pedido_chk_2` CHECK ((`preco_unitario` >= 0)),
  CONSTRAINT `itens_pedido_chk_3` CHECK ((`subtotal` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedido`
--

LOCK TABLES `itens_pedido` WRITE;
/*!40000 ALTER TABLE `itens_pedido` DISABLE KEYS */;
INSERT INTO `itens_pedido` VALUES (3,3,101,'BOX-TAIL-001','Box Misteriosa Tailandesa','M','Apenas times estrangeiros e seleções',1,79.99,79.99,'2026-09-16 17:51:40');
/*!40000 ALTER TABLE `itens_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_pedido_reservas`
--

DROP TABLE IF EXISTS `itens_pedido_reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_pedido_reservas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `item_pedido_id` int unsigned NOT NULL,
  `produto_tamanho_id` int unsigned NOT NULL,
  `quantidade` int unsigned NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_reserva_variacao` (`item_pedido_id`,`produto_tamanho_id`),
  KEY `idx_reserva_produto_tamanho` (`produto_tamanho_id`),
  CONSTRAINT `fk_reserva_item_pedido` FOREIGN KEY (`item_pedido_id`) REFERENCES `itens_pedido` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reserva_produto_tamanho` FOREIGN KEY (`produto_tamanho_id`) REFERENCES `produto_tamanhos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_reserva_quantidade` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedido_reservas`
--

LOCK TABLES `itens_pedido_reservas` WRITE;
/*!40000 ALTER TABLE `itens_pedido_reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_pedido_reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_venda_manual`
--

DROP TABLE IF EXISTS `itens_venda_manual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_venda_manual` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venda_id` int unsigned NOT NULL,
  `produto_id` int unsigned DEFAULT NULL,
  `produto_tamanho_id` int unsigned DEFAULT NULL,
  `codigo_produto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_produto` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_camisa` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tamanho` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` int unsigned NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_itens_venda_manual_venda` (`venda_id`),
  KEY `fk_itens_venda_manual_produto` (`produto_id`),
  KEY `fk_itens_venda_manual_variacao` (`produto_tamanho_id`),
  CONSTRAINT `fk_itens_venda_manual_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_venda_manual_variacao` FOREIGN KEY (`produto_tamanho_id`) REFERENCES `produto_tamanhos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_venda_manual_venda` FOREIGN KEY (`venda_id`) REFERENCES `vendas_manuais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_venda_manual`
--

LOCK TABLES `itens_venda_manual` WRITE;
/*!40000 ALTER TABLE `itens_venda_manual` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_venda_manual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ligas`
--

DROP TABLE IF EXISTS `ligas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ligas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagem` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ligas`
--

LOCK TABLES `ligas` WRITE;
/*!40000 ALTER TABLE `ligas` DISABLE KEYS */;
INSERT INTO `ligas` VALUES (1,'Premier League','premier-league','Inglaterra',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(2,'LaLiga','laliga','Espanha',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(3,'Brasileirão','brasileirao','Brasil',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(4,'Serie A','serie-a','Itália',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(5,'Bundesliga','bundesliga','Alemanha',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26');
/*!40000 ALTER TABLE `ligas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pedido_id` int unsigned NOT NULL,
  `forma_pagamento` enum('Pix','Cartao','Dinheiro','WhatsApp') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provedor` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Pendente','Aprovado','Recusado','Cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendente',
  `transaction_nsu` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_slug` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprovante_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `pago_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_id` (`pedido_id`),
  UNIQUE KEY `uq_pagamentos_transaction_nsu` (`transaction_nsu`),
  KEY `idx_pagamentos_status` (`status`),
  CONSTRAINT `fk_pagamentos_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pagamentos_chk_1` CHECK ((`valor` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `numero_pedido` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `endereco_id` int unsigned NOT NULL,
  `cupom_id` int unsigned DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `frete` decimal(10,2) NOT NULL DEFAULT '0.00',
  `desconto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('Pendente','Pago','Preparando','Enviado','Entregue','Cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendente',
  `observacao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estoque_restituido` tinyint(1) NOT NULL DEFAULT '0',
  `expira_em` datetime DEFAULT NULL,
  `codigo_rastreio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rastreio_atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `fk_pedidos_endereco` (`endereco_id`),
  KEY `fk_pedidos_cupom` (`cupom_id`),
  KEY `idx_pedidos_usuario` (`usuario_id`),
  KEY `idx_pedidos_status` (`status`),
  KEY `idx_pedidos_criado_em` (`criado_em`),
  CONSTRAINT `fk_pedidos_cupom` FOREIGN KEY (`cupom_id`) REFERENCES `cupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidos_endereco` FOREIGN KEY (`endereco_id`) REFERENCES `enderecos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `pedidos_chk_1` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `pedidos_chk_2` CHECK ((`frete` >= 0)),
  CONSTRAINT `pedidos_chk_3` CHECK ((`desconto` >= 0)),
  CONSTRAINT `pedidos_chk_4` CHECK ((`total` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (3,'M10-1789591900186-AE80',3,3,NULL,79.99,0.00,0.00,79.99,'Cancelado',NULL,'2026-09-16 17:51:40','2026-09-16 17:54:08',1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_imagens`
--

DROP TABLE IF EXISTS `produto_imagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_imagens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `produto_id` int unsigned NOT NULL,
  `caminho` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `texto_alternativo` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` int unsigned NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_produto_imagens_produto` (`produto_id`),
  CONSTRAINT `fk_produto_imagens_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_imagens`
--

LOCK TABLES `produto_imagens` WRITE;
/*!40000 ALTER TABLE `produto_imagens` DISABLE KEYS */;
INSERT INTO `produto_imagens` VALUES (7,7,'/images/produtos/tailandesas/argentina-home-2526-tailandesa.jpeg','Camisa Argentina Home 2025/26',1,1,'2026-08-20 17:03:52'),(8,8,'/images/produtos/tailandesas/arsenal-away-2526-tailandesa.jpeg','Camisa Arsenal Away 2025/26',1,1,'2026-08-20 17:03:52'),(9,9,'/images/produtos/tailandesas/arsenal-home-2526-tailandesa.jpeg','Camisa Arsenal Home 2025/26',1,1,'2026-08-20 17:03:53'),(10,10,'/images/produtos/tailandesas/atletico-madrid-home-2526-tailandesa.jpeg','Camisa Atletico Madrid Home 2025/26',1,1,'2026-08-20 17:03:53'),(11,11,'/images/produtos/tailandesas/atletico-mg-home-2526-tailandesa.jpeg','Camisa Atlético MG Home 2025/26',1,1,'2026-08-20 17:03:53'),(12,12,'/images/produtos/tailandesas/barcelona-home-2526-tailandesa.jpeg','Camisa Barcelona Home 2025/26',1,1,'2026-08-20 17:03:53'),(13,13,'/images/produtos/tailandesas/bayern-de-munique-home-2526-tailandesa.jpeg','Camisa Bayern de Munique Home 2025/26',1,1,'2026-08-20 17:03:53'),(14,14,'/images/produtos/tailandesas/benfica-home-2526-tailandesa.jpeg','Camisa Benfica Home 2025/26',1,1,'2026-08-20 17:03:53'),(15,15,'/images/produtos/tailandesas/botafogo-away-2526-tailandesa.jpeg','Camisa Botafogo Away 2025/26',1,1,'2026-08-20 17:03:53'),(16,16,'/images/produtos/tailandesas/botafogo-home-2526-tailandesa.jpeg','Camisa Botafogo Home 2025/26',1,1,'2026-08-20 17:03:53'),(17,17,'/images/produtos/tailandesas/brasil-home-2526-tailandesa.jpeg','Camisa Brasil Home 2025/26',1,1,'2026-08-20 17:03:53'),(18,18,'/images/produtos/tailandesas/celta-de-vigo-100-anos-2526-tailandesa.jpeg','Camisa Celta de Vigo 100 Anos 2025/26',1,1,'2026-08-20 17:03:53'),(19,19,'/images/produtos/tailandesas/chelsea-away-2526-tailandesa.jpeg','Camisa Chelsea Away 2025/26',1,1,'2026-08-20 17:03:53'),(20,20,'/images/produtos/tailandesas/chelsea-home-2526-tailandesa.jpeg','Camisa Chelsea Home 2025/26',1,1,'2026-08-20 17:03:53'),(21,21,'/images/produtos/tailandesas/corinthians-home-2526-tailandesa.jpeg','Camisa Corinthians Home 2025/26',1,1,'2026-08-20 17:03:53'),(22,22,'/images/produtos/tailandesas/corinthians-third-2526-tailandesa.jpeg','Camisa Corinthians Third 2025/26',1,1,'2026-08-20 17:03:53'),(23,23,'/images/produtos/tailandesas/corinthians-treino-2324-tailandesa.jpeg','Camisa Corinthians Treino 2023/24',1,1,'2026-08-20 17:03:53'),(24,24,'/images/produtos/tailandesas/cruzeiro-home-2526-tailandesa.jpeg','Camisa Cruzeiro Home 2025/26',1,1,'2026-08-20 17:03:53'),(25,25,'/images/produtos/tailandesas/flamengo-home-2526-tailandesa.jpeg','Camisa Flamengo Home 2025/26',1,1,'2026-08-20 17:03:53'),(26,26,'/images/produtos/tailandesas/flamengo-third-2526-tailandesa.jpeg','Camisa Flamengo Third 2025/26',1,1,'2026-08-20 17:03:53'),(27,27,'/images/produtos/tailandesas/flamengo-us-2526-tailandesa.jpeg','Camisa Flamengo US 2025/26',1,1,'2026-08-20 17:03:53'),(28,28,'/images/produtos/tailandesas/gremio-home-2526-tailandesa.jpeg','Camisa Grêmio Home 2025/26',1,1,'2026-08-20 17:03:53'),(29,29,'/images/produtos/tailandesas/gremio-third-2324-tailandesa.jpeg','Camisa Grêmio Third 2023/24',1,1,'2026-08-20 17:03:53'),(30,30,'/images/produtos/tailandesas/inglaterra-away-2526-tailandesa.jpeg','Camisa Inglaterra Away 2025/26',1,1,'2026-08-20 17:03:53'),(31,31,'/images/produtos/tailandesas/inglaterra-home-2526-tailandesa.jpeg','Camisa Inglaterra Home 2025/26',1,1,'2026-08-20 17:03:53'),(32,32,'/images/produtos/tailandesas/internacional-home-2526-tailandesa.jpeg','Camisa Internacional Home 2025/26',1,1,'2026-08-20 17:03:53'),(33,33,'/images/produtos/tailandesas/internazionale-home-2526-tailandesa.jpeg','Camisa Internazionale Home 2025/26',1,1,'2026-08-20 17:03:53'),(34,34,'/images/produtos/tailandesas/juventus-home-2526-tailandesa.jpeg','Camisa Juventus Home 2025/26',1,1,'2026-08-20 17:03:53'),(35,35,'/images/produtos/tailandesas/juventus-third-2526-tailandesa.jpeg','Camisa Juventus Third 2025/26',1,1,'2026-08-20 17:03:53'),(36,36,'/images/produtos/tailandesas/liverpool-home-2425-tailandesa.jpeg','Camisa Liverpool Home 2024/25',1,1,'2026-08-20 17:03:53'),(37,37,'/images/produtos/tailandesas/lyon-home-2526-tailandesa.jpeg','Camisa Lyon Home 2025/26',1,1,'2026-08-20 17:03:53'),(38,38,'/images/produtos/tailandesas/manchester-united-away-2526-tailandesa.jpeg','Camisa Manchester United Away 2025/26',1,1,'2026-08-20 17:03:53'),(39,39,'/images/produtos/tailandesas/manchester-united-home-2526-tailandesa.jpeg','Camisa Manchester United Home 2025/26',1,1,'2026-08-20 17:03:53'),(40,40,'/images/produtos/tailandesas/milan-home-2526-tailandesa.jpeg','Camisa Milan Home 2025/26',1,1,'2026-08-20 17:03:53'),(41,41,'/images/produtos/tailandesas/napoli-home-2526-tailandesa.jpeg','Camisa Napoli Home 2025/26',1,1,'2026-08-20 17:03:53'),(42,42,'/images/produtos/tailandesas/olimpique-de-marselha-away-2526-tailandesa.jpeg','Camisa Olimpique de Marselha Away 2025/26',1,1,'2026-08-20 17:03:53'),(43,43,'/images/produtos/tailandesas/palmeiras-away-25-tailandesa.jpeg','Camisa Palmeiras Away 25',1,1,'2026-08-20 17:03:53'),(44,44,'/images/produtos/tailandesas/palmeiras-away-2526-tailandesa.jpeg','Camisa Palmeiras Away 2025/26',1,1,'2026-08-20 17:03:53'),(45,45,'/images/produtos/tailandesas/porto-home-2526-tailandesa.jpeg','Camisa Porto Home 2025/26',1,1,'2026-08-20 17:03:53'),(46,46,'/images/produtos/tailandesas/portugal-away-2526-tailandesa.jpeg','Camisa Portugal Away 2025/26',1,1,'2026-08-20 17:03:53'),(47,47,'/images/produtos/tailandesas/portugal-home-2526-tailandesa.jpeg','Camisa Portugal Home 2025/26',1,1,'2026-08-20 17:03:53'),(48,48,'/images/produtos/tailandesas/real-betis-home-2526-tailandesa.jpeg','Camisa Real Betis Home 2025/26',1,1,'2026-08-20 17:03:53'),(49,49,'/images/produtos/tailandesas/real-madrid-home-2526-tailandesa.jpeg','Camisa Real Madrid Home 2025/26',1,1,'2026-08-20 17:03:53'),(50,50,'/images/produtos/tailandesas/real-madrid-third-2526-tailandesa.jpeg','Camisa Real Madrid Third 2025/26',1,1,'2026-08-20 17:03:53'),(51,51,'/images/produtos/tailandesas/santos-away-2526-tailandesa.jpeg','Camisa Santos Away 2025/26',1,1,'2026-08-20 17:03:53'),(52,52,'/images/produtos/tailandesas/santos-home-2526-tailandesa.jpeg','Camisa Santos Home 2025/26',1,1,'2026-08-20 17:03:53'),(53,53,'/images/produtos/tailandesas/sao-paulo-away-2526-tailandesa.jpeg','Camisa São Paulo Away 2025/26',1,1,'2026-08-20 17:03:53'),(54,54,'/images/produtos/tailandesas/sao-paulo-third-2526-tailandesa.jpeg','Camisa São Paulo Third 2025/26',1,1,'2026-08-20 17:03:53'),(55,55,'/images/produtos/tailandesas/valencia-away-2526-tailandesa.jpeg','Camisa Valencia Away 2025/26',1,1,'2026-08-20 17:03:53'),(56,56,'/images/produtos/nacionais-premium/argentina-away-2526-nacional-premium.jpeg','Camisa Argentina Away 2025/26',1,1,'2026-08-20 17:03:53'),(57,57,'/images/produtos/nacionais-premium/argentina-home-2627-nacional-premium.jpeg','Camisa Argentina Home 2026/27',1,1,'2026-08-20 17:03:53'),(58,58,'/images/produtos/nacionais-premium/arsenal-home-2526-nacional-premium.jpeg','Camisa Arsenal Home 2025/26',1,1,'2026-08-20 17:03:53'),(59,59,'/images/produtos/nacionais-premium/atletico-mg-away-2526-nacional-premium.jpeg','Camisa Atlético MG Away 2025/26',1,1,'2026-08-20 17:03:53'),(60,60,'/images/produtos/nacionais-premium/barcelona-dourada-retro-nacional-premium.jpeg','Camisa Barcelona Dourada Retro',1,1,'2026-08-20 17:03:53'),(61,61,'/images/produtos/nacionais-premium/brasil-home-retro-1978-nacional-premium.jpeg','Camisa Brasil Home Retro 1978',1,1,'2026-08-20 17:03:53'),(62,62,'/images/produtos/nacionais-premium/brasil-home-retro-1986-nacional-premium.jpeg','Camisa Brasil Home Retro 1986',1,1,'2026-08-20 17:03:53'),(63,63,'/images/produtos/nacionais-premium/brasil-home-retro-1994-nacional-premium.jpeg','Camisa Brasil Home Retro 1994',1,1,'2026-08-20 17:03:53'),(64,64,'/images/produtos/nacionais-premium/brasil-third-2627-nacional-premium.jpeg','Camisa Brasil Third 2026/27',1,1,'2026-08-20 17:03:53'),(65,65,'/images/produtos/nacionais-premium/corinthians-especial-2526-nacional-premium.jpeg','Camisa Corinthians Especial 2025/26',1,1,'2026-08-20 17:03:53'),(66,66,'/images/produtos/nacionais-premium/corinthians-third-2526-nacional-premium.jpeg','Camisa Corinthians Third 2025/26',1,1,'2026-08-20 17:03:53'),(67,67,'/images/produtos/nacionais-premium/cruzeiro-home-2526-nacional-premium.jpeg','Camisa Cruzeiro Home 2025/26',1,1,'2026-08-20 17:03:53'),(68,68,'/images/produtos/nacionais-premium/flamengo-home-2627-nacional-premium.jpeg','Camisa Flamengo Home 2026/27',1,1,'2026-08-20 17:03:53'),(69,69,'/images/produtos/nacionais-premium/flamengo-third-2627-nacional-premium.jpeg','Camisa Flamengo Third 2026/27',1,1,'2026-08-20 17:03:53'),(70,70,'/images/produtos/nacionais-premium/flamengo-treino-2627-nacional-premium.jpeg','Camisa Flamengo Treino 2026/27',1,1,'2026-08-20 17:03:53'),(71,71,'/images/produtos/nacionais-premium/fluminense-away-2526-nacional-premium.jpeg','Camisa Fluminense Away 2025/26',1,1,'2026-08-20 17:03:53'),(72,72,'/images/produtos/nacionais-premium/inter-miami-away-2526-nacional-premium.jpeg','Camisa Inter Miami Away 2025/26',1,1,'2026-08-20 17:03:53'),(73,73,'/images/produtos/nacionais-premium/internacional-away-2526-nacional-premium.jpeg','Camisa Internacional Away 2025/26',1,1,'2026-08-20 17:03:53'),(74,74,'/images/produtos/nacionais-premium/internacional-home-2526-nacional-premium.jpeg','Camisa Internacional Home 2025/26',1,1,'2026-08-20 17:03:53'),(75,75,'/images/produtos/nacionais-premium/internazionale-home-2526-nacional-premium.jpeg','Camisa Internazionale Home 2025/26',1,1,'2026-08-20 17:03:53'),(76,76,'/images/produtos/nacionais-premium/italia-home-2627-nacional-premium.jpeg','Camisa Itália Home 2026/27',1,1,'2026-08-20 17:03:53'),(77,77,'/images/produtos/nacionais-premium/manchester-city-away-2526-nacional-premium.jpeg','Camisa Manchester City Away 2025/26',1,1,'2026-08-20 17:03:53'),(78,78,'/images/produtos/nacionais-premium/manchester-city-home-2526-nacional-premium.jpeg','Camisa Manchester City Home 2025/26',1,1,'2026-08-20 17:03:53'),(79,79,'/images/produtos/nacionais-premium/manchester-united-home-2526-nacional-premium.jpeg','Camisa Manchester United Home 2025/26',1,1,'2026-08-20 17:03:53'),(80,80,'/images/produtos/nacionais-premium/milan-home-2526-nacional-premium.jpeg','Camisa Milan Home 2025/26',1,1,'2026-08-20 17:03:53'),(81,81,'/images/produtos/nacionais-premium/palmeiras-home-2627-nacional-premium.jpeg','Camisa Palmeiras Home 2026/27',1,1,'2026-08-20 17:03:53'),(82,82,'/images/produtos/nacionais-premium/palmeiras-third-2526-nacional-premium.jpeg','Camisa Palmeiras Third 2025/26',1,1,'2026-08-20 17:03:53'),(83,83,'/images/produtos/nacionais-premium/penarol-away-2526-nacional-premium.jpeg','Camisa Penarol Away 2025/26',1,1,'2026-08-20 17:03:53'),(84,84,'/images/produtos/nacionais-premium/psg-home-2526-nacional-premium.jpeg','Camisa PSG Home 2025/26',1,1,'2026-08-20 17:03:53'),(85,85,'/images/produtos/nacionais-premium/remo-especial-2526-nacional-premium.jpeg','Camisa Remo Especial 2025/26',1,1,'2026-08-20 17:03:53'),(86,86,'/images/produtos/nacionais-premium/vasco-home-2526-nacional-premium.jpeg','Camisa Vasco Home 2025/26',1,1,'2026-08-20 17:03:53'),(87,87,'/images/produtos/nacionais-premium/vasco-home-2627-nacional-premium.jpeg','Camisa Vasco Home 2026/27',1,1,'2026-08-20 17:03:53'),(88,88,'/images/produtos/placeholder.svg','Camisa Internazionale Away 2025/26',1,1,'2026-08-20 18:06:35'),(89,89,'/images/produtos/placeholder.svg','Camisa Brasil Away 1994',1,1,'2026-08-20 18:06:35'),(90,90,'/images/produtos/placeholder.svg','Camisa Liverpool Home 2025/26',1,1,'2026-08-20 18:06:35'),(91,91,'/images/produtos/placeholder.svg','Camisa Barcelona Home 2025/26',1,1,'2026-08-20 18:06:35'),(92,92,'/images/produtos/placeholder.svg','Camisa Napoli Home 2025/26',1,1,'2026-08-20 18:06:35'),(93,93,'/images/produtos/placeholder.svg','Camisa Internacional Polo 2025/26',1,1,'2026-08-20 18:06:35'),(94,94,'/images/produtos/placeholder.svg','Camisa Barcelona Away 2025/26',1,1,'2026-08-20 18:06:35'),(95,95,'/images/produtos/placeholder.svg','Camisa Lazio Away 2025/26',1,1,'2026-08-20 18:06:35'),(96,96,'/images/produtos/placeholder.svg','Camisa Internacional Away 2025/26',1,1,'2026-08-20 18:06:35'),(97,97,'/images/produtos/placeholder.svg','Camisa Chelsea Total 90 2025/26',1,1,'2026-08-20 18:06:35'),(98,98,'/images/produtos/placeholder.svg','Camisa Ajax Home 2025/26',1,1,'2026-08-20 18:06:35'),(99,99,'/images/produtos/placeholder.svg','Camisa Sporting Home 2025/26',1,1,'2026-08-20 18:06:35'),(100,102,'/images/logotransparente.png','Box Misteriosa Nacional Premium',1,1,'2026-09-16 17:43:44'),(101,101,'/images/logotransparente.png','Box Misteriosa Tailandesa',1,1,'2026-09-16 17:43:44');
/*!40000 ALTER TABLE `produto_imagens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_promocoes`
--

DROP TABLE IF EXISTS `produto_promocoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_promocoes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `produto_id` int unsigned NOT NULL,
  `promocao_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produto_promocao` (`produto_id`,`promocao_id`),
  KEY `fk_produto_promocoes_promocao` (`promocao_id`),
  CONSTRAINT `fk_produto_promocoes_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_produto_promocoes_promocao` FOREIGN KEY (`promocao_id`) REFERENCES `promocoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_promocoes`
--

LOCK TABLES `produto_promocoes` WRITE;
/*!40000 ALTER TABLE `produto_promocoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `produto_promocoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_tamanhos`
--

DROP TABLE IF EXISTS `produto_tamanhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_tamanhos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `produto_id` int unsigned NOT NULL,
  `tamanho_id` int unsigned NOT NULL,
  `estoque` int unsigned NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produto_tamanho` (`produto_id`,`tamanho_id`),
  KEY `fk_produto_tamanhos_tamanho` (`tamanho_id`),
  KEY `idx_produto_tamanhos_produto` (`produto_id`),
  KEY `idx_produto_tamanhos_estoque` (`estoque`),
  CONSTRAINT `fk_produto_tamanhos_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_produto_tamanhos_tamanho` FOREIGN KEY (`tamanho_id`) REFERENCES `tamanhos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=434 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_tamanhos`
--

LOCK TABLES `produto_tamanhos` WRITE;
/*!40000 ALTER TABLE `produto_tamanhos` DISABLE KEYS */;
INSERT INTO `produto_tamanhos` VALUES (43,7,1,0,'2026-08-20 17:03:52','2026-08-20 17:03:52'),(44,7,2,0,'2026-08-20 17:03:52','2026-09-09 16:17:27'),(45,7,3,0,'2026-08-20 17:03:52','2026-08-20 17:03:52'),(46,7,4,1,'2026-08-20 17:03:52','2026-08-20 18:06:35'),(47,8,1,1,'2026-08-20 17:03:52','2026-08-20 18:06:35'),(48,8,2,2,'2026-08-20 17:03:52','2026-09-09 16:17:27'),(49,8,3,1,'2026-08-20 17:03:52','2026-09-09 17:53:54'),(50,8,4,0,'2026-08-20 17:03:52','2026-08-20 17:03:52'),(51,9,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(52,9,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(53,9,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(54,9,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(55,10,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(56,10,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(57,10,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(58,10,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(59,11,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(60,11,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(61,11,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(62,11,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(63,12,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(64,12,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(65,12,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(66,12,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(67,13,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(68,13,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(69,13,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(70,13,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(71,14,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(72,14,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(73,14,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(74,14,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(75,15,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(76,15,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(77,15,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(78,15,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(79,16,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(80,16,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(81,16,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(82,16,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(83,17,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(84,17,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(85,17,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(86,17,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(87,18,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(88,18,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(89,18,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(90,18,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(91,19,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(92,19,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(93,19,3,1,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(94,19,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(95,20,1,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(96,20,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(97,20,3,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(98,20,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(99,21,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(100,21,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(101,21,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(102,21,4,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(103,22,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(104,22,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(105,22,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(106,22,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(107,23,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(108,23,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(109,23,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(110,23,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(111,24,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(112,24,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(113,24,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(114,24,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(115,25,1,2,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(116,25,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(117,25,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(118,25,4,2,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(119,26,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(120,26,2,2,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(121,26,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(122,26,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(123,27,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(124,27,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(125,27,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(126,27,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(127,28,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(128,28,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(129,28,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(130,28,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(131,29,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(132,29,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(133,29,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(134,29,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(135,30,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(136,30,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(137,30,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(138,30,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(139,31,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(140,31,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(141,31,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(142,31,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(143,32,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(144,32,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(145,32,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(146,32,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(147,33,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(148,33,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(149,33,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(150,33,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(151,34,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(152,34,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(153,34,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(154,34,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(155,35,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(156,35,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(157,35,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(158,35,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(159,36,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(160,36,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(161,36,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(162,36,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(163,37,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(164,37,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(165,37,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(166,37,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(167,38,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(168,38,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(169,38,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(170,38,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(171,39,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(172,39,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(173,39,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(174,39,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(175,40,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(176,40,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(177,40,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(178,40,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(179,41,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(180,41,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(181,41,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(182,41,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(183,42,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(184,42,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(185,42,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(186,42,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(187,43,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(188,43,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(189,43,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(190,43,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(191,44,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(192,44,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(193,44,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(194,44,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(195,45,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(196,45,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(197,45,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(198,45,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(199,46,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(200,46,2,0,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(201,46,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(202,46,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(203,47,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(204,47,2,1,'2026-08-20 17:03:53','2026-09-03 16:29:38'),(205,47,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(206,47,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(207,48,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(208,48,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(209,48,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(210,48,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(211,49,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(212,49,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(213,49,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(214,49,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(215,50,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(216,50,2,1,'2026-08-20 17:03:53','2026-09-03 14:51:55'),(217,50,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(218,50,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(219,51,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(220,51,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(221,51,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(222,51,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(223,52,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(224,52,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(225,52,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(226,52,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(227,53,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(228,53,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(229,53,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(230,53,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(231,54,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(232,54,2,1,'2026-08-20 17:03:53','2026-09-03 14:22:01'),(233,54,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(234,54,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(235,55,1,1,'2026-08-20 17:03:53','2026-09-15 16:07:23'),(236,55,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(237,55,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(238,55,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(239,56,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(240,56,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(241,56,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(242,56,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(243,57,1,0,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(244,57,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(245,57,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(246,57,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(247,58,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(248,58,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(249,58,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(250,58,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(251,59,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(252,59,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(253,59,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(254,59,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(255,60,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(256,60,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(257,60,3,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(258,60,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(259,61,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(260,61,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(261,61,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(262,61,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(263,62,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(264,62,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(265,62,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(266,62,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(267,63,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(268,63,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(269,63,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(270,63,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(271,64,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(272,64,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(273,64,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(274,64,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(275,65,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(276,65,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(277,65,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(278,65,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(279,66,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(280,66,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(281,66,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(282,66,4,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(283,67,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(284,67,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(285,67,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(286,67,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(287,68,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(288,68,2,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(289,68,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(290,68,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(291,69,1,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(292,69,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(293,69,3,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(294,69,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(295,70,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(296,70,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(297,70,3,1,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(298,70,4,3,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(299,71,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(300,71,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(301,71,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(302,71,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(303,72,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(304,72,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(305,72,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(306,72,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(307,73,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(308,73,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(309,73,3,1,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(310,73,4,1,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(311,74,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(312,74,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(313,74,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(314,74,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(315,75,1,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(316,75,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(317,75,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(318,75,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(319,76,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(320,76,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(321,76,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(322,76,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(323,77,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(324,77,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(325,77,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(326,77,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(327,78,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(328,78,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(329,78,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(330,78,4,3,'2026-08-20 17:03:53','2026-09-09 16:17:27'),(331,79,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(332,79,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(333,79,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(334,79,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(335,80,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(336,80,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(337,80,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(338,80,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(339,81,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(340,81,2,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(341,81,3,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(342,81,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(343,82,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(344,82,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(345,82,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(346,82,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(347,83,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(348,83,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(349,83,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(350,83,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(351,84,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(352,84,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(353,84,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(354,84,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(355,85,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(356,85,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(357,85,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(358,85,4,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(359,86,1,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(360,86,2,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(361,86,3,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(362,86,4,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(363,87,1,0,'2026-08-20 17:03:53','2026-08-20 17:03:53'),(364,87,2,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(365,87,3,1,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(366,87,4,2,'2026-08-20 17:03:53','2026-08-20 18:06:35'),(367,88,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(368,88,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(369,88,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(370,88,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(371,89,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(372,89,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(373,89,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(374,89,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(375,90,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(376,90,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(377,90,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(378,90,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(379,91,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(380,91,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(381,91,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(382,91,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(383,92,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(384,92,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(385,92,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(386,92,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(387,93,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(388,93,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(389,93,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(390,93,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(391,94,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(392,94,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(393,94,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(394,94,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(395,95,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(396,95,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(397,95,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(398,95,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(399,96,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(400,96,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(401,96,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(402,96,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(403,97,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(404,97,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(405,97,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(406,97,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(407,98,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(408,98,2,0,'2026-08-20 18:06:35','2026-09-15 15:56:28'),(409,98,3,0,'2026-08-20 18:06:35','2026-08-21 23:28:14'),(410,98,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(411,99,1,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(412,99,2,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(413,99,3,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(414,99,4,0,'2026-08-20 18:06:35','2026-08-20 18:06:35'),(419,101,3,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(420,102,3,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(421,101,4,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(422,102,4,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(423,101,2,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(424,102,2,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(425,101,1,0,'2026-09-16 17:43:44','2026-09-16 18:08:06'),(426,102,1,0,'2026-09-16 17:43:44','2026-09-16 18:08:06');
/*!40000 ALTER TABLE `produto_tamanhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_id` int unsigned DEFAULT NULL,
  `categoria_id` int unsigned NOT NULL,
  `temporada` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `tipo_camisa` enum('Tailandesa','Nacional Premium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tailandesa',
  `preco` decimal(10,2) NOT NULL,
  `preco_promocional` decimal(10,2) DEFAULT NULL,
  `desconto_pix` decimal(5,2) NOT NULL DEFAULT '0.00',
  `destaque` tinyint(1) NOT NULL DEFAULT '0',
  `mais_vendido` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_produtos_nome` (`nome`),
  KEY `idx_produtos_codigo` (`codigo`),
  KEY `idx_produtos_time` (`time_id`),
  KEY `idx_produtos_categoria` (`categoria_id`),
  KEY `idx_produtos_preco` (`preco`),
  KEY `idx_produtos_status` (`status`),
  CONSTRAINT `fk_produtos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_produtos_time` FOREIGN KEY (`time_id`) REFERENCES `times` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `produtos_chk_1` CHECK ((`preco` >= 0)),
  CONSTRAINT `produtos_chk_2` CHECK (((`preco_promocional` is null) or (`preco_promocional` >= 0))),
  CONSTRAINT `produtos_chk_3` CHECK (((`desconto_pix` >= 0) and (`desconto_pix` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos`
--

LOCK TABLES `produtos` WRITE;
/*!40000 ALTER TABLE `produtos` DISABLE KEYS */;
INSERT INTO `produtos` VALUES (7,'TAIL-001','Camisa Argentina Home 2025/26','argentina-home-2526-tailandesa',NULL,1,'2025/26','Camisa Argentina Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:52','2026-09-16 17:31:52'),(8,'TAIL-002','Camisa Arsenal Away 2025/26','arsenal-away-2526-tailandesa',1,1,'2025/26','Camisa Arsenal Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:52','2026-09-16 17:31:52'),(9,'TAIL-003','Camisa Arsenal Home 2025/26','arsenal-home-2526-tailandesa',1,1,'2025/26','Camisa Arsenal Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(10,'TAIL-004','Camisa Atletico Madrid Home 2025/26','atletico-madrid-home-2526-tailandesa',NULL,1,'2025/26','Camisa Atletico Madrid Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(11,'TAIL-005','Camisa Atlético MG Home 2025/26','atletico-mg-home-2526-tailandesa',NULL,1,'2025/26','Camisa Atlético MG Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(12,'TAIL-006','Camisa Barcelona Home 2025/26','barcelona-home-2526-tailandesa',4,1,'2025/26','Camisa Barcelona Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(13,'TAIL-007','Camisa Bayern de Munique Home 2025/26','bayern-de-munique-home-2526-tailandesa',8,1,'2025/26','Camisa Bayern de Munique Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(14,'TAIL-008','Camisa Benfica Home 2025/26','benfica-home-2526-tailandesa',NULL,1,'2025/26','Camisa Benfica Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(15,'TAIL-009','Camisa Botafogo Away 2025/26','botafogo-away-2526-tailandesa',NULL,1,'2025/26','Camisa Botafogo Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(16,'TAIL-010','Camisa Botafogo Home 2025/26','botafogo-home-2526-tailandesa',NULL,1,'2025/26','Camisa Botafogo Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(17,'TAIL-011','Camisa Brasil Home 2025/26','brasil-home-2526-tailandesa',NULL,1,'2025/26','Camisa Brasil Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(18,'TAIL-012','Camisa Celta de Vigo 100 Anos 2025/26','celta-de-vigo-100-anos-2526-tailandesa',NULL,1,'2025/26','Camisa Celta de Vigo 100 Anos 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(19,'TAIL-013','Camisa Chelsea Away 2025/26','chelsea-away-2526-tailandesa',NULL,1,'2025/26','Camisa Chelsea Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(20,'TAIL-014','Camisa Chelsea Home 2025/26','chelsea-home-2526-tailandesa',NULL,1,'2025/26','Camisa Chelsea Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(21,'TAIL-015','Camisa Corinthians Home 2025/26','corinthians-home-2526-tailandesa',NULL,1,'2025/26','Camisa Corinthians Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(22,'TAIL-016','Camisa Corinthians Third 2025/26','corinthians-third-2526-tailandesa',NULL,1,'2025/26','Camisa Corinthians Third 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(23,'TAIL-017','Camisa Corinthians Treino 2023/24','corinthians-treino-2324-tailandesa',NULL,1,'2023/24','Camisa Corinthians Treino 2023/24 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(24,'TAIL-018','Camisa Cruzeiro Home 2025/26','cruzeiro-home-2526-tailandesa',NULL,1,'2025/26','Camisa Cruzeiro Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(25,'TAIL-019','Camisa Flamengo Home 2025/26','flamengo-home-2526-tailandesa',5,1,'2025/26','Camisa Flamengo Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(26,'TAIL-020','Camisa Flamengo Third 2025/26','flamengo-third-2526-tailandesa',5,1,'2025/26','Camisa Flamengo Third 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(27,'TAIL-021','Camisa Flamengo US 2025/26','flamengo-us-2526-tailandesa',5,1,'2025/26','Camisa Flamengo US 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(28,'TAIL-022','Camisa Grêmio Home 2025/26','gremio-home-2526-tailandesa',NULL,1,'2025/26','Camisa Grêmio Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(29,'TAIL-023','Camisa Grêmio Third 2023/24','gremio-third-2324-tailandesa',NULL,1,'2023/24','Camisa Grêmio Third 2023/24 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(30,'TAIL-024','Camisa Inglaterra Away 2025/26','inglaterra-away-2526-tailandesa',NULL,1,'2025/26','Camisa Inglaterra Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(31,'TAIL-025','Camisa Inglaterra Home 2025/26','inglaterra-home-2526-tailandesa',NULL,1,'2025/26','Camisa Inglaterra Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(32,'TAIL-026','Camisa Internacional Home 2025/26','internacional-home-2526-tailandesa',NULL,1,'2025/26','Camisa Internacional Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(33,'TAIL-027','Camisa Internazionale Home 2025/26','internazionale-home-2526-tailandesa',NULL,1,'2025/26','Camisa Internazionale Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(34,'TAIL-028','Camisa Juventus Home 2025/26','juventus-home-2526-tailandesa',NULL,1,'2025/26','Camisa Juventus Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(35,'TAIL-029','Camisa Juventus Third 2025/26','juventus-third-2526-tailandesa',NULL,1,'2025/26','Camisa Juventus Third 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(36,'TAIL-030','Camisa Liverpool Home 2024/25','liverpool-home-2425-tailandesa',NULL,1,'2024/25','Camisa Liverpool Home 2024/25 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(37,'TAIL-031','Camisa Lyon Home 2025/26','lyon-home-2526-tailandesa',NULL,1,'2025/26','Camisa Lyon Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(38,'TAIL-032','Camisa Manchester United Away 2025/26','manchester-united-away-2526-tailandesa',NULL,1,'2025/26','Camisa Manchester United Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(39,'TAIL-033','Camisa Manchester United Home 2025/26','manchester-united-home-2526-tailandesa',NULL,1,'2025/26','Camisa Manchester United Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(40,'TAIL-034','Camisa Milan Home 2025/26','milan-home-2526-tailandesa',7,1,'2025/26','Camisa Milan Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(41,'TAIL-035','Camisa Napoli Home 2025/26','napoli-home-2526-tailandesa',NULL,1,'2025/26','Camisa Napoli Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(42,'TAIL-036','Camisa Olimpique de Marselha Away 2025/26','olimpique-de-marselha-away-2526-tailandesa',NULL,1,'2025/26','Camisa Olimpique de Marselha Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(43,'TAIL-037','Camisa Palmeiras Away 25','palmeiras-away-25-tailandesa',6,1,NULL,'Camisa Palmeiras Away 25 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(44,'TAIL-038','Camisa Palmeiras Away 2025/26','palmeiras-away-2526-tailandesa',6,1,'2025/26','Camisa Palmeiras Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(45,'TAIL-039','Camisa Porto Home 2025/26','porto-home-2526-tailandesa',NULL,1,'2025/26','Camisa Porto Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(46,'TAIL-040','Camisa Portugal Away 2025/26','portugal-away-2526-tailandesa',NULL,1,'2025/26','Camisa Portugal Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(47,'TAIL-041','Camisa Portugal Home 2025/26','portugal-home-2526-tailandesa',NULL,1,'2025/26','Camisa Portugal Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(48,'TAIL-042','Camisa Real Betis Home 2025/26','real-betis-home-2526-tailandesa',NULL,1,'2025/26','Camisa Real Betis Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(49,'TAIL-043','Camisa Real Madrid Home 2025/26','real-madrid-home-2526-tailandesa',3,1,'2025/26','Camisa Real Madrid Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(50,'TAIL-044','Camisa Real Madrid Third 2025/26','real-madrid-third-2526-tailandesa',3,1,'2025/26','Camisa Real Madrid Third 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(51,'TAIL-045','Camisa Santos Away 2025/26','santos-away-2526-tailandesa',NULL,1,'2025/26','Camisa Santos Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(52,'TAIL-046','Camisa Santos Home 2025/26','santos-home-2526-tailandesa',NULL,1,'2025/26','Camisa Santos Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(53,'TAIL-047','Camisa São Paulo Away 2025/26','sao-paulo-away-2526-tailandesa',NULL,1,'2025/26','Camisa São Paulo Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(54,'TAIL-048','Camisa São Paulo Third 2025/26','sao-paulo-third-2526-tailandesa',NULL,1,'2025/26','Camisa São Paulo Third 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(55,'TAIL-049','Camisa Valencia Away 2025/26','valencia-away-2526-tailandesa',NULL,1,'2025/26','Camisa Valencia Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(56,'NAC-001','Camisa Argentina Away 2025/26','argentina-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Argentina Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(57,'NAC-002','Camisa Argentina Home 2026/27','argentina-home-2627-nacional-premium',NULL,1,'2026/27','Camisa Argentina Home 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(58,'NAC-003','Camisa Arsenal Home 2025/26','arsenal-home-2526-nacional-premium',1,1,'2025/26','Camisa Arsenal Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(59,'NAC-004','Camisa Atlético MG Away 2025/26','atletico-mg-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Atlético MG Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(60,'NAC-005','Camisa Barcelona Dourada Retro','barcelona-dourada-retro-nacional-premium',4,2,NULL,'Camisa Barcelona Dourada Retro - Nacional Premium.','Nacional Premium',100.00,59.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(61,'NAC-006','Camisa Brasil Home Retro 1978','brasil-home-retro-1978-nacional-premium',NULL,2,NULL,'Camisa Brasil Home Retro 1978 - Nacional Premium.','Nacional Premium',100.00,59.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(62,'NAC-007','Camisa Brasil Home Retro 1986','brasil-home-retro-1986-nacional-premium',NULL,2,NULL,'Camisa Brasil Home Retro 1986 - Nacional Premium.','Nacional Premium',100.00,59.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(63,'NAC-008','Camisa Brasil Home Retro 1994','brasil-home-retro-1994-nacional-premium',NULL,2,NULL,'Camisa Brasil Home Retro 1994 - Nacional Premium.','Nacional Premium',100.00,59.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(64,'NAC-009','Camisa Brasil Third 2026/27','brasil-third-2627-nacional-premium',NULL,1,'2026/27','Camisa Brasil Third 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(65,'NAC-010','Camisa Corinthians Especial 2025/26','corinthians-especial-2526-nacional-premium',NULL,1,'2025/26','Camisa Corinthians Especial 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(66,'NAC-011','Camisa Corinthians Third 2025/26','corinthians-third-2526-nacional-premium',NULL,1,'2025/26','Camisa Corinthians Third 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(67,'NAC-012','Camisa Cruzeiro Home 2025/26','cruzeiro-home-2526-nacional-premium',NULL,1,'2025/26','Camisa Cruzeiro Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(68,'NAC-013','Camisa Flamengo Home 2026/27','flamengo-home-2627-nacional-premium',5,1,'2026/27','Camisa Flamengo Home 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(69,'NAC-014','Camisa Flamengo Third 2026/27','flamengo-third-2627-nacional-premium',5,1,'2026/27','Camisa Flamengo Third 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(70,'NAC-015','Camisa Flamengo Treino 2026/27','flamengo-treino-2627-nacional-premium',5,1,'2026/27','Camisa Flamengo Treino 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(71,'NAC-016','Camisa Fluminense Away 2025/26','fluminense-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Fluminense Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(72,'NAC-017','Camisa Inter Miami Away 2025/26','inter-miami-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Inter Miami Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(73,'NAC-018','Camisa Internacional Away 2025/26','internacional-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Internacional Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(74,'NAC-019','Camisa Internacional Home 2025/26','internacional-home-2526-nacional-premium',NULL,1,'2025/26','Camisa Internacional Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(75,'NAC-020','Camisa Internazionale Home 2025/26','internazionale-home-2526-nacional-premium',NULL,1,'2025/26','Camisa Internazionale Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(76,'NAC-021','Camisa Itália Home 2026/27','italia-home-2627-nacional-premium',NULL,1,'2026/27','Camisa Itália Home 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(77,'NAC-022','Camisa Manchester City Away 2025/26','manchester-city-away-2526-nacional-premium',2,1,'2025/26','Camisa Manchester City Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(78,'NAC-023','Camisa Manchester City Home 2025/26','manchester-city-home-2526-nacional-premium',2,1,'2025/26','Camisa Manchester City Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(79,'NAC-024','Camisa Manchester United Home 2025/26','manchester-united-home-2526-nacional-premium',NULL,1,'2025/26','Camisa Manchester United Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(80,'NAC-025','Camisa Milan Home 2025/26','milan-home-2526-nacional-premium',7,1,'2025/26','Camisa Milan Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(81,'NAC-026','Camisa Palmeiras Home 2026/27','palmeiras-home-2627-nacional-premium',6,1,'2026/27','Camisa Palmeiras Home 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(82,'NAC-027','Camisa Palmeiras Third 2025/26','palmeiras-third-2526-nacional-premium',6,1,'2025/26','Camisa Palmeiras Third 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(83,'NAC-028','Camisa Penarol Away 2025/26','penarol-away-2526-nacional-premium',NULL,1,'2025/26','Camisa Penarol Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(84,'NAC-029','Camisa PSG Home 2025/26','psg-home-2526-nacional-premium',NULL,1,'2025/26','Camisa PSG Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(85,'NAC-030','Camisa Remo Especial 2025/26','remo-especial-2526-nacional-premium',NULL,1,'2025/26','Camisa Remo Especial 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(86,'NAC-031','Camisa Vasco Home 2025/26','vasco-home-2526-nacional-premium',NULL,1,'2025/26','Camisa Vasco Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(87,'NAC-032','Camisa Vasco Home 2026/27','vasco-home-2627-nacional-premium',NULL,1,'2026/27','Camisa Vasco Home 2026/27 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 17:03:53','2026-09-16 17:31:52'),(88,'NAC-EXCEL-001','Camisa Internazionale Away 2025/26','camisa-internazionale-away-2025-26-nacional-premium',NULL,1,'2025/26','Camisa Internazionale Away 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(89,'NAC-EXCEL-002','Camisa Brasil Away 1994','camisa-brasil-away-1994-nacional-premium',NULL,2,'1994','Camisa Brasil Away 1994 - Nacional Premium.','Nacional Premium',100.00,59.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(90,'NAC-EXCEL-003','Camisa Liverpool Home 2025/26','camisa-liverpool-home-2025-26-nacional-premium',NULL,1,'2025/26','Camisa Liverpool Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(91,'NAC-EXCEL-004','Camisa Barcelona Home 2025/26','camisa-barcelona-home-2025-26-nacional-premium',4,1,'2025/26','Camisa Barcelona Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(92,'NAC-EXCEL-005','Camisa Napoli Home 2025/26','camisa-napoli-home-2025-26-nacional-premium',NULL,1,'2025/26','Camisa Napoli Home 2025/26 - Nacional Premium.','Nacional Premium',59.99,39.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(93,'TAIL-EXCEL-006','Camisa Internacional Polo 2025/26','camisa-internacional-polo-2025-26-tailandesa',NULL,1,'2025/26','Camisa Internacional Polo 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(94,'TAIL-EXCEL-007','Camisa Barcelona Away 2025/26','camisa-barcelona-away-2025-26-tailandesa',4,1,'2025/26','Camisa Barcelona Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(95,'TAIL-EXCEL-008','Camisa Lazio Away 2025/26','camisa-lazio-away-2025-26-tailandesa',NULL,1,'2025/26','Camisa Lazio Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(96,'TAIL-EXCEL-009','Camisa Internacional Away 2025/26','camisa-internacional-away-2025-26-tailandesa',NULL,1,'2025/26','Camisa Internacional Away 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(97,'TAIL-EXCEL-010','Camisa Chelsea Total 90 2025/26','camisa-chelsea-total-90-2025-26-tailandesa',NULL,1,'2025/26','Camisa Chelsea Total 90 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(98,'TAIL-EXCEL-011','Camisa Ajax Home 2025/26','camisa-ajax-home-2025-26-tailandesa-tail-excel-011',NULL,1,'2025/26','Camisa Ajax Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(99,'TAIL-EXCEL-012','Camisa Sporting Home 2025/26','camisa-sporting-home-2025-26-tailandesa',NULL,1,'2025/26','Camisa Sporting Home 2025/26 - Tailandesa.','Tailandesa',149.99,119.99,0.00,0,0,'Ativo','2026-08-20 18:06:35','2026-09-16 17:31:52'),(101,'BOX-TAIL-001','Box Misteriosa Tailandesa','box-misteriosa-tailandesa',NULL,4,NULL,'Box surpresa com uma camisa Tailandesa. O cliente escolhe o tamanho e a preferência antes de adicionar ao carrinho.','Tailandesa',79.99,NULL,0.00,0,0,'Ativo','2026-09-16 17:43:44','2026-09-16 17:43:44'),(102,'BOX-NP-001','Box Misteriosa Nacional Premium','box-misteriosa-nacional-premium',NULL,4,NULL,'Box surpresa com uma camisa Nacional Premium. O cliente escolhe o tamanho e a preferência antes de adicionar ao carrinho.','Nacional Premium',29.99,NULL,0.00,0,0,'Ativo','2026-09-16 17:43:44','2026-09-16 17:43:44');
/*!40000 ALTER TABLE `produtos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocoes`
--

DROP TABLE IF EXISTS `promocoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocoes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('Percentual','Valor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `promocoes_chk_1` CHECK ((`valor` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocoes`
--

LOCK TABLES `promocoes` WRITE;
/*!40000 ALTER TABLE `promocoes` DISABLE KEYS */;
INSERT INTO `promocoes` VALUES (1,'Promoção de lançamento','Desconto especial em produtos selecionados.','Percentual',10.00,'2026-01-01 00:00:00','2026-12-31 23:59:59','Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26');
/*!40000 ALTER TABLE `promocoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tamanhos`
--

DROP TABLE IF EXISTS `tamanhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tamanhos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` int unsigned NOT NULL DEFAULT '0',
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tamanhos`
--

LOCK TABLES `tamanhos` WRITE;
/*!40000 ALTER TABLE `tamanhos` DISABLE KEYS */;
INSERT INTO `tamanhos` VALUES (1,'P',1,'Ativo'),(2,'M',2,'Ativo'),(3,'G',3,'Ativo'),(4,'GG',4,'Ativo');
/*!40000 ALTER TABLE `tamanhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `times`
--

DROP TABLE IF EXISTS `times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `times` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `liga_id` int unsigned DEFAULT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `escudo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_times_nome` (`nome`),
  KEY `idx_times_liga` (`liga_id`),
  CONSTRAINT `fk_times_liga` FOREIGN KEY (`liga_id`) REFERENCES `ligas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `times`
--

LOCK TABLES `times` WRITE;
/*!40000 ALTER TABLE `times` DISABLE KEYS */;
INSERT INTO `times` VALUES (1,1,'Arsenal','arsenal',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(2,1,'Manchester City','manchester-city',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(3,2,'Real Madrid','real-madrid',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(4,2,'Barcelona','barcelona',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(5,3,'Flamengo','flamengo',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(6,3,'Palmeiras','palmeiras',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(7,4,'Milan','milan',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26'),(8,5,'Bayern de Munique','bayern-de-munique',NULL,'Ativo','2026-08-19 23:51:26','2026-08-19 23:51:26');
/*!40000 ALTER TABLE `times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('Cliente','Administrador') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cliente',
  `status` enum('Ativo','Inativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuarios_nome` (`nome`),
  KEY `idx_usuarios_tipo` (`tipo`),
  KEY `idx_usuarios_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Manto 10','mantodez.store@gmail.com',NULL,'$2b$10$VlT2zKxxh3D17fi5VGWix.QSM6uDmVcAFGJDoUvRrZTlhXo6Z4fRG','Administrador','Ativo','2026-08-20 00:27:01','2026-09-09 15:00:15'),(3,'Cliente Teste','cliente@gmail.com','5545988230340','$2b$10$1574Mh6Wg5q1SsNCp6s.ieVBvZpm9uxXSmcKoDX57Y7aFvE/kKDC2','Cliente','Ativo','2026-09-15 15:57:09','2026-09-15 15:57:09');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendas_manuais`
--

DROP TABLE IF EXISTS `vendas_manuais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendas_manuais` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `numero_venda` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `administrador_id` int unsigned NOT NULL,
  `origem` enum('Loja física','Venda externa') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_nome` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `forma_pagamento` enum('Pix','Cartão','Dinheiro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `observacao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Concluída','Cancelada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Concluída',
  `estoque_restituido` tinyint(1) NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vendas_manuais_numero` (`numero_venda`),
  KEY `idx_vendas_manuais_data` (`criado_em`),
  KEY `idx_vendas_manuais_status` (`status`),
  KEY `fk_vendas_manuais_admin` (`administrador_id`),
  CONSTRAINT `fk_vendas_manuais_admin` FOREIGN KEY (`administrador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendas_manuais`
--

LOCK TABLES `vendas_manuais` WRITE;
/*!40000 ALTER TABLE `vendas_manuais` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendas_manuais` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-16 18:47:08
