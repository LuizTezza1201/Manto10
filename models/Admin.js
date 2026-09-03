const pool =
    require('../config/database');


const Admin = {

    async obterResumo() {

        // ==================================================
        // PRODUTOS E ESTOQUE
        // ==================================================

        const [[produtos]] =
            await pool.execute(`
                SELECT

                    COUNT(*)
                        AS total_produtos,

                    COALESCE(
                        SUM(
                            estoque_total
                        ),
                        0
                    ) AS unidades_estoque,

                    SUM(
                        CASE

                            WHEN
                                estoque_total = 0

                            THEN 1

                            ELSE 0

                        END
                    ) AS sem_estoque,

                    SUM(
                        CASE

                            WHEN
                                estoque_total
                                BETWEEN 1 AND 5

                            THEN 1

                            ELSE 0

                        END
                    ) AS estoque_baixo

                FROM (

                    SELECT

                        p.id,

                        COALESCE(
                            SUM(
                                pt.estoque
                            ),
                            0
                        ) AS estoque_total

                    FROM produtos p

                    LEFT JOIN produto_tamanhos pt
                        ON pt.produto_id =
                           p.id

                    GROUP BY
                        p.id

                ) AS resumo
            `);


        // ==================================================
        // USUÁRIOS
        // ==================================================

        const [[usuarios]] =
            await pool.execute(`
                SELECT

                    COUNT(*)
                        AS total_usuarios,

                    SUM(
                        CASE

                            WHEN
                                tipo = 'Cliente'

                            THEN 1

                            ELSE 0

                        END
                    ) AS clientes,

                    SUM(
                        CASE

                            WHEN
                                tipo =
                                'Administrador'

                            THEN 1

                            ELSE 0

                        END
                    ) AS administradores

                FROM usuarios
            `);


        // ==================================================
        // TOTAL DE PEDIDOS DO SITE
        // ==================================================

        const [[pedidos]] =
            await pool.execute(`
                SELECT
                    COUNT(*)
                        AS total_pedidos

                FROM pedidos
            `);


        // ==================================================
        // VENDAS DO SITE + VENDAS MANUAIS
        // ==================================================

        const [[vendas]] =
            await pool.execute(`
                SELECT

                    COALESCE(
                        SUM(v.total),
                        0
                    ) AS total_vendas,


                    COALESCE(
                        SUM(
                            CASE

                                WHEN
                                    DATE(
                                        v.criado_em
                                    ) =
                                    CURDATE()

                                THEN v.total

                                ELSE 0

                            END
                        ),
                        0
                    ) AS vendas_hoje,


                    COALESCE(
                        SUM(
                            CASE

                                WHEN
                                    YEARWEEK(
                                        v.criado_em,
                                        1
                                    ) =
                                    YEARWEEK(
                                        CURDATE(),
                                        1
                                    )

                                THEN v.total

                                ELSE 0

                            END
                        ),
                        0
                    ) AS vendas_semana,


                    COALESCE(
                        SUM(
                            CASE

                                WHEN
                                    YEAR(
                                        v.criado_em
                                    ) =
                                    YEAR(
                                        CURDATE()
                                    )

                                    AND

                                    MONTH(
                                        v.criado_em
                                    ) =
                                    MONTH(
                                        CURDATE()
                                    )

                                THEN v.total

                                ELSE 0

                            END
                        ),
                        0
                    ) AS vendas_mes,


                    COALESCE(
                        SUM(
                            CASE

                                WHEN
                                    YEAR(
                                        v.criado_em
                                    ) =
                                    YEAR(
                                        CURDATE()
                                    )

                                THEN v.total

                                ELSE 0

                            END
                        ),
                        0
                    ) AS vendas_ano


                FROM (

                    SELECT

                        p.total,

                        p.criado_em

                    FROM pedidos p

                    WHERE p.status IN (
                        'Pago',
                        'Preparando',
                        'Enviado',
                        'Entregue'
                    )


                    UNION ALL


                    SELECT

                        vm.total,

                        vm.criado_em

                    FROM vendas_manuais vm

                    WHERE
                        vm.status =
                        'Concluída'

                ) AS v
            `);


        // ==================================================
        // RETORNO
        // ==================================================

        return {

            totalProdutos:
                Number(
                    produtos
                        .total_produtos ||
                    0
                ),

            unidadesEstoque:
                Number(
                    produtos
                        .unidades_estoque ||
                    0
                ),

            semEstoque:
                Number(
                    produtos
                        .sem_estoque ||
                    0
                ),

            estoqueBaixo:
                Number(
                    produtos
                        .estoque_baixo ||
                    0
                ),

            totalUsuarios:
                Number(
                    usuarios
                        .total_usuarios ||
                    0
                ),

            clientes:
                Number(
                    usuarios.clientes ||
                    0
                ),

            administradores:
                Number(
                    usuarios
                        .administradores ||
                    0
                ),

            totalPedidos:
                Number(
                    pedidos
                        .total_pedidos ||
                    0
                ),

            totalVendas:
                Number(
                    vendas
                        .total_vendas ||
                    0
                ),

            vendasHoje:
                Number(
                    vendas
                        .vendas_hoje ||
                    0
                ),

            vendasSemana:
                Number(
                    vendas
                        .vendas_semana ||
                    0
                ),

            vendasMes:
                Number(
                    vendas
                        .vendas_mes ||
                    0
                ),

            vendasAno:
                Number(
                    vendas
                        .vendas_ano ||
                    0
                )
        };
    }

};


module.exports =
    Admin;