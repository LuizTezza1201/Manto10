require('dotenv').config();

const path = require('path');
const ExcelJS = require('exceljs');

const pool = require('../config/database');

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const ARQUIVO_EXCEL = path.join(
    __dirname,
    '..',
    'importacao',
    'estoque.xlsx'
);

const TAMANHOS = [
    'P',
    'M',
    'G',
    'GG'
];

const PRECO_POR_TIPO = {

    'Nacional Premium': {
        preco: 59.99,
        promocional: 39.99,
        prefixo: 'NAC'
    },

    'Tailandesa': {
        preco: 149.99,
        promocional: 119.99,
        prefixo: 'TAIL'
    }

};

// ======================================================
// COLUNAS DA PLANILHA
// ======================================================

const COLUNAS = [

    // ==================================================
    // NACIONAL PREMIUM - P
    // ==================================================

    {
        descricao: 'B',
        quantidade: 'C',
        tipo: 'Nacional Premium',
        tamanho: 'P'
    },

    {
        descricao: 'D',
        quantidade: 'E',
        tipo: 'Nacional Premium',
        tamanho: 'P'
    },

    {
        descricao: 'F',
        quantidade: 'G',
        tipo: 'Nacional Premium',
        tamanho: 'P'
    },

    // ==================================================
    // NACIONAL PREMIUM - M
    // ==================================================

    {
        descricao: 'H',
        quantidade: 'I',
        tipo: 'Nacional Premium',
        tamanho: 'M'
    },

    {
        descricao: 'J',
        quantidade: 'K',
        tipo: 'Nacional Premium',
        tamanho: 'M'
    },

    {
        descricao: 'L',
        quantidade: 'M',
        tipo: 'Nacional Premium',
        tamanho: 'M'
    },

    // ==================================================
    // NACIONAL PREMIUM - G
    // ==================================================

    {
        descricao: 'N',
        quantidade: 'O',
        tipo: 'Nacional Premium',
        tamanho: 'G'
    },

    {
        descricao: 'P',
        quantidade: 'Q',
        tipo: 'Nacional Premium',
        tamanho: 'G'
    },

    {
        descricao: 'R',
        quantidade: 'S',
        tipo: 'Nacional Premium',
        tamanho: 'G'
    },

    // ==================================================
    // NACIONAL PREMIUM - GG
    // ==================================================

    {
        descricao: 'T',
        quantidade: 'U',
        tipo: 'Nacional Premium',
        tamanho: 'GG'
    },

    {
        descricao: 'V',
        quantidade: 'W',
        tipo: 'Nacional Premium',
        tamanho: 'GG'
    },

    {
        descricao: 'X',
        quantidade: 'Y',
        tipo: 'Nacional Premium',
        tamanho: 'GG'
    },

    // ==================================================
    // TAILANDESA - P
    // ==================================================

    {
        descricao: 'Z',
        quantidade: 'AA',
        tipo: 'Tailandesa',
        tamanho: 'P'
    },

    {
        descricao: 'AB',
        quantidade: 'AC',
        tipo: 'Tailandesa',
        tamanho: 'P'
    },

    {
        descricao: 'AD',
        quantidade: 'AE',
        tipo: 'Tailandesa',
        tamanho: 'P'
    },

    // ==================================================
    // TAILANDESA - M
    // ==================================================

    {
        descricao: 'AF',
        quantidade: 'AG',
        tipo: 'Tailandesa',
        tamanho: 'M'
    },

    {
        descricao: 'AH',
        quantidade: 'AI',
        tipo: 'Tailandesa',
        tamanho: 'M'
    },

    {
        descricao: 'AJ',
        quantidade: 'AK',
        tipo: 'Tailandesa',
        tamanho: 'M'
    },

    // ==================================================
    // TAILANDESA - G
    // ==================================================

    {
        descricao: 'AL',
        quantidade: 'AM',
        tipo: 'Tailandesa',
        tamanho: 'G'
    },

    {
        descricao: 'AN',
        quantidade: 'AO',
        tipo: 'Tailandesa',
        tamanho: 'G'
    },

    {
        descricao: 'AP',
        quantidade: 'AQ',
        tipo: 'Tailandesa',
        tamanho: 'G'
    },

    // ==================================================
    // TAILANDESA - GG
    // ==================================================

    {
        descricao: 'AR',
        quantidade: 'AS',
        tipo: 'Tailandesa',
        tamanho: 'GG'
    },

    {
        descricao: 'AT',
        quantidade: 'AU',
        tipo: 'Tailandesa',
        tamanho: 'GG'
    },

    {
        descricao: 'AV',
        quantidade: 'AW',
        tipo: 'Tailandesa',
        tamanho: 'GG'
    }

];

