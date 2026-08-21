require('dotenv').config();

const pool = require('../config/database');

// ======================================================
// PRODUTOS DA PLANILHA QUE NÃO BATERAM
// ======================================================

const naoEncontrados = [

    ['Nacional Premium', 'Internazionale Away 25/26'],
    ['Nacional Premium', 'Remo Edição Especial'],
    ['Tailandesa', 'Grêmio Third 24/25'],
    ['Nacional Premium', 'Brasil Home 1994'],
    ['Tailandesa', 'Inglaterra Away 26/27'],
    ['Nacional Premium', 'Corinthians Edição Especial'],
    ['Nacional Premium', 'Brasil Away 1994'],
    ['Nacional Premium', 'Brasil Home 1977'],
    ['Nacional Premium', 'Liverpool Home 25/26'],
    ['Tailandesa', 'Internacional Polo 25/26'],
    ['Tailandesa', 'Portugal Home 26/27'],
    ['Tailandesa', 'Corinthians Treino 24/25'],
    ['Nacional Premium', 'Barcelona 1999 Edição Especial'],
    ['Nacional Premium', 'Brasil Home 1984'],
    ['Nacional Premium', 'Corinthians Total 90'],
    ['Nacional Premium', 'Barcelona Home 25/26'],
    ['Nacional Premium', 'Napoli Home 25/26'],
    ['Tailandesa', 'Barcelona Away 25/26'],
    ['Tailandesa', 'Lazio Away 25/26'],
    ['Tailandesa', 'Internacional Away 25/26'],
    ['Tailandesa', 'Chelsea Total 90 25/26'],
    ['Tailandesa', 'Palmeiras Mundial 25/26'],
    ['Tailandesa', 'Corinthians Total 90'],
    ['Tailandesa', 'Ajax Home 25/26'],
    ['Tailandesa', 'Sporting Home 25/26']

];

// ======================================================
// NORMALIZAÇÃO
// ======================================================

function normalizar(texto) {

    return String(texto || '')
        .replace(/^Camisa\s+/i, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\b20(\d{2})[\/-](\d{2})\b/g, '$1$2')
        .replace(/\b(\d{2})[\/-](\d{2})\b/g, '$1$2')
        .replace(/\bretro\b/g, '')
        .replace(/\bedicao\b/g, '')
        .replace(/\bespecial\b/g, 'especial')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ======================================================
// DISTÂNCIA LEVENSHTEIN
// ======================================================

function distancia(a, b) {

    const matriz =
        Array.from(
            {
                length: b.length + 1
            },
            () =>
                new Array(
                    a.length + 1
                ).fill(0)
        );

    for (
        let i = 0;
        i <= a.length;
        i++
    ) {
        matriz[0][i] = i;
    }

    for (
        let j = 0;
        j <= b.length;
        j++
    ) {
        matriz[j][0] = j;
    }

    for (
        let j = 1;
        j <= b.length;
        j++
    ) {

        for (
            let i = 1;
            i <= a.length;
            i++
        ) {

            const custo =
                a[i - 1] === b[j - 1]
                    ? 0
                    : 1;

            matriz[j][i] =
                Math.min(
                    matriz[j][i - 1] + 1,
                    matriz[j - 1][i] + 1,
                    matriz[j - 1][i - 1] + custo
                );
        }
    }

    return matriz[b.length][a.length];
}

function similaridade(a, b) {

    const textoA =
        normalizar(a);

    const textoB =
        normalizar(b);

    const maior =
        Math.max(
            textoA.length,
            textoB.length
        );

    if (maior === 0) {
        return 1;
    }

    return (
        1 -
        distancia(
            textoA,
            textoB
        ) /
        maior
    );
}

// ======================================================
// EXECUTAR
// ======================================================

async function executar() {

    try {

        const [produtos] =
            await pool.execute(`
                SELECT
                    id,
                    nome,
                    tipo_camisa
                FROM produtos
                ORDER BY tipo_camisa, nome
            `);

        console.log('');
        console.log(
            '=============================================='
        );
        console.log(
            '  SUGESTÕES DE CORRESPONDÊNCIA - MANTO 10'
        );
        console.log(
            '=============================================='
        );
        console.log('');

        for (
            const [
                tipo,
                nomeExcel
            ]
            of naoEncontrados
        ) {

            const mesmoTipo =
                produtos.filter(
                    produto =>
                        produto.tipo_camisa ===
                        tipo
                );

            const candidatos =
                mesmoTipo
                    .map(
                        produto => ({
                            ...produto,

                            score:
                                similaridade(
                                    nomeExcel,
                                    produto.nome
                                )
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.score -
                            a.score
                    )
                    .slice(0, 3);

            console.log(
                `PLANILHA: ${tipo} | ${nomeExcel}`
            );

            candidatos.forEach(
                (
                    candidato,
                    indice
                ) => {

                    console.log(
                        `   ${indice + 1}. ` +
                        `${candidato.nome} ` +
                        `(${Math.round(
                            candidato.score *
                            100
                        )}%)`
                    );
                }
            );

            console.log('');
        }

        console.log(
            '=============================================='
        );

        console.log(
            'NENHUM DADO FOI ALTERADO.'
        );

        console.log(
            '=============================================='
        );

    } catch (erro) {

        console.error(
            'Erro:',
            erro.message
        );

    } finally {

        await pool.end();
    }
}

executar();