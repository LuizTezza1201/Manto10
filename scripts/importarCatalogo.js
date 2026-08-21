require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/database');

// ======================================================
// CAMINHOS
// ======================================================

const raizProjeto = path.join(__dirname, '..');

const pastaImportacao = path.join(
    raizProjeto,
    'importacao',
    'camisas'
);

const pastaDestino = path.join(
    raizProjeto,
    'public',
    'images',
    'produtos'
);

// ======================================================
// TIPOS DE CAMISA
// ======================================================

const TIPOS = {
    tailandesas: {
        nome: 'Tailandesa',
        codigo: 'TAIL',
        preco: 149.99,
        precoPromocional: 119.99
    },

    'nacionais-premium': {
        nome: 'Nacional Premium',
        codigo: 'NAC',
        preco: 59.99,
        precoPromocional: 39.99
    }
};

// Começaremos sem inventar estoque.
// Depois vamos controlar isso pelo painel administrativo.
const ESTOQUE_INICIAL = 0;

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function slugify(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function limparNomeArquivo(arquivo) {
    return path
        .parse(arquivo)
        .name
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatarTemporada(nome) {
    return nome.replace(
        /\b(2\d)(\d{2})\b/g,
        (resultado, inicio, fim) => {
            return `20${inicio}/${fim}`;
        }
    );
}

function criarNomeProduto(arquivo) {
    const nome = limparNomeArquivo(arquivo);
    return `Camisa ${formatarTemporada(nome)}`;
}

function obterTemporada(arquivo) {
    const nome = limparNomeArquivo(arquivo);

    const temporada = nome.match(/\b(2\d)(\d{2})\b/);

    if (temporada) {
        return `20${temporada[1]}/${temporada[2]}`;
    }

    const ano = nome.match(/\b(20\d{2})\b/);

    if (ano) {
        return ano[1];
    }

    return null;
}

function obterCategoriaSlug(arquivo) {
    const nome = arquivo.toLowerCase();

    if (nome.includes('retro')) {
        return 'retro';
    }

    if (nome.includes('infantil')) {
        return 'infantil';
    }

    return 'lancamentos';
}

// ======================================================
// CATEGORIA
// ======================================================

async function buscarCategoriaId(connection, slug) {
    const [rows] = await connection.execute(
        `
        SELECT id
        FROM categorias
        WHERE slug = ?
        LIMIT 1
        `,
        [slug]
    );

    if (rows.length > 0) {
        return rows[0].id;
    }

    // Se a categoria específica não existir,
    // usa lançamentos.
    const [padrao] = await connection.execute(
        `
        SELECT id
        FROM categorias
        WHERE slug = 'lancamentos'
        LIMIT 1
        `
    );

    if (padrao.length === 0) {
        throw new Error(
            'A categoria "lancamentos" não existe no banco.'
        );
    }

    return padrao[0].id;
}

// ======================================================
// TAMANHOS
// ======================================================

async function buscarTamanhos(connection) {
    const [rows] = await connection.execute(
        `
        SELECT *
        FROM tamanhos
        ORDER BY id
        `
    );

    if (rows.length === 0) {
        throw new Error(
            'Nenhum tamanho foi encontrado na tabela tamanhos.'
        );
    }

    return rows;
}

// ======================================================
// PASTAS
// ======================================================

async function prepararPastas() {
    await fs.mkdir(
        path.join(
            pastaDestino,
            'tailandesas'
        ),
        {
            recursive: true
        }
    );

    await fs.mkdir(
        path.join(
            pastaDestino,
            'nacionais-premium'
        ),
        {
            recursive: true
        }
    );
}

// ======================================================
// IMPORTAR TIPO
// ======================================================

async function importarPasta(
    connection,
    pasta,
    configuracao,
    tamanhos
) {
    const origem = path.join(
        pastaImportacao,
        pasta
    );

    const destino = path.join(
        pastaDestino,
        pasta
    );

    let arquivos;

    try {
        arquivos = await fs.readdir(origem);
    } catch (erro) {
        throw new Error(
            `Não encontrei a pasta: ${origem}`
        );
    }

    const imagens = arquivos.filter((arquivo) =>
        /\.(jpg|jpeg|png|webp)$/i.test(arquivo)
    );

    console.log('');
    console.log(
        `${configuracao.nome}: ${imagens.length} imagens encontradas.`
    );
    console.log('');

    let importados = 0;

    for (let i = 0; i < imagens.length; i++) {
        const arquivo = imagens[i];

        const nomeProduto = criarNomeProduto(arquivo);
        const temporada = obterTemporada(arquivo);

        const categoriaSlug =
            obterCategoriaSlug(arquivo);

        const categoriaId =
            await buscarCategoriaId(
                connection,
                categoriaSlug
            );

        // --------------------------------------------------
        // SLUG
        // --------------------------------------------------

        const slug = slugify(
            `${limparNomeArquivo(arquivo)} ${configuracao.nome}`
        );

        // --------------------------------------------------
        // CÓDIGO
        // --------------------------------------------------

        const codigo = `${configuracao.codigo}-${String(
            i + 1
        ).padStart(3, '0')}`;

        // --------------------------------------------------
        // IMAGEM
        // --------------------------------------------------

        const extensaoOriginal =
            path.extname(arquivo).toLowerCase();

        const extensao =
            extensaoOriginal || '.jpg';

        const nomeImagem =
            `${slug}${extensao}`;

        const origemImagem = path.join(
            origem,
            arquivo
        );

        const destinoImagem = path.join(
            destino,
            nomeImagem
        );

        await fs.copyFile(
            origemImagem,
            destinoImagem
        );

        const caminhoImagem =
            `/images/produtos/${pasta}/${nomeImagem}`;

        // --------------------------------------------------
        // VERIFICAR SE JÁ EXISTE
        // --------------------------------------------------

        const [produtoExistente] =
            await connection.execute(
                `
                SELECT id
                FROM produtos
                WHERE slug = ?
                LIMIT 1
                `,
                [slug]
            );

        let produtoId;

        if (produtoExistente.length > 0) {
            produtoId =
                produtoExistente[0].id;

            console.log(
                `↻ Já existe: ${nomeProduto}`
            );
        } else {
            // --------------------------------------------------
            // PRODUTO
            // --------------------------------------------------

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
                        0,
                        0,
                        'Ativo'
                    )
                    `,
                    [
                        codigo,
                        nomeProduto,
                        slug,
                        categoriaId,
                        temporada,
                        `${nomeProduto} - ${configuracao.nome}.`,
                        configuracao.nome,
                        configuracao.preco,
                        configuracao.precoPromocional
                    ]
                );

            produtoId = resultado.insertId;

            // --------------------------------------------------
            // FOTO PRINCIPAL
            // --------------------------------------------------

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
                    1,
                    1
                )
                `,
                [
                    produtoId,
                    caminhoImagem,
                    nomeProduto
                ]
            );

            // --------------------------------------------------
            // TAMANHOS
            // --------------------------------------------------

            for (const tamanho of tamanhos) {
                await connection.execute(
                    `
                    INSERT INTO produto_tamanhos (
                        produto_id,
                        tamanho_id,
                        estoque
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        produtoId,
                        tamanho.id,
                        ESTOQUE_INICIAL
                    ]
                );
            }

            importados++;

            console.log(
                `✓ ${configuracao.nome} | ${nomeProduto}`
            );
        }
    }

    return importados;
}

// ======================================================
// EXECUTAR IMPORTAÇÃO
// ======================================================

async function executar() {
    let connection;

    try {
        console.log('');
        console.log(
            '=========================================='
        );
        console.log(
            '       MANTO 10 - IMPORTAR CATÁLOGO'
        );
        console.log(
            '=========================================='
        );

        await prepararPastas();

        connection =
            await pool.getConnection();

        await connection.beginTransaction();

        const tamanhos =
            await buscarTamanhos(
                connection
            );

        let total = 0;

        for (
            const [
                pasta,
                configuracao
            ] of Object.entries(TIPOS)
        ) {
            total += await importarPasta(
                connection,
                pasta,
                configuracao,
                tamanhos
            );
        }

        await connection.commit();

        console.log('');
        console.log(
            '=========================================='
        );
        console.log(
            `IMPORTAÇÃO CONCLUÍDA`
        );
        console.log(
            `Novos produtos: ${total}`
        );
        console.log(
            '=========================================='
        );
        console.log('');

    } catch (erro) {
        if (connection) {
            await connection.rollback();
        }

        console.error('');
        console.error(
            'ERRO AO IMPORTAR O CATÁLOGO:'
        );
        console.error(erro.message);
        console.error('');

    } finally {
        if (connection) {
            connection.release();
        }

        await pool.end();
    }
}

executar();