// ======================================================
// CORRESPONDÊNCIAS CONFIRMADAS
// ======================================================
//
// PLANILHA -> PRODUTO EXISTENTE NO BANCO
//
// O tipo da camisa faz parte da chave.
//
// Portanto:
//
// Nacional Premium | Corinthians Total 90
//
// é completamente diferente de:
//
// Tailandesa | Corinthians Total 90
//
// ======================================================

const ALIASES_BRUTOS = [

    [
        'Nacional Premium',
        'Remo Edição Especial',
        'Camisa Remo Especial 2025/26'
    ],

    [
        'Nacional Premium',
        'Brasil Home 1994',
        'Camisa Brasil Home Retro 1994'
    ],

    [
        'Nacional Premium',
        'Corinthians Edição Especial',
        'Camisa Corinthians Especial 2025/26'
    ],

    [
        'Tailandesa',
        'Grêmio Third 24/25',
        'Camisa Grêmio Third 2023/24'
    ],

    [
        'Tailandesa',
        'Inglaterra Away 26/27',
        'Camisa Inglaterra Away 2025/26'
    ],

    [
        'Tailandesa',
        'Portugal Home 26/27',
        'Camisa Portugal Home 2025/26'
    ],

    [
        'Tailandesa',
        'Corinthians Treino 24/25',
        'Camisa Corinthians Treino 2023/24'
    ],

    [
        'Nacional Premium',
        'Brasil Home 1977',
        'Camisa Brasil Home Retro 1978'
    ],

    [
        'Nacional Premium',
        'Brasil Home 1984',
        'Camisa Brasil Home Retro 1986'
    ],

    [
        'Nacional Premium',
        'Barcelona 1999 Edição Especial',
        'Camisa Barcelona Dourada Retro'
    ],

    [
        'Nacional Premium',
        'Corinthians Total 90',
        'Camisa Corinthians Third 2025/26'
    ],

    [
        'Tailandesa',
        'Corinthians Total 90',
        'Camisa Corinthians Third 2025/26'
    ],

    [
        'Tailandesa',
        'Palmeiras Mundial 25/26',
        'Camisa Palmeiras Away 25'
    ]

];

// ======================================================
// PRODUTOS DA PLANILHA QUE NÃO EXISTIAM NAS 81 FOTOS
// ======================================================
//
// REGRA DEFINIDA:
// TODOS ficam com estoque 0.
//
// Eles existirão no banco e futuramente aparecerão no
// painel administrativo.
//
// Como o Produto.js esconde estoque zero, não terão
// cards para os clientes.
//
// ======================================================

const PRODUTOS_NOVOS_ZERADOS = [

    [
        'Nacional Premium',
        'Internazionale Away 25/26'
    ],

    [
        'Nacional Premium',
        'Brasil Away 1994'
    ],

    [
        'Nacional Premium',
        'Liverpool Home 25/26'
    ],

    [
        'Nacional Premium',
        'Barcelona Home 25/26'
    ],

    [
        'Nacional Premium',
        'Napoli Home 25/26'
    ],

    [
        'Tailandesa',
        'Internacional Polo 25/26'
    ],

    [
        'Tailandesa',
        'Barcelona Away 25/26'
    ],

    [
        'Tailandesa',
        'Lazio Away 25/26'
    ],

    [
        'Tailandesa',
        'Internacional Away 25/26'
    ],

    [
        'Tailandesa',
        'Chelsea Total 90 25/26'
    ],

    [
        'Tailandesa',
        'Ajax Home 25/26'
    ],

    [
        'Tailandesa',
        'Sporting Home 25/26'
    ]

];

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function obterValorCelula(celula) {

    const valor = celula.value;

    if (
        valor === null ||
        valor === undefined
    ) {
        return null;
    }

    if (
        typeof valor === 'object'
    ) {

        if (
            valor.result !== undefined
        ) {
            return valor.result;
        }

        if (valor.text) {
            return valor.text;
        }

        if (valor.richText) {

            return valor.richText
                .map(
                    item => item.text
                )
                .join('');
        }
    }

    return valor;
}

