const AdminUsuario =
    require(
        '../models/AdminUsuario'
    );

// ======================================================
// FORMATAR MOEDA
// ======================================================

function formatarMoeda(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        'pt-BR',
        {
            style:
                'currency',

            currency:
                'BRL'
        }
    );
}

// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) {

        return '';
    }

    return new Date(
        data
    ).toLocaleDateString(
        'pt-BR'
    );
}

// ======================================================
// CONTROLLER
// ======================================================

const AdminUsuarioController = {

    // ==================================================
    // LISTAR
    // ==================================================

    async listar(
        req,
        res,
        next
    ) {

        try {

            const busca =
                String(
                    req.query.busca || ''
                )
                    .trim()
                    .slice(
                        0,
                        100
                    );

            const tipo =
                String(
                    req.query.tipo || ''
                );

            const status =
                String(
                    req.query.status || ''
                );

            const ordem =
                String(
                    req.query.ordem ||
                    'recentes'
                );

            const usuariosBanco =
                await AdminUsuario.listar({
                    busca,
                    tipo,
                    status,
                    ordem
                });

            const usuarios =
                usuariosBanco.map(
                    usuario => ({

                        ...usuario,

                        total_pedidos:
                            Number(
                                usuario.total_pedidos ||
                                0
                            ),

                        total_gasto_formatado:
                            formatarMoeda(
                                usuario.total_gasto
                            ),

                        criado_em_formatado:
                            formatarData(
                                usuario.criado_em
                            )

                    })
                );

            return res.render(
                'admin/usuarios',
                {

                    titulo:
                        'Gerenciar usuários',

                    paginaAtual:
                        'admin',

                    usuarios,

                    filtros: {
                        busca,
                        tipo,
                        status,
                        ordem
                    },

                    administradorLogadoId:
                        Number(
                            req.session.usuario.id
                        ),

                    sucesso:
                        req.query.sucesso ===
                        'status',

                    erro:
                        String(
                            req.query.erro || ''
                        )

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ==================================================
    // ATIVAR / DESATIVAR
    // ==================================================

    async alternarStatus(
        req,
        res,
        next
    ) {

        try {

            const usuarioId =
                Number(
                    req.params.id
                );

            const administradorLogadoId =
                Number(
                    req.session.usuario.id
                );

            if (
                !Number.isInteger(
                    usuarioId
                ) ||
                usuarioId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Usuário inválido.'
                    );
            }

            await AdminUsuario
                .alternarStatus(
                    usuarioId,
                    administradorLogadoId
                );

            return res.redirect(
                '/admin/usuarios?sucesso=status'
            );

        } catch (erro) {

            if (
                erro.status === 400
            ) {

                return res.redirect(
                    `/admin/usuarios?erro=${encodeURIComponent(
                        erro.message
                    )}`
                );
            }

            if (
                erro.status === 404
            ) {

                return res
                    .status(404)
                    .send(
                        erro.message
                    );
            }

            return next(erro);
        }
    }

};

module.exports =
    AdminUsuarioController;