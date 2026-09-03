const AdminVenda =
    require('../models/AdminVenda');


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


function formatarDataHora(data) {

    if (!data) {
        return '';
    }

    return new Date(data)
        .toLocaleString(
            'pt-BR',
            {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        );
}


const AdminVendaController = {

    // ======================================================
    // LISTAR VENDAS
    // ======================================================

    async listar(
        req,
        res,
        next
    ) {

        try {

            const [
                resumoBanco,
                vendasBanco
            ] =
                await Promise.all([

                    AdminVenda
                        .obterResumo(),

                    AdminVenda
                        .listarUltimas(20)

                ]);


            const resumo = {

                hoje:
                    formatarMoeda(
                        resumoBanco.hoje
                    ),

                semana:
                    formatarMoeda(
                        resumoBanco.semana
                    ),

                mes:
                    formatarMoeda(
                        resumoBanco.mes
                    ),

                ano:
                    formatarMoeda(
                        resumoBanco.ano
                    ),

                total_vendas:
                    Number(
                        resumoBanco
                            .total_vendas ||
                        0
                    )
            };


            const vendas =
                vendasBanco.map(
                    venda => ({

                        ...venda,

                        total_itens:
                            Number(
                                venda.total_itens ||
                                0
                            ),

                        total_formatado:
                            formatarMoeda(
                                venda.total
                            ),

                        data_formatada:
                            formatarDataHora(
                                venda.criado_em
                            )
                    })
                );


            return res.render(
                'admin/vendas',
                {

                    titulo:
                        'Vendas',

                    paginaAtual:
                        'admin',

                    resumo,

                    vendas,

                    sucesso:
                        req.query.sucesso ===
                        'venda'
                }
            );


        } catch (erro) {

            return next(erro);
        }
    },


    // ======================================================
    // NOVA VENDA
    // ======================================================

    async nova(
        req,
        res,
        next
    ) {

        try {

            const produtos =
                await AdminVenda
                    .listarProdutosParaVenda();


            return res.render(
                'admin/nova-venda',
                {

                    titulo:
                        'Criar venda',

                    paginaAtual:
                        'admin',

                    produtos,

                    erro:
                        null,

                    valores: {

                        origem:
                            'Loja física',

                        cliente_nome:
                            '',

                        forma_pagamento:
                            'Pix',

                        observacao:
                            ''
                    }
                }
            );


        } catch (erro) {

            return next(erro);
        }
    },


    // ======================================================
    // CRIAR VENDA
    // ======================================================

    async criar(
        req,
        res,
        next
    ) {

        const valores = {

            origem:
                String(
                    req.body.origem ||
                    ''
                ),

            cliente_nome:
                String(
                    req.body.cliente_nome ||
                    ''
                ),

            forma_pagamento:
                String(
                    req.body.forma_pagamento ||
                    ''
                ),

            observacao:
                String(
                    req.body.observacao ||
                    ''
                )
        };


        try {

            await AdminVenda
                .criarManual({

                    administradorId:
                        req.session
                            .usuario
                            .id,

                    origem:
                        valores.origem,

                    clienteNome:
                        valores.cliente_nome,

                    formaPagamento:
                        valores
                            .forma_pagamento,

                    observacao:
                        valores.observacao,

                    produtoTamanhoIds:
                        req.body
                            .produto_tamanho_id,

                    quantidades:
                        req.body
                            .quantidade

                });


            return res.redirect(
                '/admin/vendas?sucesso=venda'
            );


        } catch (erro) {

            if (
                erro.status === 400 ||
                erro.status === 404
            ) {

                try {

                    const produtos =
                        await AdminVenda
                            .listarProdutosParaVenda();


                    return res
                        .status(erro.status)
                        .render(
                            'admin/nova-venda',
                            {

                                titulo:
                                    'Criar venda',

                                paginaAtual:
                                    'admin',

                                produtos,

                                erro:
                                    erro.message,

                                valores
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
    },

    // ======================================================
// DETALHES DA VENDA MANUAL
// ======================================================

async detalhesManual(
    req,
    res,
    next
) {

    try {

        const vendaId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                vendaId
            ) ||
            vendaId <= 0
        ) {

            return res
                .status(400)
                .send(
                    'Venda inválida.'
                );
        }


        const [
            vendaBanco,
            itensBanco
        ] =
            await Promise.all([

                AdminVenda
                    .buscarManualPorId(
                        vendaId
                    ),

                AdminVenda
                    .listarItensManual(
                        vendaId
                    )
            ]);


        if (!vendaBanco) {

            return res
                .status(404)
                .send(
                    'Venda não encontrada.'
                );
        }


        const venda = {

            ...vendaBanco,

            total_formatado:
                formatarMoeda(
                    vendaBanco.total
                ),

            data_formatada:
                formatarDataHora(
                    vendaBanco.criado_em
                )
        };


        const itens =
            itensBanco.map(
                item => ({

                    ...item,

                    quantidade:
                        Number(
                            item.quantidade
                        ),

                    preco_unitario_formatado:
                        formatarMoeda(
                            item.preco_unitario
                        ),

                    subtotal_formatado:
                        formatarMoeda(
                            item.subtotal
                        )
                })
            );


        return res.render(
            'admin/venda-detalhe',
            {

                titulo:
                    `Venda ${venda.numero_venda}`,

                paginaAtual:
                    'admin',

                venda,

                itens,

                sucesso:
                    req.query.sucesso ===
                    'cancelamento'
            }
        );


    } catch (erro) {

        return next(erro);
    }
},


// ======================================================
// CANCELAR VENDA MANUAL
// ======================================================

async cancelarManual(
    req,
    res,
    next
) {

    try {

        const vendaId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                vendaId
            ) ||
            vendaId <= 0
        ) {

            return res
                .status(400)
                .send(
                    'Venda inválida.'
                );
        }


        await AdminVenda
            .cancelarManualERestituirEstoque(
                vendaId
            );


        return res.redirect(
            `/admin/vendas/manuais/${vendaId}?sucesso=cancelamento`
        );


    } catch (erro) {

        if (
            erro.status === 400 ||
            erro.status === 404
        ) {

            return res
                .status(
                    erro.status
                )
                .send(
                    erro.message
                );
        }


        return next(erro);
    }
}

};


module.exports =
    AdminVendaController;