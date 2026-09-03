const Carrinho =
    require('../models/Carrinho');

const Pedido =
    require('../models/Pedido');


// ======================================================
// MOEDA
// ======================================================

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        );
}


// ======================================================
// MONTAR DADOS DO CHECKOUT
// ======================================================

async function montarCheckout(
    usuarioId
) {

    const itensBanco =
        await Carrinho
            .listarItens(
                usuarioId
            );

    let subtotal = 0;


    const itens =
        itensBanco.map(
            item => {

                const preco =
                    Number(
                        item.preco_unitario
                    );

                const quantidade =
                    Number(
                        item.quantidade
                    );

                const subtotalItem =
                    Math.round(
                        preco *
                        quantidade *
                        100
                    ) / 100;


                subtotal +=
                    subtotalItem;


                return {

                    nome:
                        item.nome,

                    codigo:
                        item.codigo,

                    tamanho:
                        item.tamanho,

                    quantidade,

                    imagem:
                        item.imagem ||
                        '/images/produtos/placeholder.svg',

                    precoFormatado:
                        formatarMoeda(
                            preco
                        ),

                    subtotalFormatado:
                        formatarMoeda(
                            subtotalItem
                        )
                };
            }
        );


    subtotal =
        Math.round(
            subtotal * 100
        ) / 100;


    return {

        itens,

        subtotal,

        subtotalFormatado:
            formatarMoeda(
                subtotal
            ),

        frete:
            0,

        freteFormatado:
            formatarMoeda(0),

        total:
            subtotal,

        totalFormatado:
            formatarMoeda(
                subtotal
            )
    };
}


// ======================================================
// VALIDAR ENDEREÇO
// ======================================================

function validarEndereco(body) {

    const cep =
        String(
            body.cep || ''
        )
            .replace(/\D/g, '')
            .slice(0, 8);


    const logradouro =
        String(
            body.logradouro || ''
        )
            .trim()
            .slice(0, 180);


    const numero =
        String(
            body.numero || ''
        )
            .trim()
            .slice(0, 20);


    const complemento =
        String(
            body.complemento || ''
        )
            .trim()
            .slice(0, 120) ||
        null;


    const bairro =
        String(
            body.bairro || ''
        )
            .trim()
            .slice(0, 120);


    const cidade =
        String(
            body.cidade || ''
        )
            .trim()
            .slice(0, 120);


    const estado =
        String(
            body.estado || ''
        )
            .trim()
            .toUpperCase()
            .slice(0, 2);


    if (
        cep.length !== 8
    ) {

        throw Object.assign(
            new Error(
                'Informe um CEP válido com 8 números.'
            ),
            {
                status: 400
            }
        );
    }


    if (
        !logradouro ||
        !numero ||
        !bairro ||
        !cidade
    ) {

        throw Object.assign(
            new Error(
                'Preencha todos os campos obrigatórios do endereço.'
            ),
            {
                status: 400
            }
        );
    }


    if (
        !/^[A-Z]{2}$/
            .test(estado)
    ) {

        throw Object.assign(
            new Error(
                'Informe uma UF válida, como PR.'
            ),
            {
                status: 400
            }
        );
    }


    return {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
    };
}


// ======================================================
// CONTROLLER
// ======================================================

const CheckoutController = {

    // ==================================================
    // PÁGINA
    // ==================================================

    async pagina(
        req,
        res,
        next
    ) {

        try {

            const usuarioId =
                req.session.usuario.id;


            const [
                checkout,
                enderecoBanco
            ] =
                await Promise.all([

                    montarCheckout(
                        usuarioId
                    ),

                    Pedido
                        .buscarEnderecoPrincipal(
                            usuarioId
                        )

                ]);


            if (
                checkout.itens.length === 0
            ) {

                return res.redirect(
                    '/carrinho'
                );
            }


            return res.render(
                'checkout/index',
                {

                    titulo:
                        'Finalizar compra',

                    paginaAtual:
                        'checkout',

                    checkout,

                    endereco:
                        enderecoBanco || {},

                    erro:
                        ''

                }
            );


        } catch (erro) {

            return next(erro);
        }
    },


    // ==================================================
    // FINALIZAR
    // ==================================================

    async finalizar(
        req,
        res,
        next
    ) {

        const usuarioId =
            req.session.usuario.id;


        try {

            const endereco =
                validarEndereco(
                    req.body
                );


            const pedido =
                await Pedido
                    .criarDoCarrinho({

                        usuarioId,

                        endereco

                    });


            return res.redirect(
    `/pagamento/infinitepay/${pedido.id}`
);


        } catch (erro) {

            if (
                erro.status === 400
            ) {

                try {

                    const checkout =
                        await montarCheckout(
                            usuarioId
                        );


                    if (
                        checkout.itens.length === 0
                    ) {

                        return res.redirect(
                            '/carrinho'
                        );
                    }


                    return res
                        .status(400)
                        .render(
                            'checkout/index',
                            {

                                titulo:
                                    'Finalizar compra',

                                paginaAtual:
                                    'checkout',

                                checkout,

                                endereco:
                                    req.body,

                                erro:
                                    erro.message

                            }
                        );


                } catch (
                    erroCarregamento
                ) {

                    return next(
                        erroCarregamento
                    );
                }
            }


            return next(erro);
        }
    }

};


module.exports =
    CheckoutController;