// ======================================================
// NORMALIZAR NOME
// ======================================================

function normalizarModelo(texto) {

    if (!texto) {
        return '';
    }

    let nome = String(texto)
        .trim();

    // Remove "Camisa"
    nome = nome.replace(
        /^camisa\s+/i,
        ''
    );

    // Remove acentos
    nome = nome
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        );

    nome = nome.toLowerCase();

    // 2025/26 -> 2526
    nome = nome.replace(
        /\b20(\d{2})\s*[\/-]\s*(\d{2})\b/g,
        '$1$2'
    );

    // 25/26 -> 2526
    nome = nome.replace(
        /\b(\d{2})\s*[\/-]\s*(\d{2})\b/g,
        '$1$2'
    );

    nome = nome.replace(
        /[^a-z0-9]+/g,
        ' '
    );

    nome = nome.replace(
        /\s+/g,
        ' '
    );

    return nome.trim();
}

// ======================================================
// CHAVE ÚNICA LÓGICA
// ======================================================

function criarChave(
    tipo,
    nome
) {

    return (
        tipo +
        '|' +
        normalizarModelo(nome)
    );
}

// ======================================================
// MAPA DE ALIASES
// ======================================================

const ALIASES = new Map();

for (
    const [
        tipo,
        nomeExcel,
        nomeBanco
    ] of ALIASES_BRUTOS
) {

    ALIASES.set(
        criarChave(
            tipo,
            nomeExcel
        ),

        criarChave(
            tipo,
            nomeBanco
        )
    );
}

// ======================================================
// CHAVES DOS NOVOS PRODUTOS
// ======================================================

const CHAVES_NOVOS_ZERADOS =
    new Set(
        PRODUTOS_NOVOS_ZERADOS.map(
            ([tipo, nome]) =>
                criarChave(
                    tipo,
                    nome
                )
        )
    );

// ======================================================
// SLUG
// ======================================================

function slugify(texto) {

    return String(texto)

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9]+/g,
            '-'
        )

        .replace(
            /^-+|-+$/g,
            ''
        );
}

// ======================================================
// FORMATAR NOME
// ======================================================

function formatarNomeProduto(nomeExcel) {

    let nome =
        String(nomeExcel)
            .trim();

    // 25/26 -> 2025/26

    nome = nome.replace(
        /\b(\d{2})\/(\d{2})\b/g,
        '20$1/$2'
    );

    if (
        /^camisa\s+/i.test(nome)
    ) {
        return nome;
    }

    return `Camisa ${nome}`;
}

// ======================================================
// EXTRAIR TEMPORADA
// ======================================================

function extrairTemporada(nomeExcel) {

    const texto =
        String(nomeExcel);

    const temporadaCurta =
        texto.match(
            /\b(\d{2})\/(\d{2})\b/
        );

    if (temporadaCurta) {

        return (
            `20${temporadaCurta[1]}` +
            `/${temporadaCurta[2]}`
        );
    }

    const temporadaLonga =
        texto.match(
            /\b(20\d{2})\/(\d{2})\b/
        );

    if (temporadaLonga) {

        return (
            `${temporadaLonga[1]}` +
            `/${temporadaLonga[2]}`
        );
    }

    const ano =
        texto.match(
            /\b(19\d{2}|20\d{2})\b/
        );

    if (ano) {
        return ano[1];
    }

    return null;
}

// ======================================================
// CATEGORIA
// ======================================================

function obterCategoriaSlug(nome) {

    const texto =
        String(nome)
            .toLowerCase();

    if (
        /19\d{2}/.test(texto) ||
        texto.includes('retro')
    ) {
        return 'retro';
    }

    return 'lancamentos';
}

// ======================================================
// BUSCAR CATEGORIA
// ======================================================

