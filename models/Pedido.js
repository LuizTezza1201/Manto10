const crypto = require('crypto');

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

// ======================================================
// TEMPO DE EXPIRAÇÃO DO PEDIDO
// ======================================================

function obterExpiracaoSegundos() {

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

    return segundos;
}

// ======================================================
// GERAR NÚMERO DO PEDIDO
// ======================================================

function gerarNumeroPedido() {

    const data =
        Date.now();

    const codigo =
        crypto
            .randomBytes(2)
            .toString('hex')
            .toUpperCase();

    return `M10-${data}-${codigo}`;
}


// ======================================================
// PEDIDO
// ======================================================

const Pedido = {

    // ==================================================
    // ENDEREÇO PRINCIPAL
    // ==================================================

    async buscarEnderecoPrincipal(
        usuarioId
    ) {

        const [rows] =
            await pool.execute(`
                SELECT
                    id,
                    apelido,
                    cep,
                    logradouro,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    principal

                FROM enderecos

                WHERE usuario_id = ?

                ORDER BY
                    principal DESC,
                    id DESC

                LIMIT 1
            `, [usuarioId]);

        return rows[0] || null;
    },


    // ==================================================
    // CRIAR PEDIDO A PARTIR DO CARRINHO
    // ==================================================

    async criarDoCarrinho({
        usuarioId,
        endereco
    }) {

        const connection =
            await pool.getConnection();

        try {

            await connection
                .beginTransaction();


            // ==========================================
            // LOCALIZAR CARRINHO
            // ==========================================

            const [carrinhos] =
                await connection.execute(`
                    SELECT
                        id

                    FROM carrinhos

                    WHERE
                        usuario_id = ?
                        AND status = 'Ativo'

                    ORDER BY id DESC

                    LIMIT 1

                    FOR UPDATE
                `, [usuarioId]);


            if (
                carrinhos.length === 0
            ) {

                throw criarErro(
                    'Seu carrinho está vazio.'
                );
            }


            const carrinhoId =
                carrinhos[0].id;


            // ==========================================
            // BUSCAR ITENS E TRAVAR ESTOQUE
            // ==========================================

            const [itens] =
                await connection.execute(`
                    SELECT
                        ic.id AS item_id,
                        ic.quantidade,

                        pt.id AS produto_tamanho_id,
                        pt.estoque,

                        tam.nome AS tamanho,

                        p.id AS produto_id,
                        p.codigo,
                        p.nome,
                        p.status,
                        p.preco,
                        p.preco_promocional,

                        CASE
                            WHEN
                                p.preco_promocional IS NOT NULL
                                AND p.preco_promocional < p.preco

                            THEN p.preco_promocional

                            ELSE p.preco
                        END AS preco_unitario

                    FROM itens_carrinho ic

                    INNER JOIN produto_tamanhos pt
                        ON pt.id =
                           ic.produto_tamanho_id

                    INNER JOIN tamanhos tam
                        ON tam.id =
                           pt.tamanho_id

                    INNER JOIN produtos p
                        ON p.id =
                           pt.produto_id

                    WHERE
                        ic.carrinho_id = ?

                    ORDER BY ic.id ASC

                    FOR UPDATE
                `, [carrinhoId]);


            if (
                itens.length === 0
            ) {

                throw criarErro(
                    'Seu carrinho está vazio.'
                );
            }


            // ==========================================
            // CONFERIR ESTOQUE E CALCULAR TOTAL
            // ==========================================

            let subtotalCentavos = 0;


            for (
                const item of itens
            ) {

                const quantidade =
                    Number(
                        item.quantidade
                    );

                const estoque =
                    Number(
                        item.estoque
                    );


                if (
                    item.status !== 'Ativo'
                ) {

                    throw criarErro(
                        `${item.nome} não está mais disponível.`
                    );
                }


                if (
                    estoque <
                    quantidade
                ) {

                    throw criarErro(
                        `O estoque de ${item.nome} - tamanho ${item.tamanho} mudou. Disponível: ${estoque}.`
                    );
                }


                const precoCentavos =
                    Math.round(
                        Number(
                            item.preco_unitario
                        ) * 100
                    );


                subtotalCentavos +=
                    precoCentavos *
                    quantidade;
            }


            const subtotal =
                subtotalCentavos /
                100;


            /*
             * Frete ainda não está integrado.
             * Nesta etapa o valor permanece zerado.
             */

            const frete =
                0;

            const desconto =
                0;

            const total =
                subtotal +
                frete -
                desconto;


            // ==========================================
            // SALVAR ENDEREÇO
            // ==========================================

            await connection.execute(`
                UPDATE enderecos

                SET principal = 0

                WHERE usuario_id = ?
            `, [usuarioId]);


            const [enderecoResultado] =
                await connection.execute(`
                    INSERT INTO enderecos (
                        usuario_id,
                        apelido,
                        cep,
                        logradouro,
                        numero,
                        complemento,
                        bairro,
                        cidade,
                        estado,
                        principal
                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        1
                    )
                `, [
                    usuarioId,
                    'Entrega',
                    endereco.cep,
                    endereco.logradouro,
                    endereco.numero,
                    endereco.complemento,
                    endereco.bairro,
                    endereco.cidade,
                    endereco.estado
                ]);


            const enderecoId =
                enderecoResultado
                    .insertId;


            // ==========================================
            // CRIAR PEDIDO
            // ==========================================
            
            const expiracaoSegundos =
    obterExpiracaoSegundos();

const expiraEm =
    new Date(
        Date.now() +
        expiracaoSegundos * 1000
    );

            const numeroPedido =
                gerarNumeroPedido();


            const [pedidoResultado] =
    await connection.execute(`
        INSERT INTO pedidos (
            numero_pedido,
            usuario_id,
            endereco_id,
            cupom_id,
            subtotal,
            frete,
            desconto,
            total,
            status,
            observacao,
            estoque_restituido,
            expira_em
        )

        VALUES (
            ?,
            ?,
            ?,
            NULL,
            ?,
            ?,
            ?,
            ?,
            'Pendente',
            NULL,
            0,
            ?
        )
    `, [
        numeroPedido,
        usuarioId,
        enderecoId,
        subtotal,
        frete,
        desconto,
        total,
        expiraEm
    ]);


            const pedidoId =
                pedidoResultado
                    .insertId;


            // ==========================================
            // CRIAR ITENS + BAIXAR ESTOQUE
            // ==========================================

            for (
                const item of itens
            ) {

                const quantidade =
                    Number(
                        item.quantidade
                    );

                const preco =
                    Number(
                        item.preco_unitario
                    );

                const subtotalItem =
                    Math.round(
                        preco *
                        quantidade *
                        100
                    ) / 100;


                await connection.execute(`
                    INSERT INTO itens_pedido (
                        pedido_id,
                        produto_id,
                        codigo_produto,
                        nome_produto,
                        tamanho,
                        quantidade,
                        preco_unitario,
                        subtotal
                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `, [
                    pedidoId,
                    item.produto_id,
                    item.codigo,
                    item.nome,
                    item.tamanho,
                    quantidade,
                    preco,
                    subtotalItem
                ]);


                const [estoqueResultado] =
                    await connection.execute(`
                        UPDATE produto_tamanhos

                        SET estoque =
                            estoque - ?

                        WHERE
                            id = ?
                            AND estoque >= ?
                    `, [
                        quantidade,
                        item.produto_tamanho_id,
                        quantidade
                    ]);


                if (
                    estoqueResultado
                        .affectedRows === 0
                ) {

                    throw criarErro(
                        `Não foi possível reservar o estoque de ${item.nome}.`
                    );
                }
            }


            // ==========================================
            // FINALIZAR CARRINHO
            // ==========================================

            await connection.execute(`
                UPDATE carrinhos

                SET status = 'Finalizado'

                WHERE
                    id = ?
                    AND usuario_id = ?
            `, [
                carrinhoId,
                usuarioId
            ]);


            await connection.commit();


            return {
                id:
                    pedidoId,

                numeroPedido,

                total
            };


        } catch (erro) {

            await connection
                .rollback();

            throw erro;


        } finally {

            connection.release();
        }
    },
// ======================================================
// CANCELAR PEDIDO E RESTITUIR ESTOQUE
// ======================================================

async cancelarERestituirEstoque({
    pedidoId,
    usuarioId = null,
    somentePendente = false
}) {

    const connection =
        await pool.getConnection();

    try {

        await connection.beginTransaction();


        // ==============================================
        // BUSCAR E TRAVAR PEDIDO
        // ==============================================

        let sqlPedido = `
            SELECT
                id,
                usuario_id,
                status,
                estoque_restituido

            FROM pedidos

            WHERE id = ?
        `;

        const parametros = [
            pedidoId
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


        // ==============================================
        // CLIENTE SÓ CANCELA PENDENTE
        // ==============================================

        if (
            somentePendente &&
            pedido.status !== 'Pendente'
        ) {

            throw criarErro(
                'Este pedido não pode mais ser cancelado.'
            );
        }


        // ==============================================
        // ADMIN: SOMENTE PENDENTE OU CANCELADO
        // ==============================================

        if (
            ![
                'Pendente',
                'Cancelado'
            ].includes(
                pedido.status
            )
        ) {

            throw criarErro(
                'O estoque deste pedido não pode ser restituído neste status.'
            );
        }


        // ==============================================
        // PROTEÇÃO CONTRA DUPLICIDADE
        // ==============================================

        if (
            Number(
                pedido.estoque_restituido
            ) === 1
        ) {

            throw criarErro(
                'O estoque deste pedido já foi restituído.'
            );
        }


        // ==============================================
        // BUSCAR ITENS DO PEDIDO
        // ==============================================

        const [itens] =
            await connection.execute(`
                SELECT
                    produto_id,
                    tamanho,
                    quantidade

                FROM itens_pedido

                WHERE pedido_id = ?

                FOR UPDATE
            `, [
                pedidoId
            ]);


        if (
            itens.length === 0
        ) {

            throw criarErro(
                'O pedido não possui produtos.'
            );
        }


        // ==============================================
        // DEVOLVER CADA ITEM AO ESTOQUE
        // ==============================================

        for (
            const item of itens
        ) {

            const [resultado] =
                await connection.execute(`
                    UPDATE produto_tamanhos pt

                    INNER JOIN tamanhos t
                        ON t.id = pt.tamanho_id

                    SET
                        pt.estoque =
                            pt.estoque + ?

                    WHERE
                        pt.produto_id = ?
                        AND t.nome = ?
                `, [
                    Number(
                        item.quantidade
                    ),

                    item.produto_id,

                    item.tamanho
                ]);


            if (
                resultado.affectedRows === 0
            ) {

                throw criarErro(
                    `Não foi possível restituir o estoque do tamanho ${item.tamanho}.`
                );
            }
        }


        // ==============================================
        // CANCELAR E MARCAR COMO RESTITUÍDO
        // ==============================================

        await connection.execute(`
            UPDATE pedidos

SET
    status = 'Cancelado',
    estoque_restituido = 1,
    expira_em = NULL

WHERE id = ?
        `, [
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
}

};


module.exports = Pedido;