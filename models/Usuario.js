const pool = require('../config/database');


const Usuario = {

    // ======================================================
    // BUSCAR POR E-MAIL
    // ======================================================

    async buscarPorEmail(email) {

        const [rows] = await pool.execute(
            `
                SELECT
                    id,
                    nome,
                    email,
                    telefone,
                    senha,
                    tipo,
                    status,
                    criado_em,
                    atualizado_em
                FROM usuarios
                WHERE email = ?
                LIMIT 1
            `,
            [email]
        );

        return rows[0] || null;
    },


    // ======================================================
    // BUSCAR POR ID
    // ======================================================

    async buscarPorId(id) {

        const [rows] = await pool.execute(
            `
                SELECT
                    id,
                    nome,
                    email,
                    telefone,
                    tipo,
                    status,
                    criado_em,
                    atualizado_em
                FROM usuarios
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },


    // ======================================================
    // VERIFICAR E-MAIL
    // ======================================================

    async emailExiste(email) {

        const [rows] = await pool.execute(
            `
                SELECT id
                FROM usuarios
                WHERE email = ?
                LIMIT 1
            `,
            [email]
        );

        return rows.length > 0;
    },


    // ======================================================
    // CRIAR USUÁRIO
    // ======================================================

    async criar({
        nome,
        email,
        telefone,
        senha
    }) {

        const [resultado] = await pool.execute(
            `
                INSERT INTO usuarios (
                    nome,
                    email,
                    telefone,
                    senha,
                    tipo,
                    status
                )
                VALUES (?, ?, ?, ?, 'Cliente', 'Ativo')
            `,
            [
                nome,
                email,
                telefone,
                senha
            ]
        );

        return resultado.insertId;
    },


    // ======================================================
    // PEDIDOS DO USUÁRIO
    // ======================================================

    async listarPedidos(usuarioId) {

        const [rows] = await pool.execute(
            `
                SELECT
                    p.id,
                    p.numero_pedido,
                    p.total,
                    p.status,
                    p.codigo_rastreio,
                    p.criado_em,

                    (
                        SELECT
                            COALESCE(
                                SUM(ip.quantidade),
                                0
                            )
                        FROM itens_pedido ip
                        WHERE ip.pedido_id = p.id
                    ) AS total_itens,

                    (
                        SELECT pg.forma_pagamento
                        FROM pagamentos pg
                        WHERE pg.pedido_id = p.id
                        ORDER BY pg.id DESC
                        LIMIT 1
                    ) AS forma_pagamento

                FROM pedidos p

                WHERE p.usuario_id = ?

                ORDER BY p.criado_em DESC
            `,
            [usuarioId]
        );

        return rows;
    },


    // ======================================================
    // PEDIDO ESPECÍFICO DO USUÁRIO
    // ======================================================

    async buscarPedidoDoUsuario(
        pedidoId,
        usuarioId
    ) {

        const [rows] = await pool.execute(
            `
                SELECT
                    p.id,
                    p.numero_pedido,
                    p.subtotal,
                    p.frete,
                    p.desconto,
                    p.total,
                    p.status,
                    p.codigo_rastreio,
                    p.rastreio_atualizado_em,
                    p.observacao,
                    p.criado_em,
                    p.atualizado_em,

                    e.cep,
                    e.logradouro,
                    e.numero AS endereco_numero,
                    e.complemento,
                    e.bairro,
                    e.cidade,
                    e.estado,

                    (
                        SELECT pg.forma_pagamento
                        FROM pagamentos pg
                        WHERE pg.pedido_id = p.id
                        ORDER BY pg.id DESC
                        LIMIT 1
                    ) AS forma_pagamento,

                    (
                        SELECT pg.status
                        FROM pagamentos pg
                        WHERE pg.pedido_id = p.id
                        ORDER BY pg.id DESC
                        LIMIT 1
                    ) AS pagamento_status

                FROM pedidos p

                LEFT JOIN enderecos e
                    ON e.id = p.endereco_id

                WHERE
                    p.id = ?
                    AND p.usuario_id = ?

                LIMIT 1
            `,
            [
                pedidoId,
                usuarioId
            ]
        );

        return rows[0] || null;
    },


    // ======================================================
    // ITENS DE UM PEDIDO
    // ======================================================

    async listarItensPedido(pedidoId) {

        const [rows] = await pool.execute(
            `
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
            `,
            [pedidoId]
        );

        return rows;
    }

};


module.exports = Usuario;