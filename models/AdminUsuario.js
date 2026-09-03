const pool =
    require('../config/database');

const AdminUsuario = {

    // ======================================================
    // LISTAR USUÁRIOS
    // ======================================================

    async listar({
        busca = '',
        tipo = '',
        status = '',
        ordem = 'recentes'
    } = {}) {

        const filtros = [
            '1 = 1'
        ];

        const parametros = [];

        // ==============================================
        // PESQUISA
        // ==============================================

        if (busca) {

            filtros.push(`
                (
                    u.nome LIKE ?
                    OR u.email LIKE ?
                )
            `);

            const termo =
                `%${busca}%`;

            parametros.push(
                termo,
                termo
            );
        }

        // ==============================================
        // TIPO
        // ==============================================

        if (
            tipo === 'Cliente' ||
            tipo === 'Administrador'
        ) {

            filtros.push(
                'u.tipo = ?'
            );

            parametros.push(
                tipo
            );
        }

        // ==============================================
        // STATUS
        // ==============================================

        if (
            status === 'Ativo' ||
            status === 'Inativo'
        ) {

            filtros.push(
                'u.status = ?'
            );

            parametros.push(
                status
            );
        }

        // ==============================================
        // ORDENAÇÃO
        // ==============================================

        const ordenacoes = {

            recentes:
                'u.criado_em DESC',

            antigos:
                'u.criado_em ASC',

            az:
                'u.nome ASC',

            za:
                'u.nome DESC',

            email:
                'u.email ASC'
        };

        const ordemSql =
            ordenacoes[ordem] ||
            ordenacoes.recentes;

        const whereSql =
            filtros.join(' AND ');

        const [rows] =
            await pool.execute(`
                SELECT
                    u.id,
                    u.nome,
                    u.email,
                    u.tipo,
                    u.status,
                    u.criado_em,
                    u.atualizado_em,

                    (
                        SELECT COUNT(*)

                        FROM pedidos p

                        WHERE
                            p.usuario_id = u.id
                    ) AS total_pedidos,

                    COALESCE(
                        (
                            SELECT SUM(p.total)

                            FROM pedidos p

                            WHERE
                                p.usuario_id = u.id
                                AND p.status <> 'Cancelado'
                        ),
                        0
                    ) AS total_gasto

                FROM usuarios u

                WHERE ${whereSql}

                ORDER BY ${ordemSql}
            `, parametros);

        return rows;
    },

    // ======================================================
    // ALTERAR STATUS
    // ======================================================

    async alternarStatus(
        usuarioId,
        administradorLogadoId
    ) {

        const connection =
            await pool.getConnection();

        try {

            await connection
                .beginTransaction();

            // ==============================================
            // NÃO PERMITIR ALTERAR A PRÓPRIA CONTA
            // ==============================================

            if (
                Number(usuarioId) ===
                Number(administradorLogadoId)
            ) {

                const erro =
                    new Error(
                        'Você não pode desativar sua própria conta.'
                    );

                erro.status = 400;

                throw erro;
            }

            // ==============================================
            // BUSCAR USUÁRIO
            // ==============================================

            const [usuarios] =
                await connection.execute(`
                    SELECT
                        id,
                        nome,
                        tipo,
                        status

                    FROM usuarios

                    WHERE id = ?

                    LIMIT 1

                    FOR UPDATE
                `, [
                    usuarioId
                ]);

            if (
                usuarios.length === 0
            ) {

                const erro =
                    new Error(
                        'Usuário não encontrado.'
                    );

                erro.status = 404;

                throw erro;
            }

            const usuario =
                usuarios[0];

            const novoStatus =
                usuario.status === 'Ativo'
                    ? 'Inativo'
                    : 'Ativo';

            // ==============================================
            // PROTEGER ÚLTIMO ADMINISTRADOR
            // ==============================================

            if (
                usuario.tipo ===
                    'Administrador' &&
                usuario.status ===
                    'Ativo'
            ) {

                const [resultadoAdmins] =
                    await connection.execute(`
                        SELECT COUNT(*) AS total

                        FROM usuarios

                        WHERE
                            tipo = 'Administrador'
                            AND status = 'Ativo'
                    `);

                const totalAdminsAtivos =
                    Number(
                        resultadoAdmins[0]
                            .total
                    );

                if (
                    totalAdminsAtivos <= 1
                ) {

                    const erro =
                        new Error(
                            'Não é possível desativar o último administrador ativo.'
                        );

                    erro.status = 400;

                    throw erro;
                }
            }

            // ==============================================
            // ALTERAR
            // ==============================================

            await connection.execute(`
                UPDATE usuarios

                SET status = ?

                WHERE id = ?
            `, [
                novoStatus,
                usuarioId
            ]);

            await connection.commit();

            return {
                id:
                    usuario.id,

                status:
                    novoStatus
            };

        } catch (erro) {

            await connection.rollback();

            throw erro;

        } finally {

            connection.release();
        }
    }

};

module.exports =
    AdminUsuario;