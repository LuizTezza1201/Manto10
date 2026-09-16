USE manto10;

-- ============================================================
-- BOX MISTERIOSA - ESTRUTURA DO CARRINHO E PEDIDO
-- ============================================================
-- A preferência escolhida pelo cliente precisa acompanhar o item
-- desde o carrinho até o pedido final.

ALTER TABLE itens_carrinho
    ADD COLUMN preferencia_box VARCHAR(60) NOT NULL DEFAULT ''
    AFTER produto_tamanho_id;

ALTER TABLE itens_carrinho
    DROP INDEX uq_carrinho_produto_tamanho,
    ADD UNIQUE KEY uq_carrinho_produto_tamanho_preferencia (
        carrinho_id,
        produto_tamanho_id,
        preferencia_box
    );

ALTER TABLE itens_pedido
    ADD COLUMN preferencia_box VARCHAR(60) NULL
    AFTER tamanho;

-- ============================================================
-- PRODUTOS BOX MISTERIOSA
-- ============================================================

SET @categoria_box = (
    SELECT id
    FROM categorias
    WHERE slug = 'box-misteriosas'
    LIMIT 1
);

INSERT INTO produtos (
    codigo,
    nome,
    slug,
    time_id,
    categoria_id,
    temporada,
    descricao,
    tipo_camisa,
    preco,
    preco_promocional,
    desconto_pix,
    destaque,
    mais_vendido,
    status
)
VALUES (
    'BOX-TAIL-001',
    'Box Misteriosa Tailandesa',
    'box-misteriosa-tailandesa',
    NULL,
    @categoria_box,
    NULL,
    'Box surpresa com uma camisa Tailandesa. O cliente escolhe o tamanho e a preferência antes de adicionar ao carrinho.',
    'Tailandesa',
    79.99,
    NULL,
    0.00,
    0,
    0,
    'Ativo'
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    categoria_id = VALUES(categoria_id),
    descricao = VALUES(descricao),
    tipo_camisa = VALUES(tipo_camisa),
    preco = VALUES(preco),
    preco_promocional = NULL,
    desconto_pix = 0.00,
    status = 'Ativo';

INSERT INTO produtos (
    codigo,
    nome,
    slug,
    time_id,
    categoria_id,
    temporada,
    descricao,
    tipo_camisa,
    preco,
    preco_promocional,
    desconto_pix,
    destaque,
    mais_vendido,
    status
)
VALUES (
    'BOX-NP-001',
    'Box Misteriosa Nacional Premium',
    'box-misteriosa-nacional-premium',
    NULL,
    @categoria_box,
    NULL,
    'Box surpresa com uma camisa Nacional Premium. O cliente escolhe o tamanho e a preferência antes de adicionar ao carrinho.',
    'Nacional Premium',
    29.99,
    NULL,
    0.00,
    0,
    0,
    'Ativo'
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    categoria_id = VALUES(categoria_id),
    descricao = VALUES(descricao),
    tipo_camisa = VALUES(tipo_camisa),
    preco = VALUES(preco),
    preco_promocional = NULL,
    desconto_pix = 0.00,
    status = 'Ativo';

-- ============================================================
-- IMAGEM TEMPORÁRIA
-- ============================================================
-- Enquanto as imagens definitivas das boxes não forem escolhidas,
-- a logo da Manto 10 é utilizada como imagem temporária.

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    p.id,
    '/images/logotransparente.png',
    p.nome,
    1,
    1
FROM produtos p
WHERE p.codigo IN ('BOX-TAIL-001', 'BOX-NP-001')
  AND NOT EXISTS (
      SELECT 1
      FROM produto_imagens pi
      WHERE pi.produto_id = p.id
  );

-- ============================================================
-- TAMANHOS DA BOX - SEM ESTOQUE PRÓPRIO
-- ============================================================
-- As Box Misteriosas utilizam o estoque real das camisas do mesmo tipo.
-- Os registros abaixo existem somente para permitir a escolha P/M/G/GG.

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    0
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo IN ('BOX-TAIL-001', 'BOX-NP-001')
  AND t.nome IN ('P', 'M', 'G', 'GG')
  AND t.status = 'Ativo'
  AND NOT EXISTS (
      SELECT 1
      FROM produto_tamanhos pt
      WHERE pt.produto_id = p.id
        AND pt.tamanho_id = t.id
  );

-- ============================================================
-- RESERVAS DE ESTOQUE REAL
-- ============================================================

CREATE TABLE IF NOT EXISTS itens_pedido_reservas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_pedido_id INT UNSIGNED NOT NULL,
    produto_tamanho_id INT UNSIGNED NOT NULL,
    quantidade INT UNSIGNED NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_item_reserva_variacao (item_pedido_id, produto_tamanho_id),
    KEY idx_reserva_produto_tamanho (produto_tamanho_id),
    CONSTRAINT fk_reserva_item_pedido
        FOREIGN KEY (item_pedido_id) REFERENCES itens_pedido (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reserva_produto_tamanho
        FOREIGN KEY (produto_tamanho_id) REFERENCES produto_tamanhos (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_reserva_quantidade CHECK (quantidade > 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CONFERÊNCIA
-- ============================================================

SELECT
    p.id,
    p.codigo,
    p.nome,
    p.tipo_camisa,
    p.preco,
    c.nome AS categoria,
    SUM(pt.estoque) AS estoque_total
FROM produtos p
INNER JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN produto_tamanhos pt ON pt.produto_id = p.id
WHERE p.codigo IN ('BOX-TAIL-001', 'BOX-NP-001')
GROUP BY
    p.id,
    p.codigo,
    p.nome,
    p.tipo_camisa,
    p.preco,
    c.nome
ORDER BY p.id;

SHOW COLUMNS FROM itens_carrinho LIKE 'preferencia_box';
SHOW COLUMNS FROM itens_pedido LIKE 'preferencia_box';