async function buscarCategoriaId(
    connection,
    slug
) {

    const [rows] =
        await connection.execute(
            `
                SELECT id
                FROM categorias

                WHERE slug = ?

                LIMIT 1
            `,
            [slug]
        );

    if (
        rows.length > 0
    ) {
        return rows[0].id;
    }

    // Fallback

    const [fallback] =
        await connection.execute(
            `
                SELECT id
                FROM categorias

                WHERE slug = 'lancamentos'

                LIMIT 1
            `
        );

    if (
        fallback.length === 0
    ) {

        throw new Error(
            'Categoria "lancamentos" não encontrada.'
        );
    }

    return fallback[0].id;
}

// ======================================================
// LER PLANILHA
// ======================================================

async function lerEstoqueExcel() {

    const workbook =
        new ExcelJS.Workbook();

    await workbook.xlsx.readFile(
        ARQUIVO_EXCEL
    );

    const planilha =
        workbook.getWorksheet(1);

    if (!planilha) {

        throw new Error(
            'Nenhuma planilha encontrada em estoque.xlsx.'
        );
    }

    const estoque = new Map();

    // Os dados começam na linha 9.

    for (
        let linha = 9;
        linha <= planilha.rowCount;
        linha++
    ) {

        for (
            const coluna of COLUNAS
        ) {

            const descricao =
                obterValorCelula(
                    planilha.getCell(
                        `${coluna.descricao}${linha}`
                    )
                );

            if (
                descricao === null ||
                String(descricao).trim() === ''
            ) {
                continue;
            }

            const quantidadeBruta =
                obterValorCelula(
                    planilha.getCell(
                        `${coluna.quantidade}${linha}`
                    )
                );

            const quantidade =
                Number(
                    quantidadeBruta || 0
                );

            if (
                !Number.isFinite(
                    quantidade
                ) ||
                !Number.isInteger(
                    quantidade
                ) ||
                quantidade < 0
            ) {

                throw new Error(
                    `Quantidade inválida na planilha: ${descricao}`
                );
            }

            const chave =
                criarChave(
                    coluna.tipo,
                    descricao
                );

            if (
                !estoque.has(
                    chave
                )
            ) {

                estoque.set(
                    chave,
                    {
                        nome:
                            String(
                                descricao
                            ).trim(),

                        tipo:
                            coluna.tipo,

                        P: 0,
                        M: 0,
                        G: 0,
                        GG: 0
                    }
                );
            }

            const item =
                estoque.get(
                    chave
                );

            item[
                coluna.tamanho
            ] += quantidade;
        }
    }

    // ==================================================
    // REGRA DO MANTO 10
    // ==================================================
    //
    // Todos os 12 produtos que não estavam nas fotos
    // ficam com estoque ZERO.
    //
    // Isso inclui:
    // Napoli Nacional Premium
    // Ajax Tailandesa
    //
    // ==================================================

    for (
        const chave
        of CHAVES_NOVOS_ZERADOS
    ) {

        const item =
            estoque.get(
                chave
            );

        if (!item) {
            continue;
        }

        item.P = 0;
        item.M = 0;
        item.G = 0;
        item.GG = 0;
    }

    return estoque;
}

// ======================================================
// TOTAL DA PLANILHA APÓS AS REGRAS
// ======================================================

function calcularTotalEstoque(
    estoque
) {

    let total = 0;

    for (
        const item
        of estoque.values()
    ) {

        total +=
            item.P +
            item.M +
            item.G +
            item.GG;
    }

    return total;
}

// ======================================================
// BUSCAR TAMANHOS NO BANCO
// ======================================================

async function buscarTamanhos(
    connection
) {

    const [rows] =
        await connection.execute(
            `
                SELECT
                    id,
                    nome

                FROM tamanhos

                WHERE status = 'Ativo'

                ORDER BY ordem
            `
        );

    const mapa =
        new Map();

    for (
        const tamanho of rows
    ) {

        mapa.set(
            tamanho.nome,
            tamanho.id
        );
    }

    for (
        const nome
        of TAMANHOS
    ) {

        if (
            !mapa.has(nome)
        ) {

            throw new Error(
                `Tamanho "${nome}" não encontrado no banco.`
            );
        }
    }

    return mapa;
}

// ======================================================
// CARREGAR PRODUTOS DO BANCO
// ======================================================

