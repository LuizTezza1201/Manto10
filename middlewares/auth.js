function exigirLogin(
    req,
    res,
    next
) {

    if (!req.session.usuario) {

        return res.redirect(
            '/login'
        );
    }

    return next();
}

function exigirAdmin(
    req,
    res,
    next
) {

    if (!req.session.usuario) {

        return res.redirect(
            '/login'
        );
    }

    if (
        req.session.usuario.tipo !==
        'Administrador'
    ) {

        return res
            .status(403)
            .send(`
                <h1>Acesso negado</h1>

                <p>
                    Esta área é exclusiva
                    para administradores.
                </p>

                <a href="/">
                    Voltar para a loja
                </a>
            `);
    }

    return next();
}

function exigirLoginApi(
    req,
    res,
    next
) {

    if (!req.session.usuario) {

        return res
            .status(401)
            .json({

                sucesso: false,

                mensagem:
                    'Faça login para adicionar produtos ao carrinho.',

                login:
                    '/login'
            });
    }

    return next();
}

module.exports = {
    exigirLogin,
    exigirAdmin,
    exigirLoginApi
};