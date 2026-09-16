// ============================================================
// MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO
// ============================================================

// Os middlewares deste arquivo verificam se o usuário possui
// uma sessão válida e, quando necessário, se possui permissão
// para acessar determinadas áreas do sistema.


// ============================================================
// EXIGIR LOGIN
// ============================================================

// Utilizado em páginas que só podem ser acessadas por usuários
// autenticados.
function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    return next();
}


// ============================================================
// EXIGIR ADMINISTRADOR
// ============================================================

// Protege todas as rotas administrativas.
//
// Se não existir sessão, o usuário é enviado para o login.
//
// Se estiver autenticado como Cliente, o sistema retorna
// HTTP 403 e apresenta uma página personalizada de acesso negado.
function exigirAdmin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    if (req.session.usuario.tipo !== 'Administrador') {
        return res
            .status(403)
            .render('erros/403', {
                titulo: 'Acesso negado | Manto 10'
            });
    }

    return next();
}


// ============================================================
// EXIGIR LOGIN EM REQUISIÇÕES DA API
// ============================================================

// Utilizado em operações executadas por JavaScript,
// como ações do carrinho.
function exigirLoginApi(req, res, next) {
    if (!req.session.usuario) {
        return res
            .status(401)
            .json({
                sucesso: false,
                mensagem:
                    'Faça login para adicionar produtos ao carrinho.',
                login: '/login'
            });
    }

    return next();
}


// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = {
    exigirLogin,
    exigirAdmin,
    exigirLoginApi
};