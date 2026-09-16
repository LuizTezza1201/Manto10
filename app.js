require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const pool = require('./config/database');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const adminRoutes = require('./routes/admin');
const { iniciarExpiracaoPedidos } = require('./services/PedidoExpiracaoService');

const app = express();
const PORT = process.env.PORT || 8000;

// ======================================================
// CONFIGURAÇÕES INICIAIS
// ======================================================

// A aplicação não inicia sem a chave usada para proteger as sessões.
if (!process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET não foi definida no arquivo .env.');
    process.exit(1);
}

// Define o EJS como mecanismo de renderização das páginas.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Disponibiliza CSS, JavaScript, imagens e demais arquivos públicos.
app.use(express.static(path.join(__dirname, 'public')));

// Permite receber formulários HTML e requisições em JSON.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======================================================
// SESSÃO
// ======================================================

// Mantém o usuário autenticado entre as requisições.
app.use(session({
    name: 'manto10.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 8
    }
}));

// Torna o usuário da sessão disponível em todas as views EJS.
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// ======================================================
// ROTAS
// ======================================================

// Rotas públicas, autenticação, produtos, carrinho e administração.
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', produtoRoutes);
app.use('/', carrinhoRoutes);
app.use('/admin', adminRoutes);

// ======================================================
// TRATAMENTO DE ERROS
// ======================================================

// Executado quando nenhuma rota anterior corresponde à URL acessada.
app.use((req, res) => {
    res.status(404).send('Página não encontrada - Manto 10');
});

// Middleware central para erros inesperados da aplicação.
app.use((erro, req, res, next) => {
    console.error('Erro interno:', erro);
    res.status(500).send('Erro interno do servidor - Manto 10');
});

// ======================================================
// INICIALIZAÇÃO DO SERVIDOR
// ======================================================

async function iniciarServidor() {
    try {
        // Testa a conexão antes de liberar o servidor para uso.
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();

        console.log('');
        console.log('=================================');
        console.log('          MANTO 10');
        console.log('=================================');
        console.log('MySQL conectado com sucesso.');

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
            console.log('=================================');
            console.log('');

            // Verifica periodicamente pedidos pendentes que ultrapassaram o prazo.
            iniciarExpiracaoPedidos();
        });
    } catch (erro) {
        console.error('');
        console.error('=================================');
        console.error('          MANTO 10');
        console.error('=================================');
        console.error('Não foi possível iniciar o sistema.');
        console.error(`Erro: ${erro.message}`);
        console.error('=================================');
        process.exit(1);
    }
}

iniciarServidor();