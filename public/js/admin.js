// ============================================================
// MENU RESPONSIVO DO PAINEL ADMINISTRATIVO
// ============================================================

(() => {
    const botao = document.getElementById('adminMenuMobile');
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('adminSidebarOverlay');

    if (!botao || !sidebar || !overlay) {
        return;
    }

    function definirMenu(aberto) {
        sidebar.classList.toggle('aberta', aberto);
        overlay.classList.toggle('visivel', aberto);
        document.body.classList.toggle('admin-menu-aberto', aberto);

        botao.classList.toggle('ativo', aberto);
        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute(
            'aria-label',
            aberto
                ? 'Fechar menu administrativo'
                : 'Abrir menu administrativo'
        );
    }

    botao.addEventListener('click', () => {
        definirMenu(!sidebar.classList.contains('aberta'));
    });

    overlay.addEventListener('click', () => {
        definirMenu(false);
    });

    sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 760) {
                definirMenu(false);
            }
        });
    });

    document.addEventListener('keydown', (evento) => {
        if (
            evento.key === 'Escape' &&
            sidebar.classList.contains('aberta')
        ) {
            definirMenu(false);
            botao.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) {
            definirMenu(false);
        }
    });
})();

// ============================================================
// CAMPOS DE UPLOAD DE IMAGEM
// ============================================================

(() => {
    const campos = document.querySelectorAll('[data-upload-input]');

    campos.forEach((input) => {
        const container = input.closest('.admin-upload');
        const nomeArquivo = container?.querySelector('[data-upload-nome]');

        if (!nomeArquivo) {
            return;
        }

        input.addEventListener('change', () => {
            const arquivo = input.files?.[0];

            nomeArquivo.textContent = arquivo
                ? arquivo.name
                : 'Nenhuma imagem selecionada';
        });
    });
})();
