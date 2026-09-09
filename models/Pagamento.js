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


const Pagamento = {

    // ==================================================
    // CONFIRMAR PAGAMENTO INFINITEPAY
    // ==================================================

    async confirmarInfinitePay({
        usuarioId = null,
        numeroPedido,
        transactionNsu,
        invoiceSlug,
        comprovanteUrl,
        captureMethod,
        amountCentavos
    }) {

        const connection =
            await pool.getConnection();


        try {

            await connection
                .beginTransaction();


            // ==========================================
            // LOCALIZAR PEDIDO
            // ==========================================

            let sqlPedido = `
                SELECT
                    id,
                    usuario_id,
                    numero_pedido,
                    total,
                    status,
                    estoque_restituido

                FROM pedidos

                WHERE numero_pedido = ?
            `;

            const parametros = [
                numeroPedido
            ];


            if (usuarioId !== null) {

                sqlPedido += `
                    AND usuario_id = ?
                `;

                parametros.push(
                    usuarioId
                );
            }


            sqlPedido += `
                LIMIT 1
                FOR UPDATE
            `;


            const [pedidos] =
                await connection.execute(
                    sqlPedido,
                    parametros
                );


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
                'Cancelado'
            ) {

                throw criarErro(
                    'Este pedido já foi cancelado e o estoque foi restituído.',
                    409
                );
            }


            // ==========================================
            // CONFERIR VALOR
            // ==========================================

            const esperadoCentavos =
                Math.round(
                    Number(
                        pedido.total
                    ) * 100
                );


            if (
                Number(amountCentavos) !==
                esperadoCentavos
            ) {

                throw criarErro(
                    'O valor confirmado pela InfinitePay não corresponde ao pedido.'
                );
            }


            // ==========================================
            // FORMA DE PAGAMENTO
            // ==========================================

            let formaPagamento;


            if (
                captureMethod === 'pix'
            ) {

                formaPagamento =
                    'Pix';

            } else if (
                captureMethod ===
                'credit_card'
            ) {

                /*
                 * A tabela pagamentos utiliza
                 * o valor "Cartao" no ENUM.
                 */

                formaPagamento =
                    'Cartao';

            } else {

                throw criarErro(
                    'Forma de pagamento não reconhecida.'
                );
            }


            // ==========================================
            // PAGAMENTO JÁ EXISTE?
            // ==========================================

            const [pagamentos] =
                await connection.execute(`
                    SELECT
                        id,
                        transaction_nsu,
                        status

                    FROM pagamentos

                    WHERE pedido_id = ?

                    LIMIT 1

                    FOR UPDATE
                `, [
                    pedido.id
                ]);


            if (
                pagamentos.length > 0
            ) {

                const pagamento =
                    pagamentos[0];


                if (
                    pagamento.transaction_nsu &&
                    pagamento.transaction_nsu !==
                        transactionNsu
                ) {

                    throw criarErro(
                        'Este pedido já possui outra transação registrada.',
                        409
                    );
                }


                await connection.execute(`
                    UPDATE pagamentos

                    SET
                        forma_pagamento = ?,
                        provedor = 'InfinitePay',
                        status = 'Aprovado',
                        valor = ?,
                        transaction_nsu = ?,
                        invoice_slug = ?,
                        comprovante_url = ?,
                        pago_em = COALESCE(
                            pago_em,
                            NOW()
                        )

                    WHERE id = ?
                `, [
                    formaPagamento,
                    Number(
                        pedido.total
                    ),
                    transactionNsu,
                    invoiceSlug,
                    comprovanteUrl ||
                        null,
                    pagamento.id
                ]);

            } else {

                await connection.execute(`
                    INSERT INTO pagamentos (
                        pedido_id,
                        forma_pagamento,
                        provedor,
                        status,
                        valor,
                        transaction_nsu,
                        invoice_slug,
                        comprovante_url,
                        pago_em
                    )

                    VALUES (
                        ?,
                        ?,
                        'InfinitePay',
                        'Aprovado',
                        ?,
                        ?,
                        ?,
                        ?,
                        NOW()
                    )
                `, [
                    pedido.id,
                    formaPagamento,
                    Number(
                        pedido.total
                    ),
                    transactionNsu,
                    invoiceSlug,
                    comprovanteUrl ||
                        null
                ]);
            }


            // ==========================================
            // ATUALIZAR PEDIDO
            // ==========================================

            if (
                pedido.status ===
                'Pendente'
            ) {

                await connection.execute(`
                    UPDATE pedidos

                    SET
                        status = 'Pago',
                        expira_em = NULL

                    WHERE id = ?
                `, [
                    pedido.id
                ]);
            }


            await connection
                .commit();


            return {
                pedidoId:
                    pedido.id,

                usuarioId:
                    pedido.usuario_id,

                numeroPedido:
                    pedido.numero_pedido,

                formaPagamento,

                total:
                    Number(
                        pedido.total
                    )
            };


        } catch (erro) {

            await connection
                .rollback();

            throw erro;


        } finally {

            connection.release();
        }
    }

};


module.exports =
    Pagamento;
