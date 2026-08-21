const pool = require('../config/database');

const Liga = {

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
            ORDER BY id ASC
        `);

        return rows;
    }

};

module.exports = Liga;