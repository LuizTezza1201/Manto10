USE manto10;

-- ============================================================
-- MANTO 10
-- ADICIONAR TIPO DE CAMISA
-- ============================================================

ALTER TABLE produtos
ADD COLUMN tipo_camisa ENUM(
    'Tailandesa',
    'Nacional Premium'
)
NOT NULL
DEFAULT 'Tailandesa'
AFTER descricao;

-- ============================================================
-- PRODUTOS DE TESTE ATUAIS
-- ============================================================
-- Como os produtos atuais são apenas dados de teste,
-- deixaremos alguns em cada tipo para testar o sistema.
-- Depois eles serão substituídos pelos produtos reais.
-- ============================================================

UPDATE produtos
SET tipo_camisa = 'Tailandesa'
WHERE codigo IN (
    'ARS-H-2425',
    'RMA-H-2526',
    'BAR-H-2526',
    'MIL-R-0607'
);

UPDATE produtos
SET tipo_camisa = 'Nacional Premium'
WHERE codigo IN (
    'FLA-H-2526',
    'BAY-H-2526'
);