document.addEventListener(
    'DOMContentLoaded',
    () => {

        // ==================================================
        // MENU MOBILE
        // ==================================================

        const botaoMenu =
            document.getElementById(
                'botaoMenuMobile'
            );

        const menuPrincipal =
            document.getElementById(
                'menuPrincipal'
            );

        if (
            botaoMenu &&
            menuPrincipal
        ) {

            botaoMenu.addEventListener(
                'click',
                () => {

                    const aberto =
                        menuPrincipal
                            .classList
                            .toggle(
                                'menu-aberto'
                            );

                    botaoMenu
                        .classList
                        .toggle(
                            'ativo',
                            aberto
                        );

                    botaoMenu.setAttribute(
                        'aria-expanded',
                        String(aberto)
                    );

                }
            );

        }

        // ==================================================
        // BANNER
        // ==================================================

        const bannerTrilho =
            document.getElementById(
                'bannerTrilho'
            );

        const bannerAnterior =
            document.getElementById(
                'bannerAnterior'
            );

        const bannerProximo =
            document.getElementById(
                'bannerProximo'
            );

        const indicadores =
            document.querySelectorAll(
                '[data-banner]'
            );

        if (bannerTrilho) {

            const slides =
                bannerTrilho.querySelectorAll(
                    '.banner-slide'
                );

            let indiceBanner = 0;

            let intervaloBanner = null;

            function atualizarBanner() {

                bannerTrilho.style.transform =
                    `translateX(-${indiceBanner * 100}%)`;

                indicadores.forEach(
                    (
                        indicador,
                        indice
                    ) => {

                        indicador.classList.toggle(
                            'ativo',
                            indice === indiceBanner
                        );

                    }
                );

            }

            function proximoBanner() {

                indiceBanner++;

                if (
                    indiceBanner >=
                    slides.length
                ) {

                    indiceBanner = 0;
                }

                atualizarBanner();
            }

            function anteriorBanner() {

                indiceBanner--;

                if (
                    indiceBanner < 0
                ) {

                    indiceBanner =
                        slides.length - 1;
                }

                atualizarBanner();
            }

            function iniciarAutomatico() {

                if (intervaloBanner) {

                    clearInterval(
                        intervaloBanner
                    );
                }

                intervaloBanner =
                    setInterval(
                        proximoBanner,
                        6000
                    );

            }

            if (bannerProximo) {

                bannerProximo.addEventListener(
                    'click',
                    () => {

                        proximoBanner();

                        iniciarAutomatico();
                    }
                );

            }

            if (bannerAnterior) {

                bannerAnterior.addEventListener(
                    'click',
                    () => {

                        anteriorBanner();

                        iniciarAutomatico();
                    }
                );

            }

            indicadores.forEach(
                (indicador) => {

                    indicador.addEventListener(
                        'click',
                        () => {

                            indiceBanner =
                                Number(
                                    indicador.dataset.banner
                                );

                            atualizarBanner();

                            iniciarAutomatico();
                        }
                    );

                }
            );

            atualizarBanner();

            iniciarAutomatico();
        }

        // ==================================================
        // CARROSSEL DAS LIGAS
        // ==================================================

        configurarCarrossel(
            'listaLigas',
            'ligaAnterior',
            'ligaProxima',
            450
        );

        // ==================================================
        // CARROSSEL - TAILANDESAS
        // ==================================================

        configurarCarrossel(
            'listaTailandesasHome',
            'tailandesasAnterior',
            'tailandesasProximo',
            500
        );

        // ==================================================
        // CARROSSEL - NACIONAIS PREMIUM
        // ==================================================

        configurarCarrossel(
            'listaNacionaisHome',
            'nacionaisAnterior',
            'nacionaisProximo',
            500
        );

        // ==================================================
        // PRODUTOS DA HOME
        // ==================================================

        document
            .querySelectorAll(
                '.produto-area-click'
            )
            .forEach(
                (produto) => {

                    produto.addEventListener(
                        'click',
                        () => {

                            const slug =
                                produto.dataset.produto;

                            if (!slug) {
                                return;
                            }

                            window.location.href =
                                `/produto/${encodeURIComponent(slug)}`;

                        }
                    );

                }
            );

        // ==================================================
        // GALERIA DO PRODUTO
        // ==================================================

        const imagemPrincipal =
            document.getElementById(
                'imagemProdutoPrincipal'
            );

        const miniaturas =
            document.querySelectorAll(
                '.produto-miniatura'
            );

        if (
            imagemPrincipal &&
            miniaturas.length > 0
        ) {

            miniaturas.forEach(
                (miniatura) => {

                    miniatura.addEventListener(
                        'click',
                        () => {

                            miniaturas.forEach(
                                (item) => {

                                    item.classList.remove(
                                        'ativo'
                                    );

                                }
                            );

                            miniatura.classList.add(
                                'ativo'
                            );

                            imagemPrincipal.src =
                                miniatura.dataset.imagem;

                            imagemPrincipal.alt =
                                miniatura.dataset.alt ||
                                'Imagem do produto';

                        }
                    );

                }
            );

        }

        // ==================================================
        // TAMANHO E QUANTIDADE
        // ==================================================

        const tamanhos =
            document.querySelectorAll(
                'input[name="produto_tamanho_id"]'
            );

        const inputQuantidade =
            document.getElementById(
                'quantidadeProduto'
            );

        const diminuir =
            document.getElementById(
                'diminuirQuantidade'
            );

        const aumentar =
            document.getElementById(
                'aumentarQuantidade'
            );

        const estoqueSelecionado =
            document.getElementById(
                'estoqueSelecionado'
            );

        const mensagemTamanho =
            document.getElementById(
                'mensagemTamanho'
            );

        let estoqueAtual = 0;

        tamanhos.forEach(
            (tamanho) => {

                tamanho.addEventListener(
                    'change',
                    () => {

                        estoqueAtual =
                            Number(
                                tamanho.dataset.estoque
                            );

                        if (
                            inputQuantidade
                        ) {

                            inputQuantidade.value =
                                1;
                        }

                        if (
                            estoqueSelecionado
                        ) {

                            estoqueSelecionado.textContent =
                                `${estoqueAtual} unidade${
                                    estoqueAtual === 1
                                        ? ''
                                        : 's'
                                } disponível${
                                    estoqueAtual === 1
                                        ? ''
                                        : 'is'
                                }`;

                        }

                        if (
                            mensagemTamanho
                        ) {

                            mensagemTamanho.textContent =
                                '';
                        }

                    }
                );

            }
        );

        if (
            diminuir &&
            inputQuantidade
        ) {

            diminuir.addEventListener(
                'click',
                () => {

                    let quantidade =
                        Number(
                            inputQuantidade.value
                        );

                    if (
                        quantidade > 1
                    ) {

                        quantidade--;

                        inputQuantidade.value =
                            quantidade;
                    }

                }
            );

        }

        if (
            aumentar &&
            inputQuantidade
        ) {

            aumentar.addEventListener(
                'click',
                () => {

                    if (
                        estoqueAtual <= 0
                    ) {

                        if (
                            mensagemTamanho
                        ) {

                            mensagemTamanho.textContent =
                                'Selecione um tamanho disponível.';
                        }

                        return;
                    }

                    let quantidade =
                        Number(
                            inputQuantidade.value
                        );

                    if (
                        quantidade <
                        estoqueAtual
                    ) {

                        quantidade++;

                        inputQuantidade.value =
                            quantidade;
                    }

                }
            );

        }

    }
);

// ======================================================
// CONFIGURAR CARROSSEL
// ======================================================

function configurarCarrossel(
    listaId,
    anteriorId,
    proximoId,
    distancia
) {

    const lista =
        document.getElementById(
            listaId
        );

    const anterior =
        document.getElementById(
            anteriorId
        );

    const proximo =
        document.getElementById(
            proximoId
        );

    if (!lista) {
        return;
    }

    if (anterior) {

        anterior.addEventListener(
            'click',
            () => {

                lista.scrollBy({
                    left: -distancia,
                    behavior: 'smooth'
                });

            }
        );

    }

    if (proximo) {

        proximo.addEventListener(
            'click',
            () => {

                lista.scrollBy({
                    left: distancia,
                    behavior: 'smooth'
                });

            }
        );

    }

}