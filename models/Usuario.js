const pool = require('../config/database');

const Usuario = {

    async buscarPorEmail(email) {

        const [rows] = await pool.execute(
            `
                SELECT
                    id,
                    nome,
                    email,
                    senha,
                    tipo,
                    status,
                    criado_em,
                    atualizado_em
                FROM usuarios
                WHERE email = ?
                LIMIT 1
            `,
            [email]
        );

        return rows[0] || null;
    },

    async buscarPorId(id) {

        const [rows] = await pool.execute(
            `
                SELECT
                    id,
                    nome,
                    email,
                    tipo,
                    status,
                    criado_em,
                    atualizado_em
                FROM usuarios
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

    async emailExiste(email) {

        const [rows] = await pool.execute(
            `
                SELECT id
                FROM usuarios
                WHERE email = ?
                LIMIT 1
            `,
            [email]
        );

        return rows.length > 0;
    },

    async criar({
        nome,
        email,
        senha
    }) {

        const [resultado] = await pool.execute(
            `
                INSERT INTO usuarios (
                    nome,
                    email,
                    senha,
                    tipo,
                    status
                )
                VALUES (?, ?, ?, 'Cliente', 'Ativo')
            `,
            [
                nome,
                email,
                senha
            ]
        );

        return resultado.insertId;
    }

};

module.exports = Usuario;