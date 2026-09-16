// ============================================================
// VARIÁVEIS DE AMBIENTE
// ============================================================

// Carrega as configurações armazenadas no arquivo .env.
require('dotenv').config();


// ============================================================
// IMPORTAÇÕES
// ============================================================

const express = require('express');
const path = require('path');
const session = require('express-session');

// Banco de dados.
const pool = require('./config/database');

// Rotas da aplicação.
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const adminRoutes = require('./routes/admin');

// Serviço responsável por cancelar pedidos pendentes expirados.
const {
    iniciarExpiracaoPedidos
} = require('./services/PedidoExpiracaoService');


// ============================================================
// CONFIGURAÇÃO PRINCIPAL
// ============================================================

const app = express();

const PORT = process.env.PORT || 8000;
const EM_PRODUCAO = process.env.NODE_ENV === 'production';


// ============================================================
// VALIDAÇÃO DAS CONFIGURAÇÕES
// ============================================================

// A chave da sessão é obrigatória, pois protege os dados
// utilizados para manter o usuário autenticado.
if (!process.env.SESSION_SECRET) {
    console.error(
        'SESSION_SECRET não foi definida no arquivo .env.'
    );

    process.exit(1);
}


// ============================================================
// CONFIGURAÇÕES DO EXPRESS
// ============================================================

// Remove a identificação automática do Express no cabeçalho HTTP.
app.disable('x-powered-by');

// Define EJS como mecanismo de renderização das páginas.
app.set('view engine', 'ejs');

app.set(
    'views',
    path.join(__dirname, 'views')
);

// Em produção, permite que cookies seguros funcionem
// corretamente quando a aplicação estiver atrás de um proxy HTTPS.
if (EM_PRODUCAO) {
    app.set('trust proxy', 1);
}


// ============================================================
// ARQUIVOS PÚBLICOS E DADOS DAS REQUISIÇÕES
// ============================================================

// Disponibiliza CSS, JavaScript, imagens e outros arquivos
// localizados na pasta public.
app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

// Permite receber dados enviados por formulários HTML.
app.use(
    express.urlencoded({
        extended: true
    })
);

// Permite receber dados enviados no formato JSON.
app.use(express.json());


// ============================================================
// SESSÃO E AUTENTICAÇÃO
// ============================================================

// Mantém o usuário autenticado entre diferentes requisições.
//
// httpOnly:
// impede que JavaScript do navegador leia o cookie.
//
// sameSite:
// reduz o envio do cookie em requisições externas.
//
// secure:
// exige HTTPS quando o sistema estiver em produção.
app.use(
    session({
        name: 'manto10.sid',

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: EM_PRODUCAO,

            // A sessão permanece válida por até 8 horas.
            maxAge: 1000 * 60 * 60 * 8
        }
    })
);


// ============================================================
// DADOS COMPARTILHADOS COM AS VIEWS
// ============================================================

// Disponibiliza os dados do usuário autenticado em todas
// as páginas EJS sem precisar enviá-los em cada controller.
app.use((req, res, next) => {
    res.locals.usuario =
        req.session.usuario || null;

    next();
});


// ============================================================
// ROTAS
// ============================================================

// Página inicial e demais páginas públicas.
app.use('/', indexRoutes);

// Cadastro, login e logout.
app.use('/', authRoutes);

// Catálogo e detalhes dos produtos.
app.use('/', produtoRoutes);

// Carrinho, checkout, pagamento e área do cliente.
app.use('/', carrinhoRoutes);

// Área administrativa.
app.use('/admin', adminRoutes);


// ============================================================
// PÁGINA NÃO ENCONTRADA
// ============================================================

// Este middleware é executado somente quando nenhuma rota
// anterior corresponde ao endereço solicitado.
app.use((req, res) => {
    res
        .status(404)
        .send(
            'Página não encontrada - Manto 10'
        );
});


// ============================================================
// TRATAMENTO CENTRAL DE ERROS
// ============================================================

// Middleware responsável por capturar erros inesperados.
//
// O parâmetro "next" é mantido porque o Express identifica
// middlewares de erro pela presença de quatro parâmetros.
app.use((erro, req, res, next) => {
    console.error(
        'Erro interno:',
        erro
    );

    res
        .status(500)
        .send(
            'Erro interno do servidor - Manto 10'
        );
});


// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

async function iniciarServidor() {
    let connection;

    try {
        // Antes de iniciar o servidor, o sistema testa a
        // comunicação com o banco de dados MySQL.
        connection =
            await pool.getConnection();

        await connection.query(
            'SELECT 1'
        );

        connection.release();
        connection = null;

        console.log('');
        console.log(
            '================================='
        );
        console.log(
            '          MANTO 10'
        );
        console.log(
            '================================='
        );
        console.log(
            'MySQL conectado com sucesso.'
        );

        // O servidor HTTP somente é iniciado depois que
        // a conexão com o banco foi confirmada.
        app.listen(PORT, () => {
            console.log(
                `Servidor rodando em http://localhost:${PORT}`
            );

            console.log(
                '================================='
            );

            console.log('');

            // Inicia a verificação automática dos pedidos
            // pendentes que ultrapassaram o prazo de pagamento.
            iniciarExpiracaoPedidos();
        });

    } catch (erro) {

        // Libera a conexão caso ocorra algum erro após
        // ela ter sido obtida do pool.
        if (connection) {
            connection.release();
        }

        console.error('');
        console.error(
            '================================='
        );
        console.error(
            '          MANTO 10'
        );
        console.error(
            '================================='
        );
        console.error(
            'Não foi possível iniciar o sistema.'
        );
        console.error(
            `Erro: ${erro.message}`
        );
        console.error(
            '================================='
        );

        process.exit(1);
    }
}


// Inicia a aplicação.
iniciarServidor();