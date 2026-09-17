const pool = require('../config/database');

// ============================================================
// IDENTIDADE VISUAL DAS LIGAS
// ============================================================

// As principais ligas usam seus logotipos oficiais hospedados no
// Wikimedia Commons. "Seleções" e "Outras" usam artes próprias
// armazenadas no projeto porque não representam uma liga específica.
const IMAGENS_LIGAS = {
    'premier-league':
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Premier_League.svg',

    laliga:
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/LaLiga_logo_(2023).svg',

    brasileirao:
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Campeonato_Brasileiro_S%C3%A9rie_A_logo_(2024).svg',

    'serie-a':
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Serie_A.svg',

    bundesliga:
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bundesliga_logo.svg',

    'ligue-1':
        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ligue_1_2024_Logo.png',

    selecoes:
        '/images/ligas/selecoes.svg',

    outras:
        '/images/ligas/outras.svg'
};

const Liga = {

    // Lista somente as seções que devem aparecer na Home.
    // A ordem é fixa para manter o catálogo consistente.
    async listarAtivas() {
        const [rows] = await pool.execute(`
            SELECT
                id,
                nome,
                slug,
                pais,
                imagem
            FROM ligas
            WHERE status = 'Ativo'
            ORDER BY
                CASE slug
                    WHEN 'premier-league' THEN 1
                    WHEN 'laliga' THEN 2
                    WHEN 'brasileirao' THEN 3
                    WHEN 'serie-a' THEN 4
                    WHEN 'bundesliga' THEN 5
                    WHEN 'ligue-1' THEN 6
                    WHEN 'selecoes' THEN 7
                    WHEN 'outras' THEN 8
                    ELSE 99
                END,
                nome ASC
        `);

        return rows.map((liga) => ({
            ...liga,
            imagem:
                IMAGENS_LIGAS[liga.slug] ||
                liga.imagem ||
                null
        }));
    }

};

module.exports = Liga;
