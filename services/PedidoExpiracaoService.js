const pool =
    require('../config/database');

const Pedido =
    require('../models/Pedido');


let executando =
    false;

let temporizador =
    null;


// ======================================================
// INTERVALO DA VERIFICAÇÃO
// ======================================================

function obterIntervaloSegundos() {

    const segundos =
        Number(
            process.env
                .PEDIDO_VERIFICACAO_SEGUNDOS ||
            60
        );

    if (
        !Number.isInteger(segundos) ||
        segundos <= 0
    ) {

        return 60;
    }

    return segundos;
}


// ======================================================
// PROCURAR E CANCELAR PEDIDOS EXPIRADOS
// ======================================================

async function verificarPedidosExpirados() {

    if (executando) {
        return;
    }

    executando =
        true;

    try {

        const [pedidos] =
            await pool.execute(`
                SELECT
                    id,
                    numero_pedido

                FROM pedidos

                WHERE
                    status = 'Pendente'

                    AND estoque_restituido = 0

                    AND expira_em IS NOT NULL

                    AND expira_em <= NOW()

                ORDER BY expira_em ASC

                LIMIT 50
            `);


        for (
            const pedido of pedidos
        ) {

            try {

                await Pedido
                    .cancelarERestituirEstoque({

                        pedidoId:
                            pedido.id,

                        somentePendente:
                            true

                    });


                console.log(
                    `Pedido expirado automaticamente: ${pedido.numero_pedido}`
                );


            } catch (erro) {

                /*
                 * Pode acontecer de o pagamento
                 * ser confirmado exatamente entre
                 * a busca e a tentativa de cancelar.
                 *
                 * Nesse caso o pedido deixa de ser
                 * Pendente e não deve ser cancelado.
                 */

                if (
                    erro.status !== 400 &&
                    erro.status !== 404
                ) {

                    console.error(
                        `Erro ao expirar pedido ${pedido.numero_pedido}:`,
                        erro
                    );
                }
            }
        }


    } catch (erro) {

        console.error(
            'Erro ao verificar pedidos expirados:',
            erro
        );


    } finally {

        executando =
            false;
    }
}


// ======================================================
// INICIAR MONITOR
// ======================================================

function iniciarExpiracaoPedidos() {

    if (temporizador) {
        return;
    }


    const intervaloSegundos =
        obterIntervaloSegundos();


    console.log(
        `Expiração de pedidos ativa: verificação a cada ${intervaloSegundos}s`
    );


    // Primeira verificação
    verificarPedidosExpirados();


    temporizador =
        setInterval(
            verificarPedidosExpirados,
            intervaloSegundos * 1000
        );


    /*
     * Evita que somente o timer
     * mantenha o processo Node aberto.
     */

    if (
        typeof temporizador.unref ===
        'function'
    ) {

        temporizador.unref();
    }
}


module.exports = {
    iniciarExpiracaoPedidos,
    verificarPedidosExpirados
};