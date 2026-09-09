const bcrypt =
    require('bcryptjs');

const Usuario =
    require('../models/Usuario');


// ======================================================
// NORMALIZAR CELULAR
// ======================================================

function normalizarTelefone(
    telefone
) {

    let numeros =
        String(
            telefone || ''
        )
            .replace(
                /\D/g,
                ''
            );


    /*
     * Caso o usuário informe:
     *
     * +55 (45) 99999-9999
     *
     * removemos o 55 antes
     * da validação nacional.
     */

    if (
        numeros.startsWith('55') &&
        numeros.length === 13
    ) {

        numeros =
            numeros.slice(2);
    }


    /*
     * Celular brasileiro:
     *
     * DDD + 9 dígitos
     *
     * Exemplo:
     * 45 99999 9999
     */

    if (
        !/^[1-9]{2}9\d{8}$/
            .test(numeros)
    ) {

        return null;
    }


    /*
     * O banco armazena no padrão
     * internacional, preparado
     * para futura integração
     * com WhatsApp.
     */

    return `55${numeros}`;
}


// ======================================================
// CONTROLLER
// ======================================================

const AuthController = {

    // ==================================================
    // EXIBIR CADASTRO
    // ==================================================

    exibirCadastro(
        req,
        res
    ) {

        if (
            req.session.usuario
        ) {

            return res.redirect('/');
        }


        return res.render(
            'auth/cadastro',
            {

                titulo:
                    'Criar conta',

                paginaAtual:
                    '',

                erro:
                    null,

                dados: {

                    nome:
                        '',

                    email:
                        '',

                    telefone:
                        ''
                }
            }
        );
    },


    // ==================================================
    // CADASTRAR
    // ==================================================

    async cadastrar(
        req,
        res,
        next
    ) {

        try {

            let {
                nome,
                email,
                telefone,
                senha
            } =
                req.body;


            nome =
                String(
                    nome || ''
                ).trim();


            email =
                String(
                    email || ''
                )
                    .trim()
                    .toLowerCase();


            const telefoneDigitado =
                String(
                    telefone || ''
                ).trim();


            senha =
                String(
                    senha || ''
                );


            const dados = {

                nome,

                email,

                telefone:
                    telefoneDigitado
            };


            // ============================================
            // CAMPOS OBRIGATÓRIOS
            // ============================================

            if (
                !nome ||
                !email ||
                !telefoneDigitado ||
                !senha
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Preencha todos os campos.',

                            dados
                        }
                    );
            }


            // ============================================
            // NOME
            // ============================================

            if (
                nome.length < 3
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Informe seu nome completo.',

                            dados
                        }
                    );
            }


            // ============================================
            // E-MAIL
            // ============================================

            const emailValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailValido
                    .test(email)
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Informe um e-mail válido.',

                            dados
                        }
                    );
            }


            // ============================================
            // TELEFONE / WHATSAPP
            // ============================================

            const telefoneNormalizado =
                normalizarTelefone(
                    telefoneDigitado
                );


            if (
                !telefoneNormalizado
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Informe um celular válido com DDD.',

                            dados
                        }
                    );
            }


            // ============================================
            // SENHA
            // ============================================

            if (
                senha.length < 6
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'A senha precisa ter pelo menos 6 caracteres.',

                            dados
                        }
                    );
            }


            // ============================================
            // VERIFICAR E-MAIL DUPLICADO
            // ============================================

            const existe =
                await Usuario
                    .emailExiste(
                        email
                    );


            if (existe) {

                return res
                    .status(409)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Já existe uma conta cadastrada com este e-mail.',

                            dados
                        }
                    );
            }


            // ============================================
            // CRIPTOGRAFAR SENHA
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

                telefone:
                    telefoneNormalizado,

                senha:
                    senhaCriptografada

            });


            return res.redirect(
                '/login?cadastro=sucesso'
            );


        } catch (erro) {

            if (
                erro.code ===
                'ER_DUP_ENTRY'
            ) {

                return res
                    .status(409)
                    .render(
                        'auth/cadastro',
                        {

                            titulo:
                                'Criar conta',

                            paginaAtual:
                                '',

                            erro:
                                'Já existe uma conta cadastrada com este e-mail.',

                            dados: {

                                nome:
                                    String(
                                        req.body.nome ||
                                        ''
                                    ).trim(),

                                email:
                                    String(
                                        req.body.email ||
                                        ''
                                    )
                                        .trim()
                                        .toLowerCase(),

                                telefone:
                                    String(
                                        req.body.telefone ||
                                        ''
                                    ).trim()
                            }
                        }
                    );
            }


            return next(erro);
        }
    },


    // ==================================================
    // EXIBIR LOGIN
    // ==================================================

    exibirLogin(
        req,
        res
    ) {

        if (
            req.session.usuario
        ) {

            if (
                req.session.usuario.tipo ===
                'Administrador'
            ) {

                return res.redirect(
                    '/admin'
                );
            }


            return res.redirect('/');
        }


        const sucesso =
            req.query.cadastro ===
            'sucesso'

                ? 'Conta criada com sucesso! Agora faça seu login.'

                : null;


        return res.render(
            'auth/login',
            {

                titulo:
                    'Entrar',

                paginaAtual:
                    '',

                erro:
                    null,

                sucesso,

                dados: {
                    email: ''
                }
            }
        );
    },


    // ==================================================
    // LOGIN
    // ==================================================

    async login(
        req,
        res,
        next
    ) {

        try {

            let {
                email,
                senha
            } =
                req.body;


            email =
                String(
                    email || ''
                )
                    .trim()
                    .toLowerCase();


            senha =
                String(
                    senha || ''
                );


            const dados = {
                email
            };


            if (
                !email ||
                !senha
            ) {

                return res
                    .status(400)
                    .render(
                        'auth/login',
                        {

                            titulo:
                                'Entrar',

                            paginaAtual:
                                '',

                            erro:
                                'Informe seu e-mail e sua senha.',

                            sucesso:
                                null,

                            dados
                        }
                    );
            }


            const usuario =
                await Usuario
                    .buscarPorEmail(
                        email
                    );


            if (!usuario) {

                return res
                    .status(401)
                    .render(
                        'auth/login',
                        {

                            titulo:
                                'Entrar',

                            paginaAtual:
                                '',

                            erro:
                                'E-mail ou senha incorretos.',

                            sucesso:
                                null,

                            dados
                        }
                    );
            }


            if (
                usuario.status !==
                'Ativo'
            ) {

                return res
                    .status(403)
                    .render(
                        'auth/login',
                        {

                            titulo:
                                'Entrar',

                            paginaAtual:
                                '',

                            erro:
                                'Esta conta está inativa.',

                            sucesso:
                                null,

                            dados
                        }
                    );
            }


            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );


            if (
                !senhaCorreta
            ) {

                return res
                    .status(401)
                    .render(
                        'auth/login',
                        {

                            titulo:
                                'Entrar',

                            paginaAtual:
                                '',

                            erro:
                                'E-mail ou senha incorretos.',

                            sucesso:
                                null,

                            dados
                        }
                    );
            }


            // ============================================
            // CRIAR NOVA SESSÃO
            // ============================================

            req.session.regenerate(
                (
                    erroSessao
                ) => {

                    if (
                        erroSessao
                    ) {

                        return next(
                            erroSessao
                        );
                    }


                    req.session.usuario = {

                        id:
                            usuario.id,

                        nome:
                            usuario.nome,

                        email:
                            usuario.email,

                        telefone:
                            usuario.telefone,

                        tipo:
                            usuario.tipo

                    };


                    req.session.save(
                        (
                            erroSalvar
                        ) => {

                            if (
                                erroSalvar
                            ) {

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


                            return res.redirect(
                                '/'
                            );
                        }
                    );
                }
            );


        } catch (erro) {

            return next(erro);
        }
    },


    // ==================================================
    // LOGOUT
    // ==================================================

    logout(
        req,
        res,
        next
    ) {

        req.session.destroy(
            (
                erro
            ) => {

                if (erro) {

                    return next(
                        erro
                    );
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


module.exports =
    AuthController;