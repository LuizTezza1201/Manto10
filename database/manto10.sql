-- ============================================================
-- MANTO 10
-- Banco de dados principal
-- ============================================================

CREATE DATABASE IF NOT EXISTS manto10
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE manto10;

-- ============================================================
-- LIMPEZA PARA PERMITIR REEXECUTAR O SCRIPT
-- ATENÇÃO: apaga as tabelas existentes do banco manto10
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS itens_carrinho;
DROP TABLE IF EXISTS carrinhos;
DROP TABLE IF EXISTS produto_promocoes;
DROP TABLE IF EXISTS promocoes;
DROP TABLE IF EXISTS produto_imagens;
DROP TABLE IF EXISTS produto_tamanhos;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS enderecos;
DROP TABLE IF EXISTS cupons;
DROP TABLE IF EXISTS tamanhos;
DROP TABLE IF EXISTS times;
DROP TABLE IF EXISTS ligas;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USUÁRIOS
-- ============================================================

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(190) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    tipo ENUM(
        'Cliente',
        'Administrador'
    ) NOT NULL DEFAULT 'Cliente',

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_usuarios_nome (nome),
    INDEX idx_usuarios_tipo (tipo),
    INDEX idx_usuarios_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- CATEGORIAS
-- ============================================================

CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL UNIQUE,

    slug VARCHAR(120) NOT NULL UNIQUE,

    descricao VARCHAR(255),

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- LIGAS
-- ============================================================

CREATE TABLE ligas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(120) NOT NULL UNIQUE,

    slug VARCHAR(140) NOT NULL UNIQUE,

    pais VARCHAR(100),

    imagem VARCHAR(255),

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TIMES
-- ============================================================

CREATE TABLE times (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    liga_id INT UNSIGNED,

    nome VARCHAR(120) NOT NULL,

    slug VARCHAR(140) NOT NULL UNIQUE,

    escudo VARCHAR(255),

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_times_liga
        FOREIGN KEY (liga_id)
        REFERENCES ligas(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_times_nome (nome),
    INDEX idx_times_liga (liga_id)
) ENGINE=InnoDB;

-- ============================================================
-- TAMANHOS
-- ============================================================

CREATE TABLE tamanhos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(10) NOT NULL UNIQUE,

    ordem INT UNSIGNED NOT NULL DEFAULT 0,

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo'
) ENGINE=InnoDB;

-- ============================================================
-- CUPONS
-- ============================================================

CREATE TABLE cupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    codigo VARCHAR(50) NOT NULL UNIQUE,

    descricao VARCHAR(255),

    tipo ENUM(
        'Percentual',
        'Valor'
    ) NOT NULL,

    valor DECIMAL(10,2) NOT NULL,

    valor_minimo DECIMAL(10,2)
        NOT NULL DEFAULT 0.00,

    data_inicio DATETIME,

    data_fim DATETIME,

    limite_uso INT UNSIGNED,

    quantidade_usada INT UNSIGNED
        NOT NULL DEFAULT 0,

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CHECK (valor >= 0),
    CHECK (valor_minimo >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- ENDEREÇOS
-- ============================================================

CREATE TABLE enderecos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT UNSIGNED NOT NULL,

    apelido VARCHAR(50),

    cep VARCHAR(9) NOT NULL,

    logradouro VARCHAR(180) NOT NULL,

    numero VARCHAR(20) NOT NULL,

    complemento VARCHAR(120),

    bairro VARCHAR(120) NOT NULL,

    cidade VARCHAR(120) NOT NULL,

    estado CHAR(2) NOT NULL,

    principal BOOLEAN NOT NULL DEFAULT FALSE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_enderecos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_enderecos_usuario (usuario_id)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUTOS
-- ============================================================

CREATE TABLE produtos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    codigo VARCHAR(50) NOT NULL UNIQUE,

    nome VARCHAR(180) NOT NULL,

    slug VARCHAR(200) NOT NULL UNIQUE,

    time_id INT UNSIGNED,

    categoria_id INT UNSIGNED NOT NULL,

    temporada VARCHAR(30),

    descricao TEXT,

    preco DECIMAL(10,2) NOT NULL,

    preco_promocional DECIMAL(10,2),

    desconto_pix DECIMAL(5,2)
        NOT NULL DEFAULT 0.00,

    destaque BOOLEAN NOT NULL DEFAULT FALSE,

    mais_vendido BOOLEAN NOT NULL DEFAULT FALSE,

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_produtos_time
        FOREIGN KEY (time_id)
        REFERENCES times(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_produtos_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CHECK (preco >= 0),

    CHECK (
        preco_promocional IS NULL
        OR preco_promocional >= 0
    ),

    CHECK (
        desconto_pix >= 0
        AND desconto_pix <= 100
    ),

    INDEX idx_produtos_nome (nome),
    INDEX idx_produtos_codigo (codigo),
    INDEX idx_produtos_time (time_id),
    INDEX idx_produtos_categoria (categoria_id),
    INDEX idx_produtos_preco (preco),
    INDEX idx_produtos_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- ESTOQUE POR TAMANHO
-- ============================================================

CREATE TABLE produto_tamanhos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    produto_id INT UNSIGNED NOT NULL,

    tamanho_id INT UNSIGNED NOT NULL,

    estoque INT UNSIGNED NOT NULL DEFAULT 0,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_produto_tamanhos_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_produto_tamanhos_tamanho
        FOREIGN KEY (tamanho_id)
        REFERENCES tamanhos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_produto_tamanho
        UNIQUE (produto_id, tamanho_id),

    INDEX idx_produto_tamanhos_produto (produto_id),
    INDEX idx_produto_tamanhos_estoque (estoque)
) ENGINE=InnoDB;

-- ============================================================
-- IMAGENS DOS PRODUTOS
-- ============================================================

CREATE TABLE produto_imagens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    produto_id INT UNSIGNED NOT NULL,

    caminho VARCHAR(255) NOT NULL,

    texto_alternativo VARCHAR(180),

    principal BOOLEAN NOT NULL DEFAULT FALSE,

    ordem INT UNSIGNED NOT NULL DEFAULT 0,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_produto_imagens_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_produto_imagens_produto (produto_id)
) ENGINE=InnoDB;

-- ============================================================
-- PROMOÇÕES
-- ============================================================

CREATE TABLE promocoes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    descricao VARCHAR(255),

    tipo ENUM(
        'Percentual',
        'Valor'
    ) NOT NULL,

    valor DECIMAL(10,2) NOT NULL,

    data_inicio DATETIME NOT NULL,

    data_fim DATETIME NOT NULL,

    status ENUM(
        'Ativo',
        'Inativo'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CHECK (valor >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- RELAÇÃO PRODUTOS X PROMOÇÕES
-- ============================================================

CREATE TABLE produto_promocoes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    produto_id INT UNSIGNED NOT NULL,

    promocao_id INT UNSIGNED NOT NULL,

    CONSTRAINT fk_produto_promocoes_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_produto_promocoes_promocao
        FOREIGN KEY (promocao_id)
        REFERENCES promocoes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_produto_promocao
        UNIQUE (produto_id, promocao_id)
) ENGINE=InnoDB;

-- ============================================================
-- CARRINHOS
-- ============================================================

CREATE TABLE carrinhos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT UNSIGNED NOT NULL,

    cupom_id INT UNSIGNED,

    status ENUM(
        'Ativo',
        'Finalizado',
        'Abandonado'
    ) NOT NULL DEFAULT 'Ativo',

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrinhos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_carrinhos_cupom
        FOREIGN KEY (cupom_id)
        REFERENCES cupons(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_carrinhos_usuario (usuario_id),
    INDEX idx_carrinhos_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- ITENS DO CARRINHO
-- ============================================================

CREATE TABLE itens_carrinho (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    carrinho_id INT UNSIGNED NOT NULL,

    produto_tamanho_id INT UNSIGNED NOT NULL,

    quantidade INT UNSIGNED NOT NULL DEFAULT 1,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_itens_carrinho_carrinho
        FOREIGN KEY (carrinho_id)
        REFERENCES carrinhos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_itens_carrinho_produto_tamanho
        FOREIGN KEY (produto_tamanho_id)
        REFERENCES produto_tamanhos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_carrinho_produto_tamanho
        UNIQUE (carrinho_id, produto_tamanho_id),

    CHECK (quantidade > 0),

    INDEX idx_itens_carrinho_carrinho (carrinho_id)
) ENGINE=InnoDB;

-- ============================================================
-- PEDIDOS
-- ============================================================

CREATE TABLE pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    numero_pedido VARCHAR(30) NOT NULL UNIQUE,

    usuario_id INT UNSIGNED NOT NULL,

    endereco_id INT UNSIGNED NOT NULL,

    cupom_id INT UNSIGNED,

    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    frete DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    status ENUM(
        'Pendente',
        'Pago',
        'Preparando',
        'Enviado',
        'Entregue',
        'Cancelado'
    ) NOT NULL DEFAULT 'Pendente',

    observacao VARCHAR(500),

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedidos_endereco
        FOREIGN KEY (endereco_id)
        REFERENCES enderecos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedidos_cupom
        FOREIGN KEY (cupom_id)
        REFERENCES cupons(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CHECK (subtotal >= 0),
    CHECK (frete >= 0),
    CHECK (desconto >= 0),
    CHECK (total >= 0),

    INDEX idx_pedidos_usuario (usuario_id),
    INDEX idx_pedidos_status (status),
    INDEX idx_pedidos_criado_em (criado_em)
) ENGINE=InnoDB;

-- ============================================================
-- ITENS DO PEDIDO
-- ============================================================
-- Alguns dados são copiados propositalmente para preservar
-- o histórico da compra mesmo que o produto seja alterado.
-- ============================================================

CREATE TABLE itens_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT UNSIGNED NOT NULL,

    produto_id INT UNSIGNED,

    codigo_produto VARCHAR(50) NOT NULL,

    nome_produto VARCHAR(180) NOT NULL,

    tamanho VARCHAR(10) NOT NULL,

    quantidade INT UNSIGNED NOT NULL,

    preco_unitario DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_itens_pedido_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_itens_pedido_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CHECK (quantidade > 0),
    CHECK (preco_unitario >= 0),
    CHECK (subtotal >= 0),

    INDEX idx_itens_pedido_pedido (pedido_id),
    INDEX idx_itens_pedido_produto (produto_id)
) ENGINE=InnoDB;

-- ============================================================
-- PAGAMENTOS
-- ============================================================

CREATE TABLE pagamentos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT UNSIGNED NOT NULL UNIQUE,

    forma_pagamento ENUM(
        'Pix',
        'Cartao',
        'Dinheiro',
        'WhatsApp'
    ) NOT NULL,

    status ENUM(
        'Pendente',
        'Aprovado',
        'Recusado',
        'Cancelado'
    ) NOT NULL DEFAULT 'Pendente',

    valor DECIMAL(10,2) NOT NULL,

    pago_em DATETIME,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pagamentos_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CHECK (valor >= 0),

    INDEX idx_pagamentos_status (status)
) ENGINE=InnoDB;