const pool = require('../config/database');

const AdminPedido = {

    // ======================================================
    // LISTAR PEDIDOS
    // ======================================================

    async listar({
        busca = '',
        status = '',
        ordem = 'recentes'
    } = {}) {

        const filtros = ['1 = 1'];
        const parametros = [];

        // PESQUISA
        if (busca) {

            filtros.push(`
                (
                    p.numero_pedido LIKE ?
                    OR u.nome LIKE ?
                    OR u.email LIKE ?
                )
            `);

            const termo = `%${busca}%`;

            parametros.push(
                termo,
                termo,
                termo
            );
        }

        // STATUS
        const statusPermitidos = [
            'Pendente',
            'Pago',
            'Preparando',
            'Enviado',
            'Entregue',
            'Cancelado'
        ];

        if (statusPermitidos.includes(status)) {

            filtros.push(
                'p.status = ?'
            );

            parametros.push(status);
        }

        // ORDENAÇÃO
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
            filtros.join(' AND ');

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
                    p.observacao,
                    p.criado_em,
                    p.atualizado_em,

                    u.id AS usuario_id,
                    u.nome AS cliente_nome,
                    u.email AS cliente_email,

                    (
                        SELECT
                            COALESCE(
                                SUM(ip.quantidade),
                                0
                            )

                        FROM itens_pedido ip

                        WHERE ip.pedido_id = p.id
                    ) AS total_itens,

                    pg.forma_pagamento,
                    pg.status AS pagamento_status

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id = p.usuario_id

                LEFT JOIN pagamentos pg
                    ON pg.pedido_id = p.id

                WHERE ${whereSql}

                ORDER BY ${ordemSql}
            `, parametros);

        return rows;
    },

    // ======================================================
    // BUSCAR PEDIDO
    // ======================================================

    async buscarPorId(pedidoId) {

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
                    p.observacao,

                    p.criado_em,
                    p.atualizado_em,

                    u.nome AS cliente_nome,
                    u.email AS cliente_email,

                    e.apelido AS endereco_apelido,
                    e.cep,
                    e.logradouro,
                    e.numero AS endereco_numero,
                    e.complemento,
                    e.bairro,
                    e.cidade,
                    e.estado,

                    c.codigo AS cupom_codigo,

                    pg.forma_pagamento,
                    pg.status AS pagamento_status,
                    pg.valor AS pagamento_valor,
                    pg.pago_em

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id = p.usuario_id

                INNER JOIN enderecos e
                    ON e.id = p.endereco_id

                LEFT JOIN cupons c
                    ON c.id = p.cupom_id

                LEFT JOIN pagamentos pg
                    ON pg.pedido_id = p.id

                WHERE p.id = ?

                LIMIT 1
            `, [pedidoId]);

        return rows[0] || null;
    },

    // ======================================================
    // ITENS DO PEDIDO
    // ======================================================

    async listarItens(pedidoId) {

        const [rows] =
            await pool.execute(`
                SELECT
                    ip.id,
                    ip.produto_id,
                    ip.codigo_produto,
                    ip.nome_produto,
                    ip.tamanho,
                    ip.quantidade,
                    ip.preco_unitario,
                    ip.subtotal,

                    (
                        SELECT pi.caminho

                        FROM produto_imagens pi

                        WHERE
                            pi.produto_id = ip.produto_id

                        ORDER BY
                            pi.principal DESC,
                            pi.ordem ASC,
                            pi.id ASC

                        LIMIT 1
                    ) AS imagem

                FROM itens_pedido ip

                WHERE ip.pedido_id = ?

                ORDER BY ip.id ASC
            `, [pedidoId]);

        return rows;
    },

    // ======================================================
    // ATUALIZAR STATUS
    // ======================================================

    async atualizarStatus(
    pedidoId,
    novoStatus
) {

    const statusPermitidos = [
        'Pendente',
        'Pago',
        'Preparando',
        'Enviado',
        'Entregue'
    ];


    // ==================================================
    // VALIDAR STATUS
    // ==================================================

    if (
        !statusPermitidos.includes(
            novoStatus
        )
    ) {

        const erro =
            new Error(
                'Status de pedido inválido.'
            );

        erro.status = 400;

        throw erro;
    }


    // ==================================================
    // DEFINIR EXPIRAÇÃO
    // ==================================================

    let expiraEm = null;


    /*
     * Somente pedidos PENDENTES
     * precisam ter prazo de expiração.
     *
     * Pago, Preparando, Enviado e
     * Entregue ficam com expira_em = NULL.
     */

    if (
        novoStatus === 'Pendente'
    ) {

        let segundos =
            Number(
                process.env
                    .PEDIDO_EXPIRACAO_SEGUNDOS ||
                1800
            );


        if (
            !Number.isInteger(
                segundos
            ) ||
            segundos <= 0
        ) {

            segundos = 1800;
        }


        expiraEm =
            new Date(
                Date.now() +
                segundos * 1000
            );
    }


    // ==================================================
    // ATUALIZAR PEDIDO
    // ==================================================

    const [resultado] =
        await pool.execute(`
            UPDATE pedidos

            SET
                status = ?,
                expira_em = ?

            WHERE id = ?
        `, [
            novoStatus,
            expiraEm,
            pedidoId
        ]);


    // ==================================================
    // PEDIDO NÃO ENCONTRADO
    // ==================================================

    if (
        resultado.affectedRows === 0
    ) {

        const erro =
            new Error(
                'Pedido não encontrado.'
            );

        erro.status = 404;

        throw erro;
    }


    return true;
}

};

module.exports = AdminPedido;