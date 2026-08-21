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

function prepararProduto(produto) {

    const precoNormal =
        Number(produto.preco);

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
                : null,

        estoqueTotal:
            Number(
                produto.estoque_total || 0
            )
    };
}

const ProdutoController = {

    // ======================================================
    // CATÁLOGO
    // ======================================================

    async catalogo(req, res, next) {

        try {

            const tipoRecebido =
                String(
                    req.query.tipo || ''
                ).trim();

            const ordemRecebida =
                String(
                    req.query.ordem ||
                    'recentes'
                ).trim();

            const busca =
                String(
                    req.query.busca || ''
                )
                    .trim()
                    .substring(0, 100);

            const categoria =
                String(
                    req.query.categoria || ''
                )
                    .trim()
                    .toLowerCase();

            const liga =
                String(
                    req.query.liga || ''
                )
                    .trim()
                    .toLowerCase();

            const tiposPermitidos = [
                '',
                'Tailandesa',
                'Nacional Premium'
            ];

            const ordensPermitidas = [
                'recentes',
                'az',
                'za',
                'menor_preco',
                'maior_preco'
            ];

            const tipo =
                tiposPermitidos.includes(
                    tipoRecebido
                )
                    ? tipoRecebido
                    : '';

            const ordem =
                ordensPermitidas.includes(
                    ordemRecebida
                )
                    ? ordemRecebida
                    : 'recentes';

            const produtosBanco =
                await Produto.listarCatalogo({
                    tipo,
                    ordem,
                    busca,
                    categoria,
                    liga
                });

            const produtos =
                produtosBanco.map(
                    prepararProduto
                );

            let tituloCatalogo =
                'Camisas';

            if (busca) {

                tituloCatalogo =
                    `Resultados para "${busca}"`;

            } else if (categoria) {

                const nomesCategorias = {
                    'lancamentos':
                        'Lançamentos',

                    'retro':
                        'Retrô',

                    'infantil':
                        'Infantil',

                    'box-misteriosas':
                        'Box Misteriosas'
                };

                tituloCatalogo =
                    nomesCategorias[categoria] ||
                    'Camisas';

            } else if (
                liga &&
                produtos.length > 0
            ) {

                tituloCatalogo =
                    produtos[0].liga ||
                    'Camisas';
            }

            return res.render(
                'produtos/index',
                {
                    titulo: tituloCatalogo,

                    paginaAtual:
                        categoria || 'camisas',

                    tituloCatalogo,

                    produtos,

                    tipoSelecionado:
                        tipo,

                    ordemSelecionada:
                        ordem,

                    buscaSelecionada:
                        busca,

                    categoriaSelecionada:
                        categoria,

                    ligaSelecionada:
                        liga
                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    // ======================================================
    // DETALHE
    // ======================================================

    async detalhe(req, res, next) {

        try {

            const slug =
                String(
                    req.params.slug || ''
                ).trim();

            const produtoBanco =
                await Produto.buscarPorSlug(
                    slug
                );

            if (!produtoBanco) {

                return res
                    .status(404)
                    .send(
                        'Produto não encontrado - Manto 10'
                    );
            }

            const [
                imagensBanco,
                tamanhosBanco
            ] = await Promise.all([

                Produto.listarImagens(
                    produtoBanco.id
                ),

                Produto.listarTamanhos(
                    produtoBanco.id
                )

            ]);

            const produto =
                prepararProduto(
                    produtoBanco
                );

            const imagens =
                imagensBanco.length > 0
                    ? imagensBanco
                    : [
                        {
                            caminho:
                                '/images/produtos/placeholder.svg',

                            texto_alternativo:
                                produto.nome,

                            principal: true,

                            ordem: 1
                        }
                    ];

            const tamanhos =
                tamanhosBanco.map(
                    (item) => ({
                        ...item,

                        estoque:
                            Number(
                                item.estoque
                            )
                    })
                );

            produto.estoqueTotal =
                tamanhos.reduce(
                    (
                        total,
                        tamanho
                    ) =>
                        total +
                        tamanho.estoque,
                    0
                );

            return res.render(
                'produtos/detalhe',
                {
                    titulo:
                        produto.nome,

                    paginaAtual:
                        'camisas',

                    produto,
                    imagens,
                    tamanhos
                }
            );

        } catch (erro) {

            return next(erro);
        }
    }

};

module.exports = ProdutoController;