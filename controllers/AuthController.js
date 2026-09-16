const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Normaliza o celular brasileiro para o padrão internacional.
// Exemplo: (45) 99999-9999 -> 5545999999999.
function normalizarTelefone(telefone) {
    let numeros = String(telefone || '').replace(/\D/g, '');

    // Aceita também números digitados com o código do Brasil.
    if (numeros.startsWith('55') && numeros.length === 13) {
        numeros = numeros.slice(2);
    }

    // Valida DDD + celular iniciado por 9.
    if (!/^[1-9]{2}9\d{8}$/.test(numeros)) {
        return null;
    }

    return `55${numeros}`;
}

// Centraliza a renderização de erros do cadastro.
function renderizarCadastro(res, erro, dados, status = 400) {
    return res.status(status).render('auth/cadastro', {
        titulo: 'Criar conta',
        paginaAtual: '',
        erro,
        dados
    });
}

// Centraliza a renderização de erros do login.
function renderizarLogin(res, erro, dados, status = 400) {
    return res.status(status).render('auth/login', {
        titulo: 'Entrar',
        paginaAtual: '',
        erro,
        sucesso: null,
        dados
    });
}

// ======================================================
// CONTROLLER DE AUTENTICAÇÃO
// ======================================================

const AuthController = {

    // Exibe o formulário de cadastro somente para usuários não autenticados.
    exibirCadastro(req, res) {
        if (req.session.usuario) {
            return res.redirect('/');
        }

        return res.render('auth/cadastro', {
            titulo: 'Criar conta',
            paginaAtual: '',
            erro: null,
            dados: {
                nome: '',
                email: '',
                telefone: ''
            }
        });
    },

    // ==================================================
    // CADASTRO
    // ==================================================

    async cadastrar(req, res, next) {
        try {
            let { nome, email, telefone, senha } = req.body;

            nome = String(nome || '').trim();
            email = String(email || '').trim().toLowerCase();
            telefone = String(telefone || '').trim();
            senha = String(senha || '');

            // Mantém os dados preenchidos caso seja necessário exibir um erro.
            const dados = { nome, email, telefone };

            // Todos os campos são obrigatórios para novos clientes.
            if (!nome || !email || !telefone || !senha) {
                return renderizarCadastro(
                    res,
                    'Preencha todos os campos.',
                    dados
                );
            }

            if (nome.length < 3) {
                return renderizarCadastro(
                    res,
                    'Informe seu nome completo.',
                    dados
                );
            }

            // Verifica se o endereço de e-mail possui um formato básico válido.
            const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailValido.test(email)) {
                return renderizarCadastro(
                    res,
                    'Informe um e-mail válido.',
                    dados
                );
            }

            // O telefone é salvo normalizado para facilitar integrações como WhatsApp.
            const telefoneNormalizado = normalizarTelefone(telefone);

            if (!telefoneNormalizado) {
                return renderizarCadastro(
                    res,
                    'Informe um celular válido com DDD.',
                    dados
                );
            }

            if (senha.length < 6) {
                return renderizarCadastro(
                    res,
                    'A senha precisa ter pelo menos 6 caracteres.',
                    dados
                );
            }

            // Impede duas contas com o mesmo e-mail.
            const emailJaCadastrado = await Usuario.emailExiste(email);

            if (emailJaCadastrado) {
                return renderizarCadastro(
                    res,
                    'Já existe uma conta cadastrada com este e-mail.',
                    dados,
                    409
                );
            }

            // A senha nunca é armazenada em texto puro.
            const senhaCriptografada = await bcrypt.hash(senha, 10);

            await Usuario.criar({
                nome,
                email,
                telefone: telefoneNormalizado,
                senha: senhaCriptografada
            });

            return res.redirect('/login?cadastro=sucesso');
        } catch (erro) {
            // Proteção adicional caso duas requisições tentem usar o mesmo e-mail.
            if (erro.code === 'ER_DUP_ENTRY') {
                const dados = {
                    nome: String(req.body.nome || '').trim(),
                    email: String(req.body.email || '').trim().toLowerCase(),
                    telefone: String(req.body.telefone || '').trim()
                };

                return renderizarCadastro(
                    res,
                    'Já existe uma conta cadastrada com este e-mail.',
                    dados,
                    409
                );
            }

            return next(erro);
        }
    },

    // ==================================================
    // LOGIN
    // ==================================================

    exibirLogin(req, res) {
        // Usuários que já possuem sessão não precisam acessar o login novamente.
        if (req.session.usuario) {
            if (req.session.usuario.tipo === 'Administrador') {
                return res.redirect('/admin');
            }

            return res.redirect('/');
        }

        const sucesso = req.query.cadastro === 'sucesso'
            ? 'Conta criada com sucesso! Agora faça seu login.'
            : null;

        return res.render('auth/login', {
            titulo: 'Entrar',
            paginaAtual: '',
            erro: null,
            sucesso,
            dados: { email: '' }
        });
    },

    async login(req, res, next) {
        try {
            let { email, senha } = req.body;

            email = String(email || '').trim().toLowerCase();
            senha = String(senha || '');

            const dados = { email };

            if (!email || !senha) {
                return renderizarLogin(
                    res,
                    'Informe seu e-mail e sua senha.',
                    dados
                );
            }

            const usuario = await Usuario.buscarPorEmail(email);

            // A mesma mensagem é usada para e-mail ou senha incorretos por segurança.
            if (!usuario) {
                return renderizarLogin(
                    res,
                    'E-mail ou senha incorretos.',
                    dados,
                    401
                );
            }

            if (usuario.status !== 'Ativo') {
                return renderizarLogin(
                    res,
                    'Esta conta está inativa.',
                    dados,
                    403
                );
            }

            // Compara a senha informada com o hash armazenado no banco.
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

            if (!senhaCorreta) {
                return renderizarLogin(
                    res,
                    'E-mail ou senha incorretos.',
                    dados,
                    401
                );
            }

            // Regenera a sessão para evitar reutilização de uma sessão anterior.
            req.session.regenerate((erroSessao) => {
                if (erroSessao) {
                    return next(erroSessao);
                }

                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    tipo: usuario.tipo
                };

                // Garante que a sessão seja salva antes do redirecionamento.
                req.session.save((erroSalvar) => {
                    if (erroSalvar) {
                        return next(erroSalvar);
                    }

                    return usuario.tipo === 'Administrador'
                        ? res.redirect('/admin')
                        : res.redirect('/');
                });
            });
        } catch (erro) {
            return next(erro);
        }
    },

    // ==================================================
    // LOGOUT
    // ==================================================

    logout(req, res, next) {
        // Destrói a sessão atual e remove o cookie de autenticação.
        req.session.destroy((erro) => {
            if (erro) {
                return next(erro);
            }

            res.clearCookie('manto10.sid');
            return res.redirect('/login');
        });
    }
};

module.exports = AuthController;