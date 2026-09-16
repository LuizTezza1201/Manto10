const pool = require('../config/database');

const TIPOS_CAMISA = ['Tailandesa', 'Nacional Premium'];
const TAMANHOS_PADRAO = ['P', 'M', 'G', 'GG'];

// Cria erros com status HTTP para o controller tratar corretamente.
function criarErro(mensagem, status) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

const Produto = {
    // ======================================================
    // CATÁLOGO PÚBLICO
    // ======================================================

    // Lista somente produtos ativos e com pelo menos uma unidade disponível.
    async listarCatalogo({ tipo = '', ordem = 'recentes', busca = '', categoria = '', liga = '' } = {}) {
        const filtros = [
            "p.status = 'Ativo'",
            `EXISTS (
                SELECT 1 FROM produto_tamanhos pt_estoque
                WHERE pt_estoque.produto_id = p.id AND pt_estoque.estoque > 0
            )`
        ];
        const parametros = [];

        if (TIPOS_CAMISA.includes(tipo)) {
            filtros.push('p.tipo_camisa = ?');
            parametros.push(tipo);
        }

        // A pesquisa considera os principais dados usados pelo cliente para encontrar uma camisa.
        if (busca) {
            filtros.push(`(
                p.nome LIKE ? OR p.codigo LIKE ? OR p.temporada LIKE ? OR p.tipo_camisa LIKE ?
                OR t.nome LIKE ? OR l.nome LIKE ? OR c.nome LIKE ?
            )`);
            const termo = `%${busca}%`;
            parametros.push(termo, termo, termo, termo, termo, termo, termo);
        }

        if (categoria) {
            filtros.push('c.slug = ?');
            parametros.push(categoria);
        }

        if (liga) {
            filtros.push('l.slug = ?');
            parametros.push(liga);
        }

        // Apenas opções conhecidas entram diretamente no ORDER BY.
        const ordenacoes = {
            recentes: 'p.id DESC',
            az: 'p.nome ASC',
            za: 'p.nome DESC',
            menor_preco: 'COALESCE(p.preco_promocional, p.preco) ASC',
            maior_preco: 'COALESCE(p.preco_promocional, p.preco) DESC'
        };
        const ordemSql = ordenacoes[ordem] || ordenacoes.recentes;
        const whereSql = filtros.join(' AND ');

        const [rows] = await pool.execute(`
            SELECT
                p.id, p.codigo, p.nome, p.slug, p.temporada, p.tipo_camisa,
                p.preco, p.preco_promocional, p.desconto_pix, p.destaque,
                t.nome AS time, l.nome AS liga, l.slug AS liga_slug,
                c.nome AS categoria, c.slug AS categoria_slug,
                (
                    SELECT pi.caminho FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem,
                COALESCE(SUM(pt.estoque), 0) AS estoque_total
            FROM produtos p
            LEFT JOIN times t ON t.id = p.time_id
            LEFT JOIN ligas l ON l.id = t.liga_id
            INNER JOIN categorias c ON c.id = p.categoria_id
            LEFT JOIN produto_tamanhos pt ON pt.produto_id = p.id
            WHERE ${whereSql}
            GROUP BY
                p.id, p.codigo, p.nome, p.slug, p.temporada, p.tipo_camisa,
                p.preco, p.preco_promocional, p.desconto_pix, p.destaque,
                t.nome, l.nome, l.slug, c.nome, c.slug
            ORDER BY ${ordemSql}
        `, parametros);

        return rows;
    },

    // Busca os dados principais usados na página individual do produto.
    async buscarPorSlug(slug) {
        const [rows] = await pool.execute(`
            SELECT
                p.id, p.codigo, p.nome, p.slug, p.temporada, p.descricao,
                p.tipo_camisa, p.preco, p.preco_promocional, p.desconto_pix,
                p.destaque, p.status,
                t.id AS time_id, t.nome AS time,
                l.id AS liga_id, l.nome AS liga,
                c.id AS categoria_id, c.nome AS categoria
            FROM produtos p
            LEFT JOIN times t ON t.id = p.time_id
            LEFT JOIN ligas l ON l.id = t.liga_id
            INNER JOIN categorias c ON c.id = p.categoria_id
            WHERE p.slug = ? AND p.status = 'Ativo'
            LIMIT 1
        `, [slug]);

        return rows[0] || null;
    },

    // Retorna as imagens cadastradas, priorizando a imagem principal.
    async listarImagens(produtoId) {
        const [rows] = await pool.execute(`
            SELECT id, caminho, texto_alternativo, principal, ordem
            FROM produto_imagens
            WHERE produto_id = ?
            ORDER BY principal DESC, ordem ASC, id ASC
        `, [produtoId]);
        return rows;
    },

    // Retorna os tamanhos ativos e o estoque de cada variação do produto.
    async listarTamanhos(produtoId) {
        const [rows] = await pool.execute(`
            SELECT pt.id AS produto_tamanho_id, t.id AS tamanho_id, t.nome AS tamanho, pt.estoque
            FROM produto_tamanhos pt
            INNER JOIN tamanhos t ON t.id = pt.tamanho_id
            WHERE pt.produto_id = ? AND t.status = 'Ativo'
            ORDER BY t.ordem ASC
        `, [produtoId]);
        return rows;
    },

    // ======================================================
    // ADMINISTRAÇÃO DE PRODUTOS
    // ======================================================

    // Lista todos os produtos para o painel, inclusive os inativos ou sem estoque.
    async listarAdmin({ busca = '', tipo = '', status = '', estoque = '', ordem = 'az' } = {}) {
        const filtros = ['1 = 1'];
        const parametros = [];

        if (busca) {
            filtros.push('(p.nome LIKE ? OR p.codigo LIKE ? OR p.temporada LIKE ? OR p.tipo_camisa LIKE ?)');
            const termo = `%${busca}%`;
            parametros.push(termo, termo, termo, termo);
        }

        if (TIPOS_CAMISA.includes(tipo)) {
            filtros.push('p.tipo_camisa = ?');
            parametros.push(tipo);
        }

        if (status === 'Ativo' || status === 'Inativo') {
            filtros.push('p.status = ?');
            parametros.push(status);
        }

        let havingSql = '';
        if (estoque === 'com') havingSql = 'HAVING estoque_total > 0';
        if (estoque === 'sem') havingSql = 'HAVING estoque_total = 0';
        if (estoque === 'baixo') havingSql = 'HAVING estoque_total > 0 AND estoque_total <= 5';

        const ordenacoes = {
            az: 'p.nome ASC',
            za: 'p.nome DESC',
            menor_preco: 'COALESCE(p.preco_promocional, p.preco) ASC',
            maior_preco: 'COALESCE(p.preco_promocional, p.preco) DESC',
            maior_estoque: 'estoque_total DESC, p.nome ASC',
            menor_estoque: 'estoque_total ASC, p.nome ASC'
        };
        const ordemSql = ordenacoes[ordem] || ordenacoes.az;
        const whereSql = filtros.join(' AND ');

        const [rows] = await pool.execute(`
            SELECT
                p.id, p.codigo, p.nome, p.slug, p.temporada, p.tipo_camisa,
                p.preco, p.preco_promocional, p.status,
                (
                    SELECT pi.caminho FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem,
                COALESCE(SUM(pt.estoque), 0) AS estoque_total,
                COALESCE(MAX(CASE WHEN tam.nome = 'P' THEN pt.estoque ELSE 0 END), 0) AS estoque_p,
                COALESCE(MAX(CASE WHEN tam.nome = 'M' THEN pt.estoque ELSE 0 END), 0) AS estoque_m,
                COALESCE(MAX(CASE WHEN tam.nome = 'G' THEN pt.estoque ELSE 0 END), 0) AS estoque_g,
                COALESCE(MAX(CASE WHEN tam.nome = 'GG' THEN pt.estoque ELSE 0 END), 0) AS estoque_gg
            FROM produtos p
            LEFT JOIN produto_tamanhos pt ON pt.produto_id = p.id
            LEFT JOIN tamanhos tam ON tam.id = pt.tamanho_id
            WHERE ${whereSql}
            GROUP BY
                p.id, p.codigo, p.nome, p.slug, p.temporada, p.tipo_camisa,
                p.preco, p.preco_promocional, p.status
            ${havingSql}
            ORDER BY ${ordemSql}
        `, parametros);

        return rows;
    },

    // Atualiza o estoque P, M, G e GG em uma única transação.
    async atualizarEstoqueAdmin({ produtoId, estoques }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Bloqueia o produto durante a alteração para evitar atualizações concorrentes.
            const [produtos] = await connection.execute(`
                SELECT id FROM produtos WHERE id = ? LIMIT 1 FOR UPDATE
            `, [produtoId]);
            if (produtos.length === 0) throw criarErro('Produto não encontrado.', 404);

            const [tamanhos] = await connection.execute(`
                SELECT id, nome FROM tamanhos
                WHERE status = 'Ativo' AND nome IN ('P', 'M', 'G', 'GG')
            `);

            const nomesEncontrados = tamanhos.map((tamanho) => tamanho.nome);
            for (const tamanho of TAMANHOS_PADRAO) {
                if (!nomesEncontrados.includes(tamanho)) {
                    throw new Error(`Tamanho ${tamanho} não encontrado no banco.`);
                }
            }

            for (const tamanho of tamanhos) {
                const quantidade = Number(estoques[tamanho.nome] ?? 0);

                if (!Number.isInteger(quantidade) || quantidade < 0) {
                    throw new Error(`Estoque inválido para tamanho ${tamanho.nome}.`);
                }

                // Verifica se a combinação produto/tamanho já existe antes de atualizar ou criar.
                const [registroExistente] = await connection.execute(`
                    SELECT id FROM produto_tamanhos
                    WHERE produto_id = ? AND tamanho_id = ?
                    LIMIT 1 FOR UPDATE
                `, [produtoId, tamanho.id]);

                if (registroExistente.length > 0) {
                    await connection.execute(
                        'UPDATE produto_tamanhos SET estoque = ? WHERE id = ?',
                        [quantidade, registroExistente[0].id]
                    );
                } else {
                    await connection.execute(
                        'INSERT INTO produto_tamanhos (produto_id, tamanho_id, estoque) VALUES (?, ?, ?)',
                        [produtoId, tamanho.id, quantidade]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    },

    // Retorna um produto para preencher o formulário de edição administrativa.
    async buscarPorIdAdmin(produtoId) {
        const [rows] = await pool.execute(`
            SELECT
                p.id, p.codigo, p.nome, p.slug, p.time_id, p.categoria_id,
                p.temporada, p.descricao, p.tipo_camisa, p.preco,
                p.preco_promocional, p.desconto_pix, p.destaque,
                p.mais_vendido, p.status,
                (
                    SELECT pi.caminho FROM produto_imagens pi
                    WHERE pi.produto_id = p.id
                    ORDER BY pi.principal DESC, pi.ordem ASC, pi.id ASC
                    LIMIT 1
                ) AS imagem
            FROM produtos p
            WHERE p.id = ?
            LIMIT 1
        `, [produtoId]);

        return rows[0] || null;
    },

    // Fornece as categorias disponíveis no formulário administrativo.
    async listarCategoriasAdmin() {
        const [rows] = await pool.execute(`
            SELECT id, nome, status FROM categorias ORDER BY nome ASC
        `);
        return rows;
    },

    // Fornece os times disponíveis no formulário administrativo.
    async listarTimesAdmin() {
        const [rows] = await pool.execute(`
            SELECT id, nome, status FROM times ORDER BY nome ASC
        `);
        return rows;
    },

    // Atualiza os dados gerais da camisa sem alterar seu estoque.
    async atualizarDadosAdmin({
        produtoId, codigo, nome, slug, timeId, categoriaId, temporada, descricao,
        tipoCamisa, preco, precoPromocional, descontoPix, destaque, maisVendido
    }) {
        const [produtoAtual] = await pool.execute(
            'SELECT id FROM produtos WHERE id = ? LIMIT 1',
            [produtoId]
        );
        if (produtoAtual.length === 0) throw criarErro('Produto não encontrado.', 404);

        // Código e slug precisam permanecer únicos entre os produtos.
        const [codigoDuplicado] = await pool.execute(
            'SELECT id FROM produtos WHERE codigo = ? AND id <> ? LIMIT 1',
            [codigo, produtoId]
        );
        if (codigoDuplicado.length > 0) {
            throw criarErro('Já existe outra camisa com esse código.', 400);
        }

        const [slugDuplicado] = await pool.execute(
            'SELECT id FROM produtos WHERE slug = ? AND id <> ? LIMIT 1',
            [slug, produtoId]
        );
        if (slugDuplicado.length > 0) {
            throw criarErro('Já existe outra camisa com esse identificador.', 400);
        }

        await pool.execute(`
            UPDATE produtos SET
                codigo = ?, nome = ?, slug = ?, time_id = ?, categoria_id = ?, temporada = ?,
                descricao = ?, tipo_camisa = ?, preco = ?, preco_promocional = ?, desconto_pix = ?,
                destaque = ?, mais_vendido = ?
            WHERE id = ?
        `, [
            codigo, nome, slug, timeId, categoriaId, temporada, descricao, tipoCamisa,
            preco, precoPromocional, descontoPix, destaque, maisVendido, produtoId
        ]);

        return true;
    },

    // Alterna rapidamente a visibilidade do produto entre Ativo e Inativo.
    async alternarStatusAdmin(produtoId) {
        const [produto] = await pool.execute(
            'SELECT id, status FROM produtos WHERE id = ? LIMIT 1',
            [produtoId]
        );
        if (produto.length === 0) throw criarErro('Produto não encontrado.', 404);

        const novoStatus = produto[0].status === 'Ativo' ? 'Inativo' : 'Ativo';
        await pool.execute(
            'UPDATE produtos SET status = ? WHERE id = ?',
            [novoStatus, produtoId]
        );

        return novoStatus;
    }
};

module.exports = Produto;