const Usuario = require('../models/Usuario');

async function usuarioAtivo(req) {
    if (!req.session.usuario) return null;

    const usuario = await Usuario.buscarPorId(req.session.usuario.id);

    if (!usuario || usuario.status !== 'Ativo') {
        return null;
    }

    req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        tipo: usuario.tipo
    };

    return usuario;
}

function encerrarSessao(req) {
    return new Promise((resolve) => {
        if (!req.session) return resolve();
        req.session.destroy(() => resolve());
    });
}

async function exigirLogin(req, res, next) {
    try {
        const usuario = await usuarioAtivo(req);

        if (!usuario) {
            await encerrarSessao(req);
            res.clearCookie('manto10.sid');
            return res.redirect('/login');
        }

        return next();
    } catch (erro) {
        return next(erro);
    }
}

async function exigirAdmin(req, res, next) {
    try {
        const usuario = await usuarioAtivo(req);

        if (!usuario) {
            await encerrarSessao(req);
            res.clearCookie('manto10.sid');
            return res.redirect('/login');
        }

        if (usuario.tipo !== 'Administrador') {
            return res.status(403).render('erros/403', {
                titulo: 'Acesso negado | Manto 10'
            });
        }

        return next();
    } catch (erro) {
        return next(erro);
    }
}

async function exigirLoginApi(req, res, next) {
    try {
        const usuario = await usuarioAtivo(req);

        if (!usuario) {
            await encerrarSessao(req);
            res.clearCookie('manto10.sid');
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Faça login para continuar.',
                login: '/login'
            });
        }

        return next();
    } catch (erro) {
        return next(erro);
    }
}

module.exports = { exigirLogin, exigirAdmin, exigirLoginApi };
