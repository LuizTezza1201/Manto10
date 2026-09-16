const pool =
    require('../config/database');


function criarErro(
    mensagem,
    status = 400
) {

    const erro =
        new Error(mensagem);

    erro.status =
        status;

    return erro;
}


const AdminPedido = {

    // ======================================================
    // LISTAR PEDIDOS
    // ======================================================

    async listar({
        busca = '',
        status = '',
        ordem = 'recentes'
    } = {}) {

        /*
         * Nesta página aparecem somente pedidos
         * que ainda não se transformaram em venda
         * ou que foram cancelados.
         *
         * Assim que o pedido vira Pago,
         * ele passa a ser acompanhado em Vendas.
         */

        const filtros = [
            `
                p.status IN (
                    'Pendente',
                    'Cancelado'
                )
            `
        ];

        const parametros = [];


        // ==================================================
        // PESQUISA
        // ==================================================

        if (busca) {

            filtros.push(`
                (
                    p.numero_pedido LIKE ?
                    OR u.nome LIKE ?
                    OR u.email LIKE ?
                )
            `);


            const termo =
                `%${busca}%`;


            parametros.push(
                termo,
                termo,
                termo
            );
        }


        // ==================================================
        // STATUS
        // ==================================================

        const statusPermitidos = [
            'Pendente',
            'Cancelado'
        ];


        if (
            statusPermitidos.includes(
                status
            )
        ) {

            filtros.push(
                'p.status = ?'
            );

            parametros.push(
                status
            );
        }


        // ==================================================
        // ORDENAÇÃO
        // ==================================================

        const ordenacoes = {

            recentes:
                'p.criado_em DESC',

            antigos:
                'p.criado_em ASC',

            maior_valor:
                'p.total DESC',

            menor_valor:
                'p.total ASC'
        };


        const ordemSql =
            ordenacoes[ordem] ||
            ordenacoes.recentes;


        const whereSql =
            filtros.join(
                ' AND '
            );


        const [rows] =
            await pool.execute(`
                SELECT

                    p.id,

                    p.numero_pedido,

                    p.subtotal,

                    p.frete,

                    p.desconto,

                    p.total,

                    p.status,

                    p.codigo_rastreio,

                    p.observacao,

                    p.criado_em,

                    p.atualizado_em,

                    u.id
                        AS usuario_id,

                    u.nome
                        AS cliente_nome,

                    u.email
                        AS cliente_email,

                    (
                        SELECT
                            COALESCE(
                                SUM(
                                    ip.quantidade
                                ),
                                0
                            )

                        FROM itens_pedido ip

                        WHERE
                            ip.pedido_id =
                            p.id

                    ) AS total_itens,

                    pg.forma_pagamento,

                    pg.status
                        AS pagamento_status

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id =
                       p.usuario_id

                LEFT JOIN pagamentos pg
                    ON pg.pedido_id =
                       p.id

                WHERE
                    ${whereSql}

                ORDER BY
                    ${ordemSql}
            `, parametros);


        if (rows.length === 0) {
            return rows;
        }

        // Busca os produtos de todos os pedidos retornados para
        // exibir uma prévia visual diretamente na listagem.
        const idsPedidos = rows.map(
            pedido => Number(pedido.id)
        );

        const placeholders = idsPedidos
            .map(() => '?')
            .join(', ');

        const [itens] = await pool.execute(
            `
                SELECT
                    ip.pedido_id,
                    ip.codigo_produto,
                    ip.nome_produto,
                    ip.tamanho,
                    ip.preferencia_box,
                    ip.quantidade,
                    (
                        SELECT pi.caminho
                        FROM produto_imagens pi
                        WHERE pi.produto_id = ip.produto_id
                        ORDER BY
                            pi.principal DESC,
                            pi.ordem ASC,
                            pi.id ASC
                        LIMIT 1
                    ) AS imagem
                FROM itens_pedido ip
                WHERE ip.pedido_id IN (${placeholders})
                ORDER BY ip.pedido_id, ip.id
            `,
            idsPedidos
        );

        const itensPorPedido = new Map();

        itens.forEach(item => {
            const pedidoId = Number(item.pedido_id);

            if (!itensPorPedido.has(pedidoId)) {
                itensPorPedido.set(pedidoId, []);
            }

            itensPorPedido.get(pedidoId).push(item);
        });

        return rows.map(pedido => ({
            ...pedido,
            itens: itensPorPedido.get(Number(pedido.id)) || []
        }));
    },



    // ======================================================
    // BUSCAR PEDIDO
    // ======================================================

    async buscarPorId(
        pedidoId
    ) {

        const [rows] =
            await pool.execute(`
                SELECT

                    p.id,

                    p.numero_pedido,

                    p.usuario_id,

                    p.endereco_id,

                    p.cupom_id,

                    p.subtotal,

                    p.frete,

                    p.desconto,

                    p.total,

                    p.status,

                    p.estoque_restituido,

                    p.expira_em,

                    p.codigo_rastreio,

                    p.rastreio_atualizado_em,

                    p.observacao,

                    p.criado_em,

                    p.atualizado_em,

                    u.nome
                        AS cliente_nome,

                    u.email
                        AS cliente_email,

                    e.apelido
                        AS endereco_apelido,

                    e.cep,

                    e.logradouro,

                    e.numero
                        AS endereco_numero,

                    e.complemento,

                    e.bairro,

                    e.cidade,

                    e.estado,

                    c.codigo
                        AS cupom_codigo,

                    pg.forma_pagamento,

                    pg.status
                        AS pagamento_status,

                    pg.valor
                        AS pagamento_valor,

                    pg.pago_em

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id =
                       p.usuario_id

                INNER JOIN enderecos e
                    ON e.id =
                       p.endereco_id

                LEFT JOIN cupons c
                    ON c.id =
                       p.cupom_id

                LEFT JOIN pagamentos pg
                    ON pg.pedido_id =
                       p.id

                WHERE
                    p.id = ?

                LIMIT 1
            `, [
                pedidoId
            ]);


        return rows[0] || null;
    },


    // ======================================================
    // ITENS DO PEDIDO
    // ======================================================

    async listarItens(
        pedidoId
    ) {

        const [rows] =
            await pool.execute(`
                SELECT

                    ip.id,

                    ip.produto_id,

                    ip.codigo_produto,

                    ip.nome_produto,

                    ip.tamanho,

                    ip.preferencia_box,

                    ip.quantidade,

                    ip.preco_unitario,

                    ip.subtotal,

                    (
                        SELECT
                            pi.caminho

                        FROM produto_imagens pi

                        WHERE
                            pi.produto_id =
                            ip.produto_id

                        ORDER BY
                            pi.principal DESC,
                            pi.ordem ASC,
                            pi.id ASC

                        LIMIT 1
                    ) AS imagem

                FROM itens_pedido ip

                WHERE
                    ip.pedido_id = ?

                ORDER BY
                    ip.id ASC
            `, [
                pedidoId
            ]);


        return rows;
    },


    // ======================================================
    // ATUALIZAR STATUS
    // ======================================================

    async atualizarStatus(
        pedidoId,
        novoStatus
    ) {

        const connection =
            await pool.getConnection();


        try {

            await connection
                .beginTransaction();


            const [pedidos] =
                await connection.execute(`
                    SELECT

                        id,

                        status,

                        estoque_restituido,

                        codigo_rastreio,

                        expira_em

                    FROM pedidos

                    WHERE
                        id = ?

                    LIMIT 1

                    FOR UPDATE
                `, [
                    pedidoId
                ]);


            if (
                pedidos.length === 0
            ) {

                throw criarErro(
                    'Pedido não encontrado.',
                    404
                );
            }


            const pedido =
                pedidos[0];


            // ==================================================
            // PEDIDO CANCELADO NÃO PODE VOLTAR
            // ==================================================

            if (
                pedido.status ===
                'Cancelado'
            ) {

                throw criarErro(
                    'Um pedido cancelado não pode ser reativado.'
                );
            }


            if (
                Number(
                    pedido.estoque_restituido
                ) === 1
            ) {

                throw criarErro(
                    'Este pedido teve o estoque restituído e não pode ser reativado.'
                );
            }


            // ==================================================
            // FLUXO PERMITIDO
            // ==================================================

            const transicoesPermitidas = {

                Pendente: [
                    'Pendente',
                    'Pago'
                ],

                Pago: [
                    'Pago',
                    'Preparando'
                ],

                Preparando: [
                    'Preparando',
                    'Enviado'
                ],

                Enviado: [
                    'Enviado',
                    'Entregue'
                ],

                Entregue: [
                    'Entregue'
                ]
            };


            const permitidos =
                transicoesPermitidas[
                    pedido.status
                ] || [];


            if (
                !permitidos.includes(
                    novoStatus
                )
            ) {

                throw criarErro(
                    `Não é permitido alterar o pedido de ${pedido.status} para ${novoStatus}.`
                );
            }


            // ==================================================
            // RASTREIO OBRIGATÓRIO PARA ENVIO
            // ==================================================

            if (
                novoStatus ===
                    'Enviado' &&
                !String(
                    pedido.codigo_rastreio ||
                    ''
                ).trim()
            ) {

                throw criarErro(
                    'Informe e salve o código de rastreio antes de marcar o pedido como enviado.'
                );
            }


            // ==================================================
            // ATUALIZAR
            // ==================================================

            await connection.execute(`
                UPDATE pedidos

                SET
                    status = ?,

                    expira_em =
                        CASE

                            WHEN
                                ? = 'Pendente'

                            THEN
                                expira_em

                            ELSE
                                NULL

                        END

                WHERE
                    id = ?
            `, [

                novoStatus,

                novoStatus,

                pedidoId
            ]);


            await connection.commit();


            return true;


        } catch (erro) {

            await connection.rollback();

            throw erro;


        } finally {

            connection.release();
        }
    },


    // ======================================================
    // SALVAR CÓDIGO DE RASTREIO
    // ======================================================

    async salvarRastreio(
        pedidoId,
        codigoRastreio
    ) {

        const codigo =
            String(
                codigoRastreio ||
                ''
            )
                .trim()
                .slice(
                    0,
                    100
                );


        if (!codigo) {

            throw criarErro(
                'Informe o código de rastreio.'
            );
        }


        const [pedidos] =
            await pool.execute(`
                SELECT

                    id,

                    status,

                    estoque_restituido

                FROM pedidos

                WHERE
                    id = ?

                LIMIT 1
            `, [
                pedidoId
            ]);


        if (
            pedidos.length === 0
        ) {

            throw criarErro(
                'Pedido não encontrado.',
                404
            );
        }


        const pedido =
            pedidos[0];


        if (
            pedido.status ===
            'Pendente'
        ) {

            throw criarErro(
                'O código de rastreio só pode ser informado após a confirmação do pagamento.'
            );
        }


        if (
            pedido.status ===
                'Cancelado' ||
            Number(
                pedido.estoque_restituido
            ) === 1
        ) {

            throw criarErro(
                'Não é possível adicionar rastreio a um pedido cancelado.'
            );
        }


        const statusPermitidos = [
            'Pago',
            'Preparando',
            'Enviado',
            'Entregue'
        ];


        if (
            !statusPermitidos.includes(
                pedido.status
            )
        ) {

            throw criarErro(
                'O código de rastreio não pode ser informado neste status.'
            );
        }


        await pool.execute(`
            UPDATE pedidos

            SET
                codigo_rastreio = ?,

                rastreio_atualizado_em =
                    NOW()

            WHERE
                id = ?
        `, [
            codigo,
            pedidoId
        ]);


        return true;
    }

};


module.exports =
    AdminPedido;