const Admin =
    require('../models/Admin');

const Produto =
    require('../models/Produto');

function formatarMoeda(valor) {

    return Number(valor)
        .toLocaleString(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        );
}

const AdminController = {

    // ======================================================
    // DASHBOARD
    // ======================================================

    async inicio(
        req,
        res,
        next
    ) {

        try {

            const resumo =
                await Admin.obterResumo();

            resumo.totalVendasFormatado =
                formatarMoeda(
                    resumo.totalVendas
                );

            return res.render(
                'admin/inicio',
                {
                    titulo:
                        'Dashboard',

                    paginaAtual:
                        'admin',

                    resumo
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ======================================================
    // PRODUTOS
    // ======================================================

    async produtos(
        req,
        res,
        next
    ) {

        try {

            const busca =
                String(
                    req.query.busca || ''
                )
                    .trim()
                    .slice(0, 100);

            const tipo =
                String(
                    req.query.tipo || ''
                );

            const status =
                String(
                    req.query.status || ''
                );

            const estoque =
                String(
                    req.query.estoque || ''
                );

            const ordem =
                String(
                    req.query.ordem || 'az'
                );

            const produtos =
                await Produto.listarAdmin({
                    busca,
                    tipo,
                    status,
                    estoque,
                    ordem
                });

            return res.render(
                'admin/produtos',
                {
                    titulo:
                        'Gerenciar camisas',

                    paginaAtual:
                        'admin',

                    produtos,

                    filtros: {
                        busca,
                        tipo,
                        status,
                        estoque,
                        ordem
                    },

                    sucesso:
                        req.query.sucesso ===
                        'estoque'
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ======================================================
    // ATUALIZAR ESTOQUE
    // ======================================================

    async atualizarEstoque(
        req,
        res,
        next
    ) {

        try {

            const produtoId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    produtoId
                ) ||
                produtoId <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        'Produto inválido.'
                    );
            }

            const campos = {
                P:
                    req.body.estoque_p,

                M:
                    req.body.estoque_m,

                G:
                    req.body.estoque_g,

                GG:
                    req.body.estoque_gg
            };

            const estoques = {};

            for (
                const [
                    tamanho,
                    valor
                ]
                of Object.entries(
                    campos
                )
            ) {

                const quantidade =
                    Number(valor);

                if (
                    !Number.isInteger(
                        quantidade
                    ) ||
                    quantidade < 0
                ) {

                    return res
                        .status(400)
                        .send(
                            `Estoque inválido para tamanho ${tamanho}.`
                        );
                }

                estoques[tamanho] =
                    quantidade;
            }

            await Produto
                .atualizarEstoqueAdmin({
                    produtoId,
                    estoques
                });

            return res.redirect(
                '/admin/produtos?sucesso=estoque'
            );

        } catch (erro) {

            return next(erro);
        }
    }

};

module.exports =
    AdminController;