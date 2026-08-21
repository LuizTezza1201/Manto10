const Liga = require('../models/Liga');
const Produto = require('../models/Produto');

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}

function prepararProdutos(produtos) {

    return produtos.map(
        (produto) => {

            const precoNormal =
                Number(
                    produto.preco
                );

            const temPromocao =
                produto.preco_promocional !== null &&
                Number(
                    produto.preco_promocional
                ) < precoNormal;

            const precoAtual =
                temPromocao
                    ? Number(
                        produto.preco_promocional
                    )
                    : precoNormal;

            return {

                ...produto,

                precoNormal,

                precoAtual,

                temPromocao,

                precoFormatado:
                    formatarMoeda(
                        precoAtual
                    ),

                precoAnteriorFormatado:
                    temPromocao
                        ? formatarMoeda(
                            precoNormal
                        )
                        : null
            };
        }
    );
}

const HomeController = {

    async home(req, res, next) {

        try {

            const [
                ligas,
                tailandesasBanco,
                nacionaisBanco
            ] = await Promise.all([

                Liga.listarAtivas(),

                Produto.listarCatalogo({
                    tipo: 'Tailandesa',
                    ordem: 'recentes'
                }),

                Produto.listarCatalogo({
                    tipo: 'Nacional Premium',
                    ordem: 'recentes'
                })

            ]);

            const tailandesas =
                prepararProdutos(
                    tailandesasBanco.slice(0, 10)
                );

            const nacionaisPremium =
                prepararProdutos(
                    nacionaisBanco.slice(0, 10)
                );

            return res.render(
                'home',
                {
                    titulo: 'Início',
                    paginaAtual: 'inicio',
                    ligas,
                    tailandesas,
                    nacionaisPremium
                }
            );

        } catch (erro) {

            return next(erro);
        }
    }

};

module.exports = HomeController;