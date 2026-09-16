document.addEventListener(
    'DOMContentLoaded',
    () => {

        const botaoAbrir =
            document.getElementById(
                'botaoCarrinhoTopo'
            );

        const lateral =
            document.getElementById(
                'carrinhoLateral'
            );

        const overlay =
            document.getElementById(
                'carrinhoOverlay'
            );

        const botaoFechar =
            document.getElementById(
                'fecharCarrinho'
            );

        const conteudo =
            document.getElementById(
                'carrinhoLateralConteudo'
            );

        const contador =
            document.querySelector(
                '.contador-carrinho'
            );

        const formularioProduto =
            document.getElementById(
                'formAdicionarCarrinho'
            );

        const mensagemProduto =
            document.getElementById(
                'mensagemProduto'
            );

        // ==================================================
        // SEGURANÇA AO INSERIR TEXTOS NO HTML
        // ==================================================

        function escaparHtml(valor) {

            return String(
                valor ?? ''
            ).replace(
                /[&<>"']/g,
                (caractere) => {

                    const mapa = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#039;'
                    };

                    return mapa[
                        caractere
                    ];
                }
            );
        }

        // ==================================================
        // ABRIR
        // ==================================================

        function abrirCarrinho() {

            if (!lateral || !overlay) {
                return;
            }

            lateral.classList.add(
                'ativo'
            );

            overlay.classList.add(
                'ativo'
            );

            lateral.setAttribute(
                'aria-hidden',
                'false'
            );

            document.body.classList.add(
                'carrinho-aberto'
            );
        }

        // ==================================================
        // FECHAR
        // ==================================================

        function fecharCarrinho() {

            if (!lateral || !overlay) {
                return;
            }

            lateral.classList.remove(
                'ativo'
            );

            overlay.classList.remove(
                'ativo'
            );

            lateral.setAttribute(
                'aria-hidden',
                'true'
            );

            document.body.classList.remove(
                'carrinho-aberto'
            );
        }

        // ==================================================
        // CONTADOR
        // ==================================================

        function atualizarContador(
            quantidade
        ) {

            if (!contador) {
                return;
            }

            contador.textContent =
                Number(
                    quantidade || 0
                );
        }

        // ==================================================
        // RENDERIZAR
        // ==================================================

        function renderizarCarrinho(
            carrinho
        ) {

            atualizarContador(
                carrinho.quantidade
            );

            if (!conteudo) {
                return;
            }

            if (
                !carrinho.autenticado
            ) {

                conteudo.innerHTML = `
                    <div class="carrinho-vazio">

                        <strong>
                            Entre na sua conta
                        </strong>

                        <p>
                            Faça login para utilizar
                            o carrinho da Manto 10.
                        </p>

                        <a href="/login">
                            Entrar
                        </a>

                    </div>
                `;

                return;
            }

            if (
                carrinho.itens.length ===
                0
            ) {

                conteudo.innerHTML = `
                    <div class="carrinho-vazio">

                        <strong>
                            Seu carrinho está vazio
                        </strong>

                        <p>
                            Escolha uma camisa para
                            começar sua compra.
                        </p>

                        <a href="/camisas">
                            Ver camisas
                        </a>

                    </div>
                `;

                return;
            }

            const itensHtml =
                carrinho.itens
                    .map(
                        (item) => {

                            const diminuirDesabilitado =
                                item.quantidade <= 1
                                    ? 'disabled'
                                    : '';

                            const aumentarDesabilitado =
                                item.quantidade >=
                                item.estoque
                                    ? 'disabled'
                                    : '';

                            return `
                                <article
                                    class="carrinho-item"
                                >

                                    <a
                                        href="/produto/${encodeURIComponent(item.slug)}"
                                        class="carrinho-item-imagem"
                                    >

                                        <img
                                            src="${escaparHtml(item.imagem)}"
                                            alt="${escaparHtml(item.nome)}"
                                            onerror="this.onerror=null;this.src='/images/produtos/placeholder.svg';"
                                        >

                                    </a>

                                    <div
                                        class="carrinho-item-info"
                                    >

                                        <span
                                            class="carrinho-item-tipo"
                                        >
                                            ${escaparHtml(item.tipoCamisa)}
                                        </span>

                                        <h3>
                                            ${escaparHtml(item.nome)}
                                        </h3>

                                        <span
                                            class="carrinho-item-tamanho"
                                        >
                                            Tamanho:
                                            ${escaparHtml(item.tamanho)}
                                        </span>

                                        ${item.preferenciaBox ? `
                                            <span class="carrinho-item-tamanho">
                                                Preferência:
                                                ${escaparHtml(item.preferenciaBox)}
                                            </span>
                                        ` : ''}

                                        <div
                                            class="carrinho-item-rodape"
                                        >

                                            <div
                                                class="carrinho-controle"
                                            >

                                                <button
                                                    type="button"
                                                    data-acao="diminuir"
                                                    data-item-id="${item.itemId}"
                                                    data-quantidade="${item.quantidade}"
                                                    data-estoque="${item.estoque}"
                                                    ${diminuirDesabilitado}
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    ${item.quantidade}
                                                </span>

                                                <button
                                                    type="button"
                                                    data-acao="aumentar"
                                                    data-item-id="${item.itemId}"
                                                    data-quantidade="${item.quantidade}"
                                                    data-estoque="${item.estoque}"
                                                    ${aumentarDesabilitado}
                                                >
                                                    +
                                                </button>

                                            </div>

                                            <strong
                                                class="carrinho-item-preco"
                                            >
                                                ${escaparHtml(item.subtotalFormatado)}
                                            </strong>

                                        </div>

                                        <button
    type="button"
    class="carrinho-remover"
    data-acao="remover"
    data-item-id="${item.itemId}"
    aria-label="Remover produto"
    title="Remover produto"
>
    <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            d="M9 3h6l1 2h4v2H4V5h4l1-2z"
        ></path>
        <path
            d="M6 7h12l-1 13H7L6 7z"
        ></path>
        <path
            d="M10 11v6"
        ></path>
        <path
            d="M14 11v6"
        ></path>
    </svg>
</button>

                                    </div>

                                </article>
                            `;
                        }
                    )
                    .join('');

            conteudo.innerHTML = `

                <div class="carrinho-itens">

                    ${itensHtml}

                </div>

                <div class="carrinho-lateral-resumo">

                    <div class="carrinho-subtotal">

                        <span>
                            Subtotal:
                        </span>

                        <strong>
                            ${escaparHtml(carrinho.subtotalFormatado)}
                        </strong>

                    </div>

                    <div class="carrinho-total">

                        <span>
                            Total:
                        </span>

                        <strong>
                            ${escaparHtml(carrinho.totalFormatado)}
                        </strong>

                    </div>

                    <a
    href="/carrinho"
    class="carrinho-continuar"
>
    Ver carrinho
</a>

                    <button
                        type="button"
                        class="carrinho-voltar"
                        id="fecharCarrinhoInferior"
                    >
                        Fechar carrinho
                    </button>

                </div>
            `;

            const continuar =
    document.getElementById(
        'continuarComprandoLateral'
    );

            const fecharInferior =
                document.getElementById(
                    'fecharCarrinhoInferior'
                );

            if (continuar) {

                continuar.addEventListener(
                    'click',
                    fecharCarrinho
                );
            }

            if (fecharInferior) {

                fecharInferior.addEventListener(
                    'click',
                    fecharCarrinho
                );
            }
        }

        // ==================================================
        // CARREGAR
        // ==================================================

        async function carregarCarrinho() {

            try {

                const resposta =
                    await fetch(
                        '/carrinho/resumo',
                        {
                            headers: {
                                Accept:
                                    'application/json'
                            }
                        }
                    );

                if (!resposta.ok) {
                    return;
                }

                const carrinho =
                    await resposta.json();

                renderizarCarrinho(
                    carrinho
                );

            } catch (erro) {

                console.error(
                    'Erro ao carregar carrinho:',
                    erro
                );
            }
        }

        // ==================================================
        // REQUISIÇÃO
        // ==================================================

        async function enviarJson(
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

            const respostaJson =
                await resposta.json();

            if (
                resposta.status === 401
            ) {

                window.location.href =
                    respostaJson.login ||
                    '/login';

                return null;
            }

            if (!resposta.ok) {

                throw new Error(
                    respostaJson.mensagem ||
                    'Não foi possível atualizar o carrinho.'
                );
            }

            return respostaJson;
        }

        // ==================================================
        // BOTÃO DO TOPO
        // ==================================================

        if (botaoAbrir) {

            botaoAbrir.addEventListener(
                'click',
                async () => {

                    abrirCarrinho();

                    await carregarCarrinho();
                }
            );
        }

        if (botaoFechar) {

            botaoFechar.addEventListener(
                'click',
                fecharCarrinho
            );
        }

        if (overlay) {

            overlay.addEventListener(
                'click',
                fecharCarrinho
            );
        }

        // ==================================================
        // ADICIONAR PRODUTO
        // ==================================================

        if (formularioProduto) {

            formularioProduto.addEventListener(
                'submit',
                async (evento) => {

                    evento.preventDefault();

                    /*
                     * Impede o antigo listener temporário
                     * do main.js de executar.
                     */
                    evento.stopImmediatePropagation();

                    const tamanhoSelecionado =
                        document.querySelector(
                            'input[name="produto_tamanho_id"]:checked'
                        );

                    const inputQuantidade =
                        document.getElementById(
                            'quantidadeProduto'
                        );

                    const preferenciaSelecionada =
                        document.querySelector(
                            'input[name="preferencia_box"]:checked'
                        );

                    const mensagemPreferenciaBox =
                        document.getElementById(
                            'mensagemPreferenciaBox'
                        );

                    const existePreferenciaBox =
                        document.querySelector(
                            'input[name="preferencia_box"]'
                        );

                    const mensagemTamanho =
                        document.getElementById(
                            'mensagemTamanho'
                        );

                    if (!tamanhoSelecionado) {

                        if (mensagemTamanho) {

                            mensagemTamanho.textContent =
                                'Escolha um tamanho antes de continuar.';
                        }

                        return;
                    }

                    if (
                        existePreferenciaBox &&
                        !preferenciaSelecionada
                    ) {
                        if (mensagemPreferenciaBox) {
                            mensagemPreferenciaBox.textContent =
                                'Escolha uma preferência para a Box Misteriosa.';
                        }

                        return;
                    }

                    try {

                        if (mensagemTamanho) {
                            mensagemTamanho.textContent =
                                '';
                        }

                        if (mensagemPreferenciaBox) {
                            mensagemPreferenciaBox.textContent =
                                '';
                        }

                        const resposta =
                            await enviarJson(
                                '/carrinho/adicionar',
                                {
                                    produto_tamanho_id:
                                        Number(
                                            tamanhoSelecionado.value
                                        ),

                                    quantidade:
                                        Number(
                                            inputQuantidade
                                                ? inputQuantidade.value
                                                : 1
                                        ),

                                    preferencia_box:
                                        preferenciaSelecionada
                                            ? preferenciaSelecionada.value
                                            : ''
                                }
                            );

                        if (!resposta) {
                            return;
                        }

                        if (mensagemProduto) {

                            mensagemProduto.textContent =
                                resposta.mensagem;
                        }

                        renderizarCarrinho(
                            resposta.carrinho
                        );

                        abrirCarrinho();

                    } catch (erro) {

                        if (mensagemProduto) {

                            mensagemProduto.textContent =
                                erro.message;
                        }
                    }
                }
            );
        }

        // ==================================================
        // AÇÕES NO CARRINHO
        // ==================================================

        if (conteudo) {

            conteudo.addEventListener(
                'click',
                async (evento) => {

                    const botao =
                        evento.target.closest(
                            '[data-acao]'
                        );

                    if (!botao) {
                        return;
                    }

                    const acao =
                        botao.dataset.acao;

                    const itemId =
                        Number(
                            botao.dataset.itemId
                        );

                    try {

                        if (
                            acao ===
                            'remover'
                        ) {

                            const resposta =
                                await enviarJson(
                                    `/carrinho/item/${itemId}/remover`,
                                    {}
                                );

                            if (resposta) {

                                renderizarCarrinho(
                                    resposta.carrinho
                                );
                            }

                            return;
                        }

                        const quantidadeAtual =
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
                            quantidadeAtual;

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

                        const resposta =
                            await enviarJson(
                                `/carrinho/item/${itemId}/quantidade`,
                                {
                                    quantidade:
                                        novaQuantidade
                                }
                            );

                        if (resposta) {

                            renderizarCarrinho(
                                resposta.carrinho
                            );
                        }

                    } catch (erro) {

                        console.error(
                            erro
                        );
                    }
                }
            );
        }

        // ==================================================
        // ESC
        // ==================================================

        document.addEventListener(
            'keydown',
            (evento) => {

                if (
                    evento.key ===
                    'Escape'
                ) {

                    fecharCarrinho();
                }
            }
        );

        // ==================================================
        // CONTADOR AO ABRIR A PÁGINA
        // ==================================================

        carregarCarrinho();

    }
);