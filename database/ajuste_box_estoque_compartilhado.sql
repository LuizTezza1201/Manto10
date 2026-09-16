-- ============================================================
-- MANTO 10 - BOX MISTERIOSA COM ESTOQUE COMPARTILHADO
-- ============================================================
-- Execute uma única vez depois da Fase 2.
--
-- As Box Misteriosas deixam de possuir estoque próprio. A disponibilidade
-- passa a utilizar as camisas reais do mesmo tipo e tamanho.

USE manto10;

SET @sql_safe_updates_anterior = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

-- ============================================================
-- ZERAR O ESTOQUE VIRTUAL DAS BOXES
-- ============================================================
-- Remove as 40 unidades criadas apenas para o teste inicial.
-- Os registros P/M/G/GG permanecem para representar a escolha de tamanho,
-- porém estoque = 0 porque as unidades reais pertencem às camisas normais.

UPDATE produto_tamanhos pt
INNER JOIN produtos p ON p.id = pt.produto_id
SET pt.estoque = 0
WHERE p.codigo IN ('BOX-TAIL-001', 'BOX-NP-001');

-- Garante que as quatro opções de tamanho existam para cada box, sempre
-- sem criar estoque adicional.
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
-- RESERVAS DE ESTOQUE REAL DAS BOXES
-- ============================================================
-- Quando uma box vira pedido, o sistema baixa unidades de camisas reais.
-- Esta tabela registra de quais variações saiu o estoque para que um
-- cancelamento consiga devolver exatamente as mesmas unidades.

CREATE TABLE IF NOT EXISTS itens_pedido_reservas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_pedido_id INT UNSIGNED NOT NULL,
    produto_tamanho_id INT UNSIGNED NOT NULL,
    quantidade INT UNSIGNED NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_item_reserva_variacao (
        item_pedido_id,
        produto_tamanho_id
    ),

    KEY idx_reserva_produto_tamanho (
        produto_tamanho_id
    ),

    CONSTRAINT fk_reserva_item_pedido
        FOREIGN KEY (item_pedido_id)
        REFERENCES itens_pedido (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_reserva_produto_tamanho
        FOREIGN KEY (produto_tamanho_id)
        REFERENCES produto_tamanhos (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_reserva_quantidade
        CHECK (quantidade > 0)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

COMMIT;

SET SQL_SAFE_UPDATES = @sql_safe_updates_anterior;

-- ============================================================
-- CONFERÊNCIA
-- ============================================================

-- Deve retornar 0 para cada Box Misteriosa.
SELECT
    p.codigo,
    p.nome,
    SUM(pt.estoque) AS estoque_proprio_box
FROM produtos p
LEFT JOIN produto_tamanhos pt ON pt.produto_id = p.id
WHERE p.codigo IN ('BOX-TAIL-001', 'BOX-NP-001')
GROUP BY p.id, p.codigo, p.nome;

-- Estoque físico total, ignorando as boxes virtuais.
-- No estado atual esperado do projeto: 189 unidades.
SELECT
    SUM(pt.estoque) AS estoque_fisico_total
FROM produto_tamanhos pt
INNER JOIN produtos p ON p.id = pt.produto_id
INNER JOIN categorias c ON c.id = p.categoria_id
WHERE c.slug <> 'box-misteriosas';

SHOW TABLES LIKE 'itens_pedido_reservas';
