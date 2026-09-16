// ============================================================
// CONEXÃO COM O BANCO DE DADOS
// ============================================================

const mysql = require('mysql2/promise');


// ============================================================
// POOL DE CONEXÕES
// ============================================================

// O sistema utiliza um pool de conexões em vez de criar uma nova
// conexão com o MySQL a cada requisição.
//
// As credenciais são carregadas pelas variáveis de ambiente,
// evitando deixar dados sensíveis diretamente no código.
const pool = mysql.createPool({
    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT) || 3306,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    // Aguarda uma conexão disponível quando todas estiverem ocupadas.
    waitForConnections: true,

    // Número máximo de conexões simultâneas mantidas pelo pool.
    connectionLimit: 10,

    // Zero significa que não existe limite fixo para a fila
    // de requisições aguardando uma conexão disponível.
    queueLimit: 0,

    // Permite armazenar corretamente caracteres acentuados,
    // símbolos e outros caracteres Unicode.
    charset: 'utf8mb4'
});


// ============================================================
// EXPORTAÇÃO
// ============================================================

// O pool é compartilhado pelos Models e demais componentes
// que precisam executar consultas no banco de dados.
module.exports = pool;