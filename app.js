require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require(
    'express-session'
);

const pool = require(
    './config/database'
);

const indexRoutes = require(
    './routes/index'
);

const authRoutes = require(
    './routes/auth'
);

const produtoRoutes = require(
    './routes/produtos'
);

const carrinhoRoutes = require(
    './routes/carrinho'
);

const adminRoutes = require(
    './routes/admin'
);

const app = express();

const PORT =
    process.env.PORT || 8000;

// ======================================================
// CONFIGURAÇÕES
// ======================================================

if (!process.env.SESSION_SECRET) {

    console.error(
        'SESSION_SECRET não foi definida no arquivo .env.'
    );

    process.exit(1);
}

// ======================================================
// EJS
// ======================================================

app.set(
    'view engine',
    'ejs'
);

app.set(
    'views',
    path.join(
        __dirname,
        'views'
    )
);

// ======================================================
// ARQUIVOS PÚBLICOS
// ======================================================

app.use(
    express.static(
        path.join(
            __dirname,
            'public'
        )
    )
);

// ======================================================
// DADOS
// ======================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);

// ======================================================
// SESSÃO
// ======================================================

app.use(
    session({

        name: 'manto10.sid',

        secret:
            process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            sameSite: 'lax',

            secure: false,

            maxAge:
                1000 *
                60 *
                60 *
                8
        }

    })
);

// ======================================================
// DADOS GLOBAIS DAS VIEWS
// ======================================================

app.use(
    (
        req,
        res,
        next
    ) => {

        res.locals.usuario =
            req.session.usuario ||
            null;

        next();
    }
);

// ======================================================
// ROTAS
// ======================================================

app.use(
    '/',
    indexRoutes
);

app.use(
    '/',
    authRoutes
);

app.use(
    '/',
    produtoRoutes
);

app.use(
    '/',
    carrinhoRoutes
);

app.use(
    '/admin',
    adminRoutes
);

// ======================================================
// 404
// ======================================================

app.use(
    (
        req,
        res
    ) => {

        res
            .status(404)
            .send(
                'Página não encontrada - Manto 10'
            );
    }
);

// ======================================================
// ERROS
// ======================================================

app.use(
    (
        erro,
        req,
        res,
        next
    ) => {

        console.error(
            'Erro interno:',
            erro
        );

        res
            .status(500)
            .send(
                'Erro interno do servidor - Manto 10'
            );
    }
);

// ======================================================
// SERVIDOR
// ======================================================

async function iniciarServidor() {

    try {

        const connection =
            await pool.getConnection();

        await connection.query(
            'SELECT 1'
        );

        connection.release();

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

        app.listen(
            PORT,
            () => {

                console.log(
                    `Servidor rodando em http://localhost:${PORT}`
                );

                console.log(
                    '================================='
                );

                console.log('');
            }
        );

    } catch (erro) {

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

        console.error('');

        console.error(
            `Erro: ${erro.message}`
        );

        console.error(
            '================================='
        );

        process.exit(1);
    }
}

iniciarServidor();