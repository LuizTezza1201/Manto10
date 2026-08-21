const pool = require('../config/database');

const Admin = {

    // ======================================================
    // RESUMO DO DASHBOARD
    // ======================================================

    async obterResumo() {

        const [[produtos]] =
            await pool.execute(`
                SELECT
                    COUNT(*) AS total_produtos,

                    COALESCE(
                        SUM(estoque_total),
                        0
                    ) AS unidades_estoque,

                    SUM(
                        CASE
                            WHEN estoque_total = 0
                            THEN 1
                            ELSE 0
                        END
                    ) AS sem_estoque,

                    SUM(
                        CASE
                            WHEN estoque_total BETWEEN 1 AND 5
                            THEN 1
                            ELSE 0
                        END
                    ) AS estoque_baixo

                FROM (
                    SELECT
                        p.id,

                        COALESCE(
                            SUM(pt.estoque),
                            0
                        ) AS estoque_total

                    FROM produtos p

                    LEFT JOIN produto_tamanhos pt
                        ON pt.produto_id = p.id

                    GROUP BY p.id
                ) AS resumo
            `);

        const [[usuarios]] =
            await pool.execute(`
                SELECT
                    COUNT(*) AS total_usuarios,

                    SUM(
                        CASE
                            WHEN tipo = 'Cliente'
                            THEN 1
                            ELSE 0
                        END
                    ) AS clientes,

                    SUM(
                        CASE
                            WHEN tipo = 'Administrador'
                            THEN 1
                            ELSE 0
                        END
                    ) AS administradores

                FROM usuarios
            `);

        const [[pedidos]] =
            await pool.execute(`
                SELECT
                    COUNT(*) AS total_pedidos,

                    COALESCE(
                        SUM(total),
                        0
                    ) AS total_vendas

                FROM pedidos

                WHERE status <> 'Cancelado'
            `);

        return {

            totalProdutos:
                Number(
                    produtos.total_produtos
                ),

            unidadesEstoque:
                Number(
                    produtos.unidades_estoque
                ),

            semEstoque:
                Number(
                    produtos.sem_estoque
                ),

            estoqueBaixo:
                Number(
                    produtos.estoque_baixo
                ),

            totalUsuarios:
                Number(
                    usuarios.total_usuarios
                ),

            clientes:
                Number(
                    usuarios.clientes
                ),

            administradores:
                Number(
                    usuarios.administradores
                ),

            totalPedidos:
                Number(
                    pedidos.total_pedidos
                ),

            totalVendas:
                Number(
                    pedidos.total_vendas
                )
        };
    }

};

module.exports = Admin;