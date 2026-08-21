const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario');

const AuthController = {

    exibirCadastro(req, res) {

        if (req.session.usuario) {
            return res.redirect('/');
        }

        return res.render(
            'auth/cadastro',
            {
                titulo: 'Criar conta',
                paginaAtual: '',
                erro: null,
                dados: {
                    nome: '',
                    email: ''
                }
            }
        );
    },

    async cadastrar(req, res, next) {

        try {

            let {
                nome,
                email,
                senha
            } = req.body;

            nome = String(nome || '').trim();

            email = String(email || '')
                .trim()
                .toLowerCase();

            senha = String(senha || '');

            const dados = {
                nome,
                email
            };

            // ============================================
            // CAMPOS OBRIGATÓRIOS
            // ============================================

            if (!nome || !email || !senha) {

                return res.status(400).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'Preencha todos os campos.',
                        dados
                    }
                );

            }

            // ============================================
            // NOME
            // ============================================

            if (nome.length < 3) {

                return res.status(400).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'Informe seu nome completo.',
                        dados
                    }
                );

            }

            // ============================================
            // E-MAIL
            // ============================================

            const emailValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailValido.test(email)) {

                return res.status(400).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'Informe um e-mail válido.',
                        dados
                    }
                );

            }

            // ============================================
            // SENHA
            // ============================================

            if (senha.length < 6) {

                return res.status(400).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'A senha precisa ter pelo menos 6 caracteres.',
                        dados
                    }
                );

            }

            // ============================================
            // VERIFICAR E-MAIL DUPLICADO
            // ============================================

            const existe =
                await Usuario.emailExiste(email);

            if (existe) {

                return res.status(409).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'Já existe uma conta cadastrada com este e-mail.',
                        dados
                    }
                );

            }

            // ============================================
            // CRIPTOGRAFAR A SENHA
            // ============================================

            const senhaCriptografada =
                await bcrypt.hash(
                    senha,
                    10
                );

            // ============================================
            // CADASTRAR
            // ============================================

            await Usuario.criar({
                nome,
                email,
                senha: senhaCriptografada
            });

            return res.redirect(
                '/login?cadastro=sucesso'
            );

        } catch (erro) {

            if (erro.code === 'ER_DUP_ENTRY') {

                return res.status(409).render(
                    'auth/cadastro',
                    {
                        titulo: 'Criar conta',
                        paginaAtual: '',
                        erro: 'Já existe uma conta cadastrada com este e-mail.',
                        dados: {
                            nome:
                                String(
                                    req.body.nome || ''
                                ).trim(),

                            email:
                                String(
                                    req.body.email || ''
                                )
                                    .trim()
                                    .toLowerCase()
                        }
                    }
                );

            }

            return next(erro);
        }
    },

    exibirLogin(req, res) {

        if (req.session.usuario) {

            if (
                req.session.usuario.tipo ===
                'Administrador'
            ) {
                return res.redirect('/admin');
            }

            return res.redirect('/');
        }

        const sucesso =
            req.query.cadastro === 'sucesso'
                ? 'Conta criada com sucesso! Agora faça seu login.'
                : null;

        return res.render(
            'auth/login',
            {
                titulo: 'Entrar',
                paginaAtual: '',
                erro: null,
                sucesso,
                dados: {
                    email: ''
                }
            }
        );
    },

    async login(req, res, next) {

        try {

            let {
                email,
                senha
            } = req.body;

            email = String(email || '')
                .trim()
                .toLowerCase();

            senha = String(senha || '');

            const dados = {
                email
            };

            if (!email || !senha) {

                return res.status(400).render(
                    'auth/login',
                    {
                        titulo: 'Entrar',
                        paginaAtual: '',
                        erro: 'Informe seu e-mail e sua senha.',
                        sucesso: null,
                        dados
                    }
                );

            }

            const usuario =
                await Usuario.buscarPorEmail(
                    email
                );

            if (!usuario) {

                return res.status(401).render(
                    'auth/login',
                    {
                        titulo: 'Entrar',
                        paginaAtual: '',
                        erro: 'E-mail ou senha incorretos.',
                        sucesso: null,
                        dados
                    }
                );

            }

            if (usuario.status !== 'Ativo') {

                return res.status(403).render(
                    'auth/login',
                    {
                        titulo: 'Entrar',
                        paginaAtual: '',
                        erro: 'Esta conta está inativa.',
                        sucesso: null,
                        dados
                    }
                );

            }

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

            if (!senhaCorreta) {

                return res.status(401).render(
                    'auth/login',
                    {
                        titulo: 'Entrar',
                        paginaAtual: '',
                        erro: 'E-mail ou senha incorretos.',
                        sucesso: null,
                        dados
                    }
                );

            }

            // ============================================
            // CRIAR NOVA SESSÃO
            // ============================================

            req.session.regenerate(
                (erroSessao) => {

                    if (erroSessao) {
                        return next(
                            erroSessao
                        );
                    }

                    req.session.usuario = {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        tipo: usuario.tipo
                    };

                    req.session.save(
                        (erroSalvar) => {

                            if (erroSalvar) {
                                return next(
                                    erroSalvar
                                );
                            }

                            if (
                                usuario.tipo ===
                                'Administrador'
                            ) {
                                return res.redirect(
                                    '/admin'
                                );
                            }

                            return res.redirect('/');
                        }
                    );

                }
            );

        } catch (erro) {

            return next(erro);
        }
    },

    logout(req, res, next) {

        req.session.destroy(
            (erro) => {

                if (erro) {
                    return next(erro);
                }

                res.clearCookie(
                    'manto10.sid'
                );

                return res.redirect(
                    '/login'
                );

            }
        );
    }

};

module.exports = AuthController;