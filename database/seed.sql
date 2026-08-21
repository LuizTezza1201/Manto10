USE manto10;

-- ============================================================
-- CATEGORIAS
-- ============================================================

INSERT INTO categorias (
    nome,
    slug,
    descricao
) VALUES
(
    'Lançamentos',
    'lancamentos',
    'Camisas e produtos recém-lançados.'
),
(
    'Retrô',
    'retro',
    'Camisas clássicas e históricas.'
),
(
    'Infantil',
    'infantil',
    'Camisas destinadas ao público infantil.'
),
(
    'Box Misteriosas',
    'box-misteriosas',
    'Caixas surpresa com produtos selecionados.'
);

-- ============================================================
-- LIGAS
-- ============================================================

INSERT INTO ligas (
    nome,
    slug,
    pais
) VALUES
(
    'Premier League',
    'premier-league',
    'Inglaterra'
),
(
    'LaLiga',
    'laliga',
    'Espanha'
),
(
    'Brasileirão',
    'brasileirao',
    'Brasil'
),
(
    'Serie A',
    'serie-a',
    'Itália'
),
(
    'Bundesliga',
    'bundesliga',
    'Alemanha'
);

-- ============================================================
-- TIMES
-- ============================================================

INSERT INTO times (
    liga_id,
    nome,
    slug
) VALUES
(
    (SELECT id FROM ligas WHERE slug = 'premier-league'),
    'Arsenal',
    'arsenal'
),
(
    (SELECT id FROM ligas WHERE slug = 'premier-league'),
    'Manchester City',
    'manchester-city'
),
(
    (SELECT id FROM ligas WHERE slug = 'laliga'),
    'Real Madrid',
    'real-madrid'
),
(
    (SELECT id FROM ligas WHERE slug = 'laliga'),
    'Barcelona',
    'barcelona'
),
(
    (SELECT id FROM ligas WHERE slug = 'brasileirao'),
    'Flamengo',
    'flamengo'
),
(
    (SELECT id FROM ligas WHERE slug = 'brasileirao'),
    'Palmeiras',
    'palmeiras'
),
(
    (SELECT id FROM ligas WHERE slug = 'serie-a'),
    'Milan',
    'milan'
),
(
    (SELECT id FROM ligas WHERE slug = 'bundesliga'),
    'Bayern de Munique',
    'bayern-de-munique'
);

-- ============================================================
-- TAMANHOS
-- ============================================================

INSERT INTO tamanhos (
    nome,
    ordem
) VALUES
('P', 1),
('M', 2),
('G', 3),
('GG', 4);

-- ============================================================
-- PRODUTOS
-- ============================================================

INSERT INTO produtos (
    codigo,
    nome,
    slug,
    time_id,
    categoria_id,
    temporada,
    descricao,
    preco,
    preco_promocional,
    desconto_pix,
    destaque,
    mais_vendido
) VALUES
(
    'ARS-H-2425',
    'Camisa Arsenal Home 24/25',
    'camisa-arsenal-home-24-25',

    (SELECT id FROM times
     WHERE slug = 'arsenal'),

    (SELECT id FROM categorias
     WHERE slug = 'lancamentos'),

    '2024/25',

    'Camisa Arsenal Home da temporada 2024/25.',

    179.99,
    149.99,
    5.00,
    TRUE,
    TRUE
),
(
    'RMA-H-2526',
    'Camisa Real Madrid Home 25/26',
    'camisa-real-madrid-home-25-26',

    (SELECT id FROM times
     WHERE slug = 'real-madrid'),

    (SELECT id FROM categorias
     WHERE slug = 'lancamentos'),

    '2025/26',

    'Camisa Real Madrid Home da temporada 2025/26.',

    189.99,
    NULL,
    5.00,
    TRUE,
    TRUE
),
(
    'BAR-H-2526',
    'Camisa Barcelona Home 25/26',
    'camisa-barcelona-home-25-26',

    (SELECT id FROM times
     WHERE slug = 'barcelona'),

    (SELECT id FROM categorias
     WHERE slug = 'lancamentos'),

    '2025/26',

    'Camisa Barcelona Home da temporada 2025/26.',

    189.99,
    169.99,
    5.00,
    TRUE,
    TRUE
),
(
    'FLA-H-2526',
    'Camisa Flamengo Home 25/26',
    'camisa-flamengo-home-25-26',

    (SELECT id FROM times
     WHERE slug = 'flamengo'),

    (SELECT id FROM categorias
     WHERE slug = 'lancamentos'),

    '2025/26',

    'Camisa Flamengo Home da temporada 2025/26.',

    169.99,
    NULL,
    5.00,
    TRUE,
    TRUE
),
(
    'MIL-R-0607',
    'Camisa Milan Retrô 06/07',
    'camisa-milan-retro-06-07',

    (SELECT id FROM times
     WHERE slug = 'milan'),

    (SELECT id FROM categorias
     WHERE slug = 'retro'),

    '2006/07',

    'Camisa retrô inspirada na histórica temporada 2006/07.',

    179.99,
    159.99,
    5.00,
    FALSE,
    TRUE
),
(
    'BAY-H-2526',
    'Camisa Bayern de Munique Home 25/26',
    'camisa-bayern-home-25-26',

    (SELECT id FROM times
     WHERE slug = 'bayern-de-munique'),

    (SELECT id FROM categorias
     WHERE slug = 'lancamentos'),

    '2025/26',

    'Camisa Bayern de Munique Home da temporada 2025/26.',

    179.99,
    NULL,
    5.00,
    FALSE,
    FALSE
);

-- ============================================================
-- ESTOQUE ARSENAL
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 5
        WHEN 'M' THEN 8
        WHEN 'G' THEN 4
        WHEN 'GG' THEN 2
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'ARS-H-2425';

-- ============================================================
-- ESTOQUE REAL MADRID
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 6
        WHEN 'M' THEN 10
        WHEN 'G' THEN 7
        WHEN 'GG' THEN 4
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'RMA-H-2526';

-- ============================================================
-- ESTOQUE BARCELONA
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 3
        WHEN 'M' THEN 7
        WHEN 'G' THEN 6
        WHEN 'GG' THEN 2
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'BAR-H-2526';

-- ============================================================
-- ESTOQUE FLAMENGO
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 8
        WHEN 'M' THEN 12
        WHEN 'G' THEN 9
        WHEN 'GG' THEN 5
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'FLA-H-2526';

-- ============================================================
-- ESTOQUE MILAN
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 2
        WHEN 'M' THEN 4
        WHEN 'G' THEN 3
        WHEN 'GG' THEN 1
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'MIL-R-0607';

-- ============================================================
-- ESTOQUE BAYERN
-- ============================================================

INSERT INTO produto_tamanhos (
    produto_id,
    tamanho_id,
    estoque
)
SELECT
    p.id,
    t.id,
    CASE t.nome
        WHEN 'P' THEN 4
        WHEN 'M' THEN 6
        WHEN 'G' THEN 5
        WHEN 'GG' THEN 3
    END
FROM produtos p
CROSS JOIN tamanhos t
WHERE p.codigo = 'BAY-H-2526';

-- ============================================================
-- IMAGENS DOS PRODUTOS
-- Os arquivos de imagem serão adicionados nas etapas do layout.
-- ============================================================

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/arsenal-home-24-25.jpg',
    'Camisa Arsenal Home 24/25',
    TRUE,
    1
FROM produtos
WHERE codigo = 'ARS-H-2425';

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/real-madrid-home-25-26.jpg',
    'Camisa Real Madrid Home 25/26',
    TRUE,
    1
FROM produtos
WHERE codigo = 'RMA-H-2526';

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/barcelona-home-25-26.jpg',
    'Camisa Barcelona Home 25/26',
    TRUE,
    1
FROM produtos
WHERE codigo = 'BAR-H-2526';

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/flamengo-home-25-26.jpg',
    'Camisa Flamengo Home 25/26',
    TRUE,
    1
FROM produtos
WHERE codigo = 'FLA-H-2526';

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/milan-retro-06-07.jpg',
    'Camisa Milan Retrô 06/07',
    TRUE,
    1
FROM produtos
WHERE codigo = 'MIL-R-0607';

INSERT INTO produto_imagens (
    produto_id,
    caminho,
    texto_alternativo,
    principal,
    ordem
)
SELECT
    id,
    '/images/produtos/bayern-home-25-26.jpg',
    'Camisa Bayern de Munique Home 25/26',
    TRUE,
    1
FROM produtos
WHERE codigo = 'BAY-H-2526';

-- ============================================================
-- CUPONS
-- ============================================================

INSERT INTO cupons (
    codigo,
    descricao,
    tipo,
    valor,
    valor_minimo,
    status
) VALUES
(
    'MANTO10',
    '10% de desconto em compras elegíveis.',
    'Percentual',
    10.00,
    100.00,
    'Ativo'
),
(
    'BEMVINDO20',
    'R$ 20,00 de desconto em compras acima de R$ 200,00.',
    'Valor',
    20.00,
    200.00,
    'Ativo'
);

-- ============================================================
-- PROMOÇÃO
-- ============================================================

INSERT INTO promocoes (
    nome,
    descricao,
    tipo,
    valor,
    data_inicio,
    data_fim,
    status
) VALUES (
    'Promoção de lançamento',
    'Desconto especial em produtos selecionados.',
    'Percentual',
    10.00,
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    'Ativo'
);

-- ============================================================
-- RELACIONAR ARSENAL À PROMOÇÃO
-- ============================================================

INSERT INTO produto_promocoes (
    produto_id,
    promocao_id
)
VALUES (
    (
        SELECT id
        FROM produtos
        WHERE codigo = 'ARS-H-2425'
    ),
    (
        SELECT id
        FROM promocoes
        WHERE nome = 'Promoção de lançamento'
    )
);