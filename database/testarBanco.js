require('dotenv').config();

const pool = require('../config/database');

async function testarBanco() {
    try {
        const connection = await pool.getConnection();

        console.log('');
        console.log('======================================');
        console.log('       TESTE DO BANCO - MANTO 10');
        console.log('======================================');
        console.log('Conexão com MySQL realizada com sucesso!');

        const [banco] = await connection.query(
            'SELECT DATABASE() AS banco'
        );

        console.log(`Banco conectado: ${banco[0].banco}`);

        const [produtos] = await connection.query(
            'SELECT COUNT(*) AS total FROM produtos'
        );

        console.log(
            `Produtos cadastrados: ${produtos[0].total}`
        );

        const [estoque] = await connection.query(`
            SELECT
                COALESCE(SUM(estoque), 0) AS total
            FROM produto_tamanhos
        `);

        console.log(
            `Camisas em estoque: ${estoque[0].total}`
        );

        console.log('======================================');
        console.log('');

        connection.release();

        await pool.end();

        process.exit(0);

    } catch (erro) {

        console.error('');
        console.error('======================================');
        console.error(' ERRO AO CONECTAR AO BANCO MANTO 10');
        console.error('======================================');

        console.error(erro.message);

        console.error('======================================');
        console.error('');

        try {
            await pool.end();
        } catch (erroEncerramento) {
            // Não é necessário realizar outra ação.
        }

        process.exit(1);
    }
}

testarBanco();