require('dotenv').config();

const path = require('path');
const ExcelJS = require('exceljs');

const pool = require('../config/database');

const arquivoExcel = path.join(
    __dirname,
    '..',
    'importacao',
    'estoque.xlsx'
);

// ======================================================
// COLUNAS DA PLANILHA
// ======================================================

const COLUNAS = [

    // ==============================================
    // NACIONAL PREMIUM - P
    // ==============================================

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

    // ==============================================
    // NACIONAL PREMIUM - M
    // ==============================================

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

    // ==============================================
    // NACIONAL PREMIUM - G
    // ==============================================

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

    // ==============================================
    // NACIONAL PREMIUM - GG
    // ==============================================

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

    // ==============================================
    // TAILANDESA - P
    // ==============================================

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

    // ==============================================
    // TAILANDESA - M
    // ==============================================

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

    // ==============================================
    // TAILANDESA - G
    // ==============================================

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

    // ==============================================
    // TAILANDESA - GG
    // ==============================================

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
// VALOR DA CÉLULA
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
                .map(item => item.text)
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

    // Remove "Camisa" usado no banco
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

    /*
     * Banco:
     * Arsenal Home 2025/26
     *
     * Excel:
     * Arsenal Home 25/26
     *
     * Ambos viram:
     * arsenal home 2526
     */

    nome = nome.replace(
        /\b20(\d{2})\s*[\/-]\s*(\d{2})\b/g,
        '$1$2'
    );

    nome = nome.replace(
        /\b(\d{2})\s*[\/-]\s*(\d{2})\b/g,
        '$1$2'
    );

    // Pontuação e hífens
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
// CHAVE PRODUTO
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
// EXECUTAR
// ======================================================

async function executar() {

    try {

        console.log('');
        console.log(
            '============================================'
        );
        console.log(
            '   CONFERÊNCIA DE ESTOQUE - MANTO 10'
        );
        console.log(
            '============================================'
        );
        console.log('');

        // ==========================================
        // EXCEL
        // ==========================================

        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.readFile(
            arquivoExcel
        );

        const planilha =
            workbook.getWorksheet(1);

        if (!planilha) {

            throw new Error(
                'Nenhuma planilha encontrada.'
            );
        }

        const estoqueExcel =
            new Map();

        let totalUnidades = 0;

        const totaisTipo = {
            'Nacional Premium': 0,
            'Tailandesa': 0
        };

        const totaisTamanho = {
            P: 0,
            M: 0,
            G: 0,
            GG: 0
        };

        /*
         * Estoque começa na linha 9.
         *
         * Podemos percorrer até rowCount,
         * pois usamos somente as colunas
         * B até AW.
         */

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

                const valorQuantidade =
                    obterValorCelula(
                        planilha.getCell(
                            `${coluna.quantidade}${linha}`
                        )
                    );

                const quantidade =
                    Number(
                        valorQuantidade || 0
                    );

                if (
                    !Number.isFinite(
                        quantidade
                    ) ||
                    quantidade < 0
                ) {

                    console.log(
                        `⚠ Quantidade inválida: ${descricao}`
                    );

                    continue;
                }

                const chave =
                    criarChave(
                        coluna.tipo,
                        descricao
                    );

                if (
                    !estoqueExcel.has(
                        chave
                    )
                ) {

                    estoqueExcel.set(
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

                const produto =
                    estoqueExcel.get(
                        chave
                    );

                /*
                 * Se o mesmo modelo aparecer
                 * mais de uma vez para o mesmo
                 * tamanho, somamos.
                 */

                produto[
                    coluna.tamanho
                ] += quantidade;

                totalUnidades +=
                    quantidade;

                totaisTipo[
                    coluna.tipo
                ] += quantidade;

                totaisTamanho[
                    coluna.tamanho
                ] += quantidade;
            }
        }

        // ==========================================
        // BANCO
        // ==========================================

        const [produtosBanco] =
            await pool.execute(
                `
                SELECT
                    id,
                    nome,
                    tipo_camisa

                FROM produtos

                ORDER BY
                    tipo_camisa,
                    nome
                `
            );

        const produtosPorChave =
            new Map();

        const duplicadosBanco = [];

        for (
            const produto of produtosBanco
        ) {

            const chave =
                criarChave(
                    produto.tipo_camisa,
                    produto.nome
                );

            if (
                produtosPorChave.has(
                    chave
                )
            ) {

                duplicadosBanco.push(
                    produto
                );

                continue;
            }

            produtosPorChave.set(
                chave,
                produto
            );
        }

        // ==========================================
        // COMPARAÇÃO
        // ==========================================

        const encontrados = [];

        const naoEncontradosNoBanco =
            [];

        for (
            const [
                chave,
                produtoExcel
            ]
            of estoqueExcel.entries()
        ) {

            if (
                produtosPorChave.has(
                    chave
                )
            ) {

                encontrados.push({
                    excel:
                        produtoExcel,

                    banco:
                        produtosPorChave.get(
                            chave
                        )
                });

            } else {

                naoEncontradosNoBanco.push(
                    produtoExcel
                );
            }
        }

        const semRegistroNoExcel = [];

        for (
            const [
                chave,
                produtoBanco
            ]
            of produtosPorChave.entries()
        ) {

            if (
                !estoqueExcel.has(
                    chave
                )
            ) {

                semRegistroNoExcel.push(
                    produtoBanco
                );
            }
        }

        // ==========================================
        // RESULTADO
        // ==========================================

        console.log(
            'PLANILHA'
        );

        console.log(
            `Produtos/qualidades diferentes: ${estoqueExcel.size}`
        );

        console.log(
            `Unidades reais: ${totalUnidades}`
        );

        console.log('');

        console.log(
            'POR QUALIDADE'
        );

        console.log(
            `Nacional Premium: ${totaisTipo['Nacional Premium']}`
        );

        console.log(
            `Tailandesa: ${totaisTipo['Tailandesa']}`
        );

        console.log('');

        console.log(
            'POR TAMANHO'
        );

        console.log(
            `P: ${totaisTamanho.P}`
        );

        console.log(
            `M: ${totaisTamanho.M}`
        );

        console.log(
            `G: ${totaisTamanho.G}`
        );

        console.log(
            `GG: ${totaisTamanho.GG}`
        );

        console.log('');

        console.log(
            'BANCO DE DADOS'
        );

        console.log(
            `Produtos cadastrados: ${produtosBanco.length}`
        );

        console.log('');

        console.log(
            'COMPARAÇÃO'
        );

        console.log(
            `Encontrados: ${encontrados.length}`
        );

        console.log(
            `Da planilha não encontrados no banco: ${naoEncontradosNoBanco.length}`
        );

        console.log(
            `Do banco sem registro na planilha: ${semRegistroNoExcel.length}`
        );

        console.log('');

        // ==========================================
        // NÃO ENCONTRADOS
        // ==========================================

        if (
            naoEncontradosNoBanco.length >
            0
        ) {

            console.log(
                '--------------------------------------------'
            );

            console.log(
                'PLANILHA → NÃO ENCONTRADOS NO BANCO'
            );

            console.log(
                '--------------------------------------------'
            );

            for (
                const item
                of naoEncontradosNoBanco
            ) {

                console.log(
                    `❌ ${item.tipo} | ${item.nome}`
                );
            }

            console.log('');
        }

        // ==========================================
        // BANCO SEM EXCEL
        // ==========================================

        if (
            semRegistroNoExcel.length >
            0
        ) {

            console.log(
                '--------------------------------------------'
            );

            console.log(
                'BANCO → SEM REGISTRO NA PLANILHA'
            );

            console.log(
                '--------------------------------------------'
            );

            for (
                const item
                of semRegistroNoExcel
            ) {

                console.log(
                    `⚠ ${item.tipo_camisa} | ${item.nome}`
                );
            }

            console.log('');
        }

        // ==========================================
        // DUPLICADOS
        // ==========================================

        if (
            duplicadosBanco.length > 0
        ) {

            console.log(
                '--------------------------------------------'
            );

            console.log(
                'POSSÍVEIS DUPLICADOS NO BANCO'
            );

            console.log(
                '--------------------------------------------'
            );

            for (
                const item
                of duplicadosBanco
            ) {

                console.log(
                    `⚠ ${item.tipo_camisa} | ${item.nome}`
                );
            }

            console.log('');
        }

        console.log(
            '============================================'
        );

        console.log(
            'NENHUM ESTOQUE FOI ALTERADO.'
        );

        console.log(
            '============================================'
        );

        console.log('');

    } catch (erro) {

        console.error('');
        console.error(
            'ERRO:'
        );

        console.error(
            erro.message
        );

        console.error('');

    } finally {

        await pool.end();
    }
}

executar();