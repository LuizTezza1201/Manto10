-- ============================================================
-- MANTO 10 - AJUSTES FINAIS DA ÁREA PÚBLICA
-- ============================================================
-- Execute uma única vez no MySQL Workbench usando o banco manto10.
-- Depois de validar tudo, gere um novo database/manto10.sql e este
-- arquivo poderá ser removido do projeto.

USE manto10;

START TRANSACTION;

-- ------------------------------------------------------------
-- CATEGORIAS
-- ------------------------------------------------------------

-- A categoria principal passa a se chamar "Camisas".
UPDATE categorias
SET
    nome = 'Camisas',
    slug = 'camisas',
    descricao = 'Camisas disponíveis no catálogo da Manto 10.'
WHERE id = 1;

-- A seção Infantil deixa de fazer parte do catálogo público.
UPDATE categorias
SET status = 'Inativo'
WHERE id = 3;

-- ------------------------------------------------------------
-- PREÇOS DAS CAMISAS RETRÔ
-- ------------------------------------------------------------

UPDATE produtos
SET
    preco = 100.00,
    preco_promocional = 59.99
WHERE categoria_id = 2;

-- ------------------------------------------------------------
-- PIX
-- ------------------------------------------------------------

-- O campo continua no banco, porém sem desconto aplicado.
UPDATE produtos
SET desconto_pix = 0.00;

-- ------------------------------------------------------------
-- TIMES E LIGAS
-- ------------------------------------------------------------
-- Vincula produtos aos times já cadastrados para que os cards das
-- ligas exibam as camisas correspondentes ao serem acessados.

UPDATE produtos
SET time_id = 1
WHERE nome LIKE 'Camisa Arsenal %';

UPDATE produtos
SET time_id = 2
WHERE nome LIKE 'Camisa Manchester City %';

UPDATE produtos
SET time_id = 3
WHERE nome LIKE 'Camisa Real Madrid %';

UPDATE produtos
SET time_id = 4
WHERE nome LIKE 'Camisa Barcelona %';

UPDATE produtos
SET time_id = 5
WHERE nome LIKE 'Camisa Flamengo %';

UPDATE produtos
SET time_id = 6
WHERE nome LIKE 'Camisa Palmeiras %';

UPDATE produtos
SET time_id = 7
WHERE nome LIKE 'Camisa Milan %';

UPDATE produtos
SET time_id = 8
WHERE nome LIKE 'Camisa Bayern de Munique %';

COMMIT;

-- ============================================================
-- CONFERÊNCIA
-- ============================================================

SELECT id, nome, slug, status
FROM categorias
ORDER BY id;

SELECT
    COUNT(*) AS produtos_com_desconto_pix
FROM produtos
WHERE desconto_pix <> 0;

SELECT
    COUNT(*) AS retros,
    MIN(preco) AS menor_preco_retro,
    MAX(preco) AS maior_preco_retro,
    MIN(preco_promocional) AS menor_promocional_retro,
    MAX(preco_promocional) AS maior_promocional_retro
FROM produtos
WHERE categoria_id = 2;

SELECT
    l.nome AS liga,
    COUNT(p.id) AS produtos_vinculados
FROM ligas l
LEFT JOIN times t ON t.liga_id = l.id
LEFT JOIN produtos p ON p.time_id = t.id
GROUP BY l.id, l.nome
ORDER BY l.id;
