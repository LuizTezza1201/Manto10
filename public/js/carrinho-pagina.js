document.addEventListener(
    'DOMContentLoaded',
    () => {

        const container =
            document.getElementById(
                'carrinhoPaginaItens'
            );

        const mensagem =
            document.getElementById(
                'mensagemCarrinhoPagina'
            );

        const finalizar =
            document.getElementById(
                'finalizarCompraWoo'
            );

        async function enviar(
            url,
            dados
        ) {

            const resposta =
                await fetch(
                    url,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Accept:
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );

            const json =
                await resposta.json();

            if (
                resposta.status === 401
            ) {

                window.location.href =
                    '/login';

                return null;
            }

            if (!resposta.ok) {

                throw new Error(
                    json.mensagem ||
                    'Não foi possível atualizar o carrinho.'
                );
            }

            return json;
        }

        // ==================================================
        // QUANTIDADE / REMOVER
        // ==================================================

        if (container) {

            container.addEventListener(
                'click',
                async (evento) => {

                    const botao =
                        evento.target.closest(
                            '[data-carrinho-acao]'
                        );

                    if (!botao) {
                        return;
                    }

                    const acao =
                        botao.dataset
                            .carrinhoAcao;

                    const itemId =
                        Number(
                            botao.dataset.itemId
                        );

                    try {

                        if (
                            acao ===
                            'remover'
                        ) {

                            await enviar(
                                `/carrinho/item/${itemId}/remover`,
                                {}
                            );

                            window.location.reload();

                            return;
                        }

                        const quantidade =
                            Number(
                                botao.dataset
                                    .quantidade
                            );

                        const estoque =
                            Number(
                                botao.dataset
                                    .estoque
                            );

                        let novaQuantidade =
                            quantidade;

                        if (
                            acao ===
                            'aumentar'
                        ) {
                            novaQuantidade++;
                        }

                        if (
                            acao ===
                            'diminuir'
                        ) {
                            novaQuantidade--;
                        }

                        if (
                            novaQuantidade < 1 ||
                            novaQuantidade >
                                estoque
                        ) {
                            return;
                        }

                        await enviar(
                            `/carrinho/item/${itemId}/quantidade`,
                            {
                                quantidade:
                                    novaQuantidade
                            }
                        );

                        window.location.reload();

                    } catch (erro) {

                        if (mensagem) {

                            mensagem.textContent =
                                erro.message;
                        }
                    }
                }
            );
        }

        // ==================================================
        // WOOCOMMERCE
        // ==================================================

        if (finalizar) {

            finalizar.addEventListener(
                'click',
                () => {

                    /*
                     * Ainda não enviamos para
                     * WooCommerce porque as
                     * credenciais e IDs dos
                     * produtos serão configurados
                     * na etapa de integração.
                     */

                    alert(
                        'O carrinho está pronto. A finalização pelo WooCommerce será conectada na etapa de integração.'
                    );
                }
            );
        }

    }
);