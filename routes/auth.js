const express = require('express');
const pool = require('../config/database');
const AuthController = require('../controllers/AuthController');
const ContaController = require('../controllers/ContaController');
const { exigirLogin } = require('../middlewares/auth');

const router = express.Router();

// ======================================================
// ACESSO TEMPORÁRIO PARA DEMONSTRAÇÃO
// ======================================================

// Entra diretamente com um usuário ativo do perfil escolhido.
// Este recurso existe somente para facilitar testes e apresentações.
router.post('/login/demo/:perfil', async (req, res, next) => {
    try {
        if (process.env.DEMO_LOGIN !== 'true') {
            return res.status(404).send('Acesso de demonstração desativado.');
        }

        const perfis = {
            admin: 'Administrador',
            cliente: 'Cliente'
        };

        const tipo = perfis[req.params.perfil];
        if (!tipo) return res.redirect('/login');

        // Procura um usuário ativo sem precisar armazenar senhas no código.
        const [usuarios] = await pool.execute(`
            SELECT id, nome, email, telefone, tipo
            FROM usuarios
            WHERE tipo = ? AND status = 'Ativo'
            ORDER BY id ASC
            LIMIT 1
        `, [tipo]);

        if (usuarios.length === 0) {
            return res.status(404).send(`Nenhum usuário ${tipo} ativo foi encontrado.`);
        }

        const usuario = usuarios[0];

        // Regenera a sessão da mesma forma que acontece no login normal.
        req.session.regenerate((erroSessao) => {
            if (erroSessao) return next(erroSessao);

            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                tipo: usuario.tipo
            };

            req.session.save((erroSalvar) => {
                if (erroSalvar) return next(erroSalvar);

                return tipo === 'Administrador'
                    ? res.redirect('/admin')
                    : res.redirect('/');
            });
        });
    } catch (erro) {
        return next(erro);
    }
});

// ======================================================
// CADASTRO E LOGIN
// ======================================================

router.get('/cadastro', AuthController.exibirCadastro);
router.post('/cadastro', AuthController.cadastrar);

router.get('/login', AuthController.exibirLogin);
router.post('/login', AuthController.login);

// ======================================================
// MINHA CONTA
// ======================================================

router.get('/minha-conta', exigirLogin, ContaController.inicio);
router.get('/minha-conta/pedidos/:id', exigirLogin, ContaController.pedidoDetalhe);
router.post('/minha-conta/pedidos/:id/cancelar', exigirLogin, ContaController.cancelarPedido);

// ======================================================
// LOGOUT
// ======================================================

router.post('/logout', AuthController.logout);

module.exports = router;