async function carregarProdutos(
    connection
) {

    const [rows] =
        await connection.execute(
            `
                SELECT
                    id,
                    codigo,
                    nome,
                    slug,
                    tipo_camisa

                FROM produtos
            `
        );

    const mapa =
        new Map();

    for (
        const produto of rows
    ) {

        const chave =
            criarChave(
                produto.tipo_camisa,
                produto.nome
            );

        if (
            mapa.has(chave)
        ) {

            throw new Error(
                `Produto duplicado no banco: ${produto.tipo_camisa} | ${produto.nome}`
            );
        }

        mapa.set(
            chave,
            produto
        );
    }

    return mapa;
}

// ======================================================
// CRIAR OS 12 PRODUTOS QUE FALTAM
// ======================================================

async function criarProdutosZerados(
    connection,
    produtosBanco,
    tamanhos
) {

    let criados = 0;

    for (
        let indice = 0;
        indice <
        PRODUTOS_NOVOS_ZERADOS.length;
        indice++
    ) {

        const [
            tipo,
            nomeExcel
        ] =
            PRODUTOS_NOVOS_ZERADOS[
                indice
            ];

        const chave =
            criarChave(
                tipo,
                nomeExcel
            );

        // Já existe?
        if (
            produtosBanco.has(
                chave
            )
        ) {
            continue;
        }

        const configuracao =
            PRECO_POR_TIPO[
                tipo
            ];

        if (!configuracao) {

            throw new Error(
                `Tipo inválido: ${tipo}`
            );
        }

        const nomeProduto =
            formatarNomeProduto(
                nomeExcel
            );

        const slug =
            slugify(
                `${nomeProduto} ${tipo}`
            );

        const codigo =
            `${configuracao.prefixo}-EXCEL-${String(
                indice + 1
            ).padStart(
                3,
                '0'
            )}`;

        const temporada =
            extrairTemporada(
                nomeExcel
            );

        const categoriaSlug =
            obterCategoriaSlug(
                nomeExcel
            );

        const categoriaId =
            await buscarCategoriaId(
                connection,
                categoriaSlug
            );

        // ==================================================
        // PRODUTO
        // ==================================================

        const [resultado] =
            await connection.execute(
                `
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
                        ?,
                        ?,
                        ?,
                        NULL,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        5.00,
                        FALSE,
                        FALSE,
                        'Ativo'
                    )
                `,
                [
                    codigo,
                    nomeProduto,
                    slug,
                    categoriaId,
                    temporada,

                    `${nomeProduto} - ${tipo}.`,

                    tipo,

                    configuracao.preco,

                    configuracao.promocional
                ]
            );

        const produtoId =
            resultado.insertId;

        // ==================================================
        // PLACEHOLDER
        // ==================================================

        await connection.execute(
            `
                INSERT INTO produto_imagens (
                    produto_id,
                    caminho,
                    texto_alternativo,
                    principal,
                    ordem
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    TRUE,
                    1
                )
            `,
            [
                produtoId,

                '/images/produtos/placeholder.svg',

                nomeProduto
            ]
        );

        // ==================================================
        // P / M / G / GG = 0
        // ==================================================

        for (
            const tamanho
            of TAMANHOS
        ) {

            await connection.execute(
                `
                    INSERT INTO produto_tamanhos (
                        produto_id,
                        tamanho_id,
                        estoque
                    )
                    VALUES (
                        ?,
                        ?,
                        0
                    )
                `,
                [
                    produtoId,

                    tamanhos.get(
                        tamanho
                    )
                ]
            );
        }

        criados++;

        console.log(
            `+ Admin: ${tipo} | ${nomeProduto}`
        );
    }

    return criados;
}

// ======================================================
// MONTAR ESTOQUE POR PRODUTO
// ======================================================

function montarEstoquePorProduto(
    estoqueExcel,
    produtosBanco
) {

    const estoquePorProduto =
        new Map();

    const naoEncontrados = [];

    const produtosUsados =
        new Set();

    for (
        const [
            chaveExcel,
            itemExcel
        ]
        of estoqueExcel.entries()
    ) {

        let chaveBanco =
            chaveExcel;

        if (
            ALIASES.has(
                chaveExcel
            )
        ) {

            chaveBanco =
                ALIASES.get(
                    chaveExcel
                );
        }

        const produto =
            produtosBanco.get(
                chaveBanco
            );

        if (!produto) {

            naoEncontrados.push(
                `${itemExcel.tipo} | ${itemExcel.nome}`
            );

            continue;
        }

        // Segurança:
        // Nacional e Tailandesa nunca podem se misturar.

        if (
            produto.tipo_camisa !==
            itemExcel.tipo
        ) {

            throw new Error(
                `Tipo incorreto para ${itemExcel.nome}.`
            );
        }

        produtosUsados.add(
            produto.id
        );

        if (
            !estoquePorProduto.has(
                produto.id
            )
        ) {

            estoquePorProduto.set(
                produto.id,
                {
                    produto,

                    P: 0,
                    M: 0,
                    G: 0,
                    GG: 0
                }
            );
        }

        const destino =
            estoquePorProduto.get(
                produto.id
            );

        destino.P +=
            itemExcel.P;

        destino.M +=
            itemExcel.M;

        destino.G +=
            itemExcel.G;

        destino.GG +=
            itemExcel.GG;
    }

    return {
        estoquePorProduto,
        naoEncontrados,
        produtosUsados
    };
}

// ======================================================
// ATUALIZAR UMA QUANTIDADE
// ======================================================

async function atualizarEstoqueTamanho(
    connection,
    produtoId,
    tamanhoId,
    quantidade
) {

    const [resultado] =
        await connection.execute(
            `
                UPDATE produto_tamanhos

                SET estoque = ?

                WHERE
                    produto_id = ?
                    AND tamanho_id = ?
            `,
            [
                quantidade,
                produtoId,
                tamanhoId
            ]
        );

    if (
        resultado.affectedRows > 0
    ) {
        return;
    }

    // Caso algum produto não tenha a combinação criada.

    await connection.execute(
        `
            INSERT INTO produto_tamanhos (
                produto_id,
                tamanho_id,
                estoque
            )
            VALUES (
                ?,
                ?,
                ?
            )
        `,
        [
            produtoId,
            tamanhoId,
            quantidade
        ]
    );
}

// ======================================================
// CONFERIR RESULTADO
// ======================================================

async function conferirBanco(
    connection
) {

    const [[geral]] =
        await connection.execute(
            `
                SELECT
                    COUNT(
                        DISTINCT p.id
                    ) AS produtos,

                    COALESCE(
                        SUM(pt.estoque),
                        0
                    ) AS estoque_total

                FROM produtos p

                LEFT JOIN produto_tamanhos pt
                    ON pt.produto_id = p.id
            `
        );

    const [porTipo] =
        await connection.execute(
            `
                SELECT
                    p.tipo_camisa,

                    COALESCE(
                        SUM(pt.estoque),
                        0
                    ) AS estoque

                FROM produtos p

                LEFT JOIN produto_tamanhos pt
                    ON pt.produto_id = p.id

                GROUP BY
                    p.tipo_camisa

                ORDER BY
                    p.tipo_camisa
            `
        );

    const [porTamanho] =
        await connection.execute(
            `
                SELECT
                    t.nome AS tamanho,

                    COALESCE(
                        SUM(pt.estoque),
                        0
                    ) AS estoque

                FROM tamanhos t

                LEFT JOIN produto_tamanhos pt
                    ON pt.tamanho_id = t.id

                WHERE
                    t.status = 'Ativo'

                GROUP BY
                    t.id,
                    t.nome,
                    t.ordem

                ORDER BY
                    t.ordem
            `
        );

    const [[visibilidade]] =
        await connection.execute(
            `
                SELECT

                    SUM(
                        CASE
                            WHEN estoque_total > 0
                            THEN 1
                            ELSE 0
                        END
                    ) AS com_estoque,

                    SUM(
                        CASE
                            WHEN estoque_total = 0
                            THEN 1
                            ELSE 0
                        END
                    ) AS sem_estoque

                FROM (
                    SELECT
                        p.id,

                        COALESCE(
                            SUM(pt.estoque),
                            0
                        ) AS estoque_total

                    FROM produtos p

                    LEFT JOIN produto_tamanhos pt
                        ON pt.produto_id = p.id

                    GROUP BY
                        p.id
                ) AS estoque_produtos
            `
        );

    return {
        geral,
        porTipo,
        porTamanho,
        visibilidade
    };
}

// ======================================================
// EXECUTAR
// ======================================================

async function executar() {

    let connection;

    try {

        console.log('');
        console.log(
            '=============================================='
        );
        console.log(
            '     IMPORTAR ESTOQUE REAL - MANTO 10'
        );
        console.log(
            '=============================================='
        );
        console.log('');

        // ==================================================
        // 1. LER EXCEL
        // ==================================================

        const estoqueExcel =
            await lerEstoqueExcel();

        const totalExcel =
            calcularTotalEstoque(
                estoqueExcel
            );

        console.log(
            `Produtos/qualidades na planilha: ${estoqueExcel.size}`
        );

        console.log(
            `Estoque após ajustes: ${totalExcel}`
        );

        console.log('');

        // ==================================================
        // TRAVAS DE SEGURANÇA
        // ==================================================

        if (
            estoqueExcel.size !== 93
        ) {

            throw new Error(
                `Esperávamos 93 produtos/qualidades, mas foram encontrados ${estoqueExcel.size}.`
            );
        }

        if (
            totalExcel !== 196
        ) {

            throw new Error(
                `Esperávamos 196 unidades após zerar os 12 produtos sem foto, mas foram encontradas ${totalExcel}.`
            );
        }

        // ==================================================
        // 2. BANCO
        // ==================================================

        connection =
            await pool.getConnection();

        await connection
            .beginTransaction();

        const tamanhos =
            await buscarTamanhos(
                connection
            );

        let produtosBanco =
            await carregarProdutos(
                connection
            );

        // ==================================================
        // O banco deve ter 81 antes da primeira importação.
        //
        // Se o script já tiver sido executado antes,
        // poderá ter 93.
        // ==================================================

        if (
            produtosBanco.size !== 81 &&
            produtosBanco.size !== 93
        ) {

            throw new Error(
                `O banco possui ${produtosBanco.size} produtos. Esperávamos 81 ou 93.`
            );
        }

        // ==================================================
        // 3. CRIAR OS 12 ZERADOS
        // ==================================================

        const criados =
            await criarProdutosZerados(
                connection,
                produtosBanco,
                tamanhos
            );

        // Recarrega produtos.

        produtosBanco =
            await carregarProdutos(
                connection
            );

        if (
            produtosBanco.size !== 93
        ) {

            throw new Error(
                `Após cadastrar os produtos do admin, deveriam existir 93 produtos, mas existem ${produtosBanco.size}.`
            );
        }

        // ==================================================
        // 4. CORRESPONDÊNCIAS
        // ==================================================

        const {
            estoquePorProduto,
            naoEncontrados,
            produtosUsados
        } =
            montarEstoquePorProduto(
                estoqueExcel,
                produtosBanco
            );

        if (
            naoEncontrados.length > 0
        ) {

            console.log('');
            console.log(
                'PRODUTOS SEM CORRESPONDÊNCIA:'
            );

            for (
                const produto
                of naoEncontrados
            ) {

                console.log(
                    `❌ ${produto}`
                );
            }

            throw new Error(
                'Importação cancelada: ainda existem produtos sem correspondência.'
            );
        }

        if (
            produtosUsados.size !== 93
        ) {

            throw new Error(
                `Foram relacionados ${produtosUsados.size} produtos diferentes, mas deveriam ser 93.`
            );
        }

        // ==================================================
        // 5. ZERAR ESTOQUE EXISTENTE
        // ==================================================
        //
        // A planilha passa a ser a referência oficial.
        //
        // ==================================================

        await connection.execute(
            `
                UPDATE produto_tamanhos
                SET estoque = 0
                WHERE id > 0
            `
        );

        // ==================================================
        // 6. IMPORTAR P / M / G / GG
        // ==================================================

        for (
            const item
            of estoquePorProduto.values()
        ) {

            for (
                const tamanho
                of TAMANHOS
            ) {

                await atualizarEstoqueTamanho(
                    connection,

                    item.produto.id,

                    tamanhos.get(
                        tamanho
                    ),

                    item[
                        tamanho
                    ]
                );
            }
        }

        // ==================================================
        // 7. CONFERÊNCIA ANTES DO COMMIT
        // ==================================================

        const resultado =
            await conferirBanco(
                connection
            );

        const totalBanco =
            Number(
                resultado
                    .geral
                    .estoque_total
            );

        const totalProdutos =
            Number(
                resultado
                    .geral
                    .produtos
            );

        if (
            totalProdutos !== 93
        ) {

            throw new Error(
                `O banco ficou com ${totalProdutos} produtos em vez de 93.`
            );
        }

        if (
            totalBanco !== 196
        ) {

            throw new Error(
                `O estoque do banco ficou em ${totalBanco}, mas deveria ser 196.`
            );
        }

        // ==================================================
        // CONFERIR POR TIPO
        // ==================================================

        const estoqueTipos =
            new Map();

        for (
            const linha
            of resultado.porTipo
        ) {

            estoqueTipos.set(
                linha.tipo_camisa,
                Number(
                    linha.estoque
                )
            );
        }

        if (
            estoqueTipos.get(
                'Nacional Premium'
            ) !== 82
        ) {

            throw new Error(
                'O estoque Nacional Premium deveria totalizar 82 unidades.'
            );
        }

        if (
            estoqueTipos.get(
                'Tailandesa'
            ) !== 114
        ) {

            throw new Error(
                'O estoque Tailandesa deveria totalizar 114 unidades.'
            );
        }

        // ==================================================
        // CONFERIR POR TAMANHO
        // ==================================================

        const estoqueTamanhos =
            new Map();

        for (
            const linha
            of resultado.porTamanho
        ) {

            estoqueTamanhos.set(
                linha.tamanho,
                Number(
                    linha.estoque
                )
            );
        }

        const esperadoTamanho = {
            P: 38,
            M: 59,
            G: 49,
            GG: 50
        };

        for (
            const tamanho
            of TAMANHOS
        ) {

            if (
                estoqueTamanhos.get(
                    tamanho
                ) !==
                esperadoTamanho[
                    tamanho
                ]
            ) {

                throw new Error(
                    `Estoque ${tamanho} incorreto. Esperado: ${esperadoTamanho[tamanho]}.`
                );
            }
        }

        // ==================================================
        // 8. COMMIT
        // ==================================================

        await connection.commit();

        // ==================================================
        // RESULTADO
        // ==================================================

        console.log('');
        console.log(
            '=============================================='
        );
        console.log(
            '        IMPORTAÇÃO CONCLUÍDA'
        );
        console.log(
            '=============================================='
        );
        console.log('');

        console.log(
            `Novos produtos criados: ${criados}`
        );

        console.log(
            `Produtos no banco: ${totalProdutos}`
        );

        console.log(
            `Estoque total: ${totalBanco}`
        );

        console.log('');

        console.log(
            'POR TIPO'
        );

        console.log(
            `Nacional Premium: ${estoqueTipos.get('Nacional Premium')}`
        );

        console.log(
            `Tailandesa: ${estoqueTipos.get('Tailandesa')}`
        );

        console.log('');

        console.log(
            'POR TAMANHO'
        );

        console.log(
            `P: ${estoqueTamanhos.get('P')}`
        );

        console.log(
            `M: ${estoqueTamanhos.get('M')}`
        );

        console.log(
            `G: ${estoqueTamanhos.get('G')}`
        );

        console.log(
            `GG: ${estoqueTamanhos.get('GG')}`
        );

        console.log('');

        console.log(
            `Produtos com estoque: ${resultado.visibilidade.com_estoque}`
        );

        console.log(
            `Produtos zerados: ${resultado.visibilidade.sem_estoque}`
        );

        console.log('');

        console.log(
            'Os produtos zerados permanecem disponíveis para o painel administrativo.'
        );

        console.log(
            'Eles não aparecem no catálogo público.'
        );

        console.log('');

    } catch (erro) {

        if (connection) {

            try {

                await connection
                    .rollback();

            } catch (
                erroRollback
            ) {

                console.error(
                    'Erro ao desfazer transação:',
                    erroRollback.message
                );
            }
        }

        console.log('');
        console.error(
            '=============================================='
        );

        console.error(
            'IMPORTAÇÃO CANCELADA'
        );

        console.error(
            '=============================================='
        );

        console.error(
            erro.message
        );

        console.log('');
        console.log(
            'Nenhuma alteração parcial foi salva.'
        );

        console.log('');

    } finally {

        if (connection) {
            connection.release();
        }

        await pool.end();
    }
}

executar();