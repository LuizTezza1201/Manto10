// ============================================================
// MANTO 10 - ACESSIBILIDADE E COOKIES
// ============================================================

(() => {
    'use strict';

    const CHAVE_ACESSIBILIDADE =
        'manto10_acessibilidade';

    const CHAVE_COOKIES =
        'manto10_cookies';

    const estadoPadrao = {
        zoom: 100,
        contraste: false,
        links: false,
        reduzirMovimento: false
    };

    const botaoAcessibilidade =
        document.getElementById('botaoAcessibilidade');

    const painelAcessibilidade =
        document.getElementById('painelAcessibilidade');

    // Se a página não possui os recursos públicos,
    // encerra o script sem causar erros.
    if (!botaoAcessibilidade || !painelAcessibilidade) {
        return;
    }

    const fecharAcessibilidade =
        document.getElementById('fecharAcessibilidade');

    const diminuirFonte =
        document.getElementById('diminuirFonte');

    const aumentarFonte =
        document.getElementById('aumentarFonte');

    const percentualFonte =
        document.getElementById('percentualFonte');

    const alternarContraste =
        document.getElementById('alternarContraste');

    const alternarLinks =
        document.getElementById('alternarLinks');

    const alternarMovimento =
        document.getElementById('alternarMovimento');

    const restaurarAcessibilidade =
        document.getElementById('restaurarAcessibilidade');

    const avisoAcessibilidade =
        document.getElementById('avisoAcessibilidade');

    const cookiesBanner =
        document.getElementById('cookiesBanner');

    const cookiesAceitar =
        document.getElementById('cookiesAceitar');

    const cookiesNecessarios =
        document.getElementById('cookiesNecessarios');

    const abrirCookies =
        document.getElementById('abrirCookies');


    // ========================================================
    // ARMAZENAMENTO LOCAL
    // ========================================================

    function lerLocalStorage(chave) {
        try {
            return localStorage.getItem(chave);
        } catch {
            return null;
        }
    }

    function salvarLocalStorage(chave, valor) {
        try {
            localStorage.setItem(chave, valor);
        } catch {
            // O site continua funcionando caso o navegador
            // bloqueie o armazenamento local.
        }
    }


    // ========================================================
    // ESTADO DE ACESSIBILIDADE
    // ========================================================

    function carregarEstado() {
        const salvo =
            lerLocalStorage(CHAVE_ACESSIBILIDADE);

        if (!salvo) {
            return { ...estadoPadrao };
        }

        try {
            return {
                ...estadoPadrao,
                ...JSON.parse(salvo)
            };
        } catch {
            return { ...estadoPadrao };
        }
    }

    let estado = carregarEstado();

    function anunciar(mensagem) {
        if (!avisoAcessibilidade) {
            return;
        }

        avisoAcessibilidade.textContent = '';

        window.setTimeout(() => {
            avisoAcessibilidade.textContent = mensagem;
        }, 10);
    }

    function salvarEstado() {
        salvarLocalStorage(
            CHAVE_ACESSIBILIDADE,
            JSON.stringify(estado)
        );
    }

    function aplicarEstado() {
        const html = document.documentElement;

        // O zoom é limitado para manter a responsividade
        // do site em desktop e dispositivos móveis.
        const zoomSeguro = Math.min(
            120,
            Math.max(90, Number(estado.zoom) || 100)
        );

        estado.zoom = zoomSeguro;

        html.style.zoom = `${zoomSeguro}%`;

        html.classList.toggle(
            'a11y-contraste',
            Boolean(estado.contraste)
        );

        html.classList.toggle(
            'a11y-links',
            Boolean(estado.links)
        );

        html.classList.toggle(
            'a11y-reduzir-movimento',
            Boolean(estado.reduzirMovimento)
        );

        percentualFonte.textContent =
            `${zoomSeguro}%`;

        alternarContraste.setAttribute(
            'aria-pressed',
            String(Boolean(estado.contraste))
        );

        alternarLinks.setAttribute(
            'aria-pressed',
            String(Boolean(estado.links))
        );

        alternarMovimento.setAttribute(
            'aria-pressed',
            String(Boolean(estado.reduzirMovimento))
        );
    }

    function atualizarEstado(mensagem) {
        aplicarEstado();
        salvarEstado();
        anunciar(mensagem);
    }


    // ========================================================
    // ABRIR E FECHAR PAINEL
    // ========================================================

    function abrirPainel() {
        painelAcessibilidade.hidden = false;

        botaoAcessibilidade.setAttribute(
            'aria-expanded',
            'true'
        );

        fecharAcessibilidade.focus();
    }

    function fecharPainel() {
        painelAcessibilidade.hidden = true;

        botaoAcessibilidade.setAttribute(
            'aria-expanded',
            'false'
        );
    }

    botaoAcessibilidade.addEventListener(
        'click',
        () => {
            if (painelAcessibilidade.hidden) {
                abrirPainel();
            } else {
                fecharPainel();
            }
        }
    );

    fecharAcessibilidade.addEventListener(
        'click',
        () => {
            fecharPainel();
            botaoAcessibilidade.focus();
        }
    );

    document.addEventListener(
        'keydown',
        (evento) => {
            if (
                evento.key === 'Escape' &&
                !painelAcessibilidade.hidden
            ) {
                fecharPainel();
                botaoAcessibilidade.focus();
            }
        }
    );


    // ========================================================
    // CONTROLES DE ACESSIBILIDADE
    // ========================================================

    diminuirFonte.addEventListener(
        'click',
        () => {
            estado.zoom = Math.max(
                90,
                estado.zoom - 10
            );

            atualizarEstado(
                `Tamanho da página ajustado para ${estado.zoom}%.`
            );
        }
    );

    aumentarFonte.addEventListener(
        'click',
        () => {
            estado.zoom = Math.min(
                120,
                estado.zoom + 10
            );

            atualizarEstado(
                `Tamanho da página ajustado para ${estado.zoom}%.`
            );
        }
    );

    alternarContraste.addEventListener(
        'click',
        () => {
            estado.contraste =
                !estado.contraste;

            atualizarEstado(
                estado.contraste
                    ? 'Alto contraste ativado.'
                    : 'Alto contraste desativado.'
            );
        }
    );

    alternarLinks.addEventListener(
        'click',
        () => {
            estado.links =
                !estado.links;

            atualizarEstado(
                estado.links
                    ? 'Destaque de links ativado.'
                    : 'Destaque de links desativado.'
            );
        }
    );

    alternarMovimento.addEventListener(
        'click',
        () => {
            estado.reduzirMovimento =
                !estado.reduzirMovimento;

            atualizarEstado(
                estado.reduzirMovimento
                    ? 'Redução de animações ativada.'
                    : 'Redução de animações desativada.'
            );
        }
    );

    restaurarAcessibilidade.addEventListener(
        'click',
        () => {
            estado = { ...estadoPadrao };

            atualizarEstado(
                'Preferências de acessibilidade restauradas.'
            );
        }
    );


    // ========================================================
    // COOKIES
    // ========================================================

    function exibirCookies() {
        if (!cookiesBanner) {
            return;
        }

        cookiesBanner.hidden = false;
        document.body.classList.add(
            'cookies-banner-visivel'
        );
    }

    function ocultarCookies() {
        if (!cookiesBanner) {
            return;
        }

        cookiesBanner.hidden = true;
        document.body.classList.remove(
            'cookies-banner-visivel'
        );
    }

    function salvarPreferenciaCookies(valor) {
        salvarLocalStorage(
            CHAVE_COOKIES,
            valor
        );

        ocultarCookies();
    }

    if (!lerLocalStorage(CHAVE_COOKIES)) {
        exibirCookies();
    }

    if (cookiesAceitar) {
        cookiesAceitar.addEventListener(
            'click',
            () => {
                salvarPreferenciaCookies('aceitos');
            }
        );
    }

    if (cookiesNecessarios) {
        cookiesNecessarios.addEventListener(
            'click',
            () => {
                salvarPreferenciaCookies('necessarios');
            }
        );
    }

    if (abrirCookies) {
        abrirCookies.addEventListener(
            'click',
            () => {
                exibirCookies();

                if (cookiesAceitar) {
                    cookiesAceitar.focus();
                }
            }
        );
    }


    // Aplica as preferências salvas assim que a página carrega.
    aplicarEstado();
})();
