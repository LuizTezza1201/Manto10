# Manto 10

Sistema web de e-commerce desenvolvido para a loja **Manto 10**, com foco na venda e no gerenciamento de camisas de futebol. O projeto possui vitrine pública, catálogo de produtos, carrinho, checkout, integração com pagamento via InfinitePay, área do cliente e painel administrativo para controle de produtos, usuários, pedidos, vendas e estoque.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades principais](#funcionalidades-principais)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Banco de dados](#banco-de-dados)
- [Como executar](#como-executar)
- [Rotas principais](#rotas-principais)
- [Fluxo de compra](#fluxo-de-compra)
- [Integração com InfinitePay](#integração-com-infinitepay)
- [Painel administrativo](#painel-administrativo)
- [Regras importantes do sistema](#regras-importantes-do-sistema)
- [Segurança básica implementada](#segurança-básica-implementada)
- [Upload de imagens](#upload-de-imagens)
- [Testes recomendados](#testes-recomendados)
- [Comandos úteis](#comandos-úteis)
- [Autores](#autores)

---

## Sobre o projeto

O **Manto 10** é um sistema de e-commerce para comercialização de camisas de futebol. O sistema permite que clientes visualizem produtos, filtrem camisas, acessem detalhes, adicionem itens ao carrinho, informem endereço de entrega, criem pedidos e sejam redirecionados para pagamento pela InfinitePay.

Além da loja pública, o sistema possui um painel administrativo para o gerenciamento interno da loja, permitindo controlar produtos, estoque por tamanho, vendas pelo site, vendas manuais, usuários e status dos pedidos.

O projeto foi desenvolvido em arquitetura MVC, utilizando **Node.js**, **Express**, **EJS** e **MySQL**.

---

## Funcionalidades principais

### Área pública

- Página inicial com destaque para o catálogo.
- Catálogo de camisas.
- Página de detalhes do produto.
- Exibição de preço, preço promocional, tipo de camisa e tamanhos disponíveis.
- Produtos sem estoque total não aparecem para o cliente.
- Carrinho lateral e página completa do carrinho.
- Checkout com endereço de entrega.
- Criação de pedido com status inicial **Pendente**.
- Redirecionamento para pagamento pela InfinitePay.
- Páginas de retorno de pagamento.
- Cadastro e login de clientes.
- Área **Minha Conta**.
- Consulta de pedidos do próprio cliente.
- Cancelamento de pedido pelo cliente quando permitido.

### Área administrativa

- Dashboard administrativo.
- Listagem de usuários.
- Ativação e desativação de usuários.
- Listagem de produtos.
- Cadastro de produtos.
- Edição de produtos.
- Upload de imagem principal do produto.
- Controle de estoque por tamanho.
- Ativação e desativação de produtos.
- Listagem de pedidos feitos no site.
- Detalhes de pedido.
- Alteração de status do pedido.
- Cadastro de código de rastreio.
- Cancelamento de pedido com restituição de estoque quando aplicável.
- Registro de venda manual.
- Cancelamento de venda manual com restituição de estoque quando aplicável.

---

## Tecnologias utilizadas

- **Node.js**
- **Express 5**
- **EJS**
- **MySQL 8**
- **mysql2**
- **express-session**
- **express-rate-limit**
- **bcryptjs**
- **multer**
- **dotenv**
- **nodemon**
- **HTML5**
- **CSS3**
- **JavaScript**

---

## Estrutura de pastas

```text
manto10/
│
├── app.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── AdminController.js
│   ├── AdminPedidoController.js
│   ├── AdminProdutoController.js
│   ├── AdminUsuarioController.js
│   ├── AdminVendaController.js
│   ├── AuthController.js
│   ├── CarrinhoController.js
│   ├── CheckoutController.js
│   ├── ContaController.js
│   ├── HomeController.js
│   ├── InfinitePayController.js
│   └── ProdutoController.js
│
├── database/
│   ├── manto10.sql
│   └── testarBanco.js
│
├── middlewares/
│   ├── auth.js
│   └── uploadProduto.js
│
├── models/
│   ├── Admin.js
│   ├── AdminPedido.js
│   ├── AdminProduto.js
│   ├── AdminUsuario.js
│   ├── AdminVenda.js
│   ├── Carrinho.js
│   ├── Liga.js
│   ├── Pagamento.js
│   ├── Pedido.js
│   ├── Produto.js
│   └── Usuario.js
│
├── public/
│   ├── css/
│   ├── images/
│   └── js/
│
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── carrinho.js
│   ├── index.js
│   └── produtos.js
│
├── services/
│   ├── InfinitePayService.js
│   └── PedidoExpiracaoService.js
│
└── views/
    ├── admin/
    ├── auth/
    ├── carrinho/
    ├── checkout/
    ├── conta/
    ├── erros/
    ├── pagamento/
    ├── partials/
    └── produtos/
```

---

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- npm
- MySQL Server
- MySQL Workbench ou outro gerenciador MySQL
- Git, caso deseje versionar ou clonar o projeto

---

## Instalação

Depois de baixar ou clonar o projeto, entre na pasta principal:

```bash
cd manto10
```

Instale as dependências:

```bash
npm install
```

---

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto, usando o arquivo `.env.example` como base.

Exemplo:

```env
PORT=8000
APP_URL=http://localhost:8000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=manto10

SESSION_SECRET=troque_por_uma_chave_segura

INFINITEPAY_HANDLE=seu_handle_infinitepay
INFINITEPAY_WEBHOOK_URL=
INFINITEPAY_TIMEOUT_MS=15000

PEDIDO_EXPIRACAO_SEGUNDOS=1800
PEDIDO_VERIFICACAO_SEGUNDOS=60

WHATSAPP_NUMBER=
```

### Explicação das variáveis

| Variável | Função |
|---|---|
| `PORT` | Porta em que o servidor será executado. |
| `APP_URL` | URL principal do sistema. Em desenvolvimento, use `http://localhost:8000`. |
| `DB_HOST` | Host do banco MySQL. |
| `DB_PORT` | Porta do MySQL. |
| `DB_USER` | Usuário do MySQL. |
| `DB_PASSWORD` | Senha do MySQL. |
| `DB_NAME` | Nome do banco de dados. |
| `SESSION_SECRET` | Chave usada para proteger a sessão dos usuários. |
| `INFINITEPAY_HANDLE` | Identificador da conta InfinitePay. |
| `INFINITEPAY_WEBHOOK_URL` | URL pública para receber webhook da InfinitePay. |
| `INFINITEPAY_TIMEOUT_MS` | Tempo máximo de espera para chamadas à InfinitePay. |
| `PEDIDO_EXPIRACAO_SEGUNDOS` | Tempo para expirar pedidos pendentes. |
| `PEDIDO_VERIFICACAO_SEGUNDOS` | Intervalo de verificação dos pedidos pendentes expirados. |
| `WHATSAPP_NUMBER` | Número de WhatsApp usado em recursos de contato, quando configurado. |

---

## Banco de dados

O projeto utiliza MySQL. O arquivo SQL principal está em:

```text
database/manto10.sql
```

Também pode ser usado o dump final separado fornecido com o projeto:

```text
Dump20260918_limpo_manto10.sql
```

### Criar banco de dados

No MySQL Workbench ou terminal MySQL, crie o banco:

```sql
CREATE DATABASE manto10 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Depois importe o arquivo SQL.

### Importar pelo terminal

```bash
mysql -u root -p manto10 < database/manto10.sql
```

Ou, se estiver usando o dump separado:

```bash
mysql -u root -p manto10 < Dump20260918_limpo_manto10.sql
```

### Testar conexão

O projeto possui um arquivo auxiliar:

```bash
node database/testarBanco.js
```

Se as configurações estiverem corretas, a conexão com o banco será confirmada.

---

## Como executar

### Ambiente de desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em:

```text
http://localhost:8000
```

### Ambiente normal

```bash
npm start
```

---

## Rotas principais

### Loja

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Página inicial. |
| `GET` | `/camisas` | Catálogo de produtos. |
| `GET` | `/produto/:slug` | Detalhes de um produto. |

### Autenticação e cliente

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/cadastro` | Tela de cadastro de cliente. |
| `POST` | `/cadastro` | Cria uma nova conta de cliente. |
| `GET` | `/login` | Tela de login. |
| `POST` | `/login` | Autentica o usuário. |
| `POST` | `/logout` | Encerra a sessão. |
| `GET` | `/minha-conta` | Área do cliente. |
| `GET` | `/minha-conta/pedidos/:id` | Detalhes de um pedido do cliente. |
| `POST` | `/minha-conta/pedidos/:id/cancelar` | Cancela um pedido quando permitido. |

### Carrinho e checkout

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/carrinho` | Página do carrinho. |
| `GET` | `/carrinho/resumo` | Resumo usado pelo carrinho lateral. |
| `POST` | `/carrinho/adicionar` | Adiciona produto ao carrinho. |
| `POST` | `/carrinho/item/:id/quantidade` | Atualiza quantidade de um item. |
| `POST` | `/carrinho/item/:id/remover` | Remove item do carrinho. |
| `GET` | `/checkout` | Tela de checkout/endereço. |
| `POST` | `/checkout/finalizar` | Cria o pedido. |

### Pagamento InfinitePay

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/pagamento/infinitepay/:id` | Inicia o pagamento de um pedido. |
| `GET` | `/pagamento/infinitepay/retorno` | Retorno do cliente após o pagamento. |
| `POST` | `/pagamento/infinitepay/webhook` | Webhook da InfinitePay. |

### Administração

Todas as rotas administrativas ficam abaixo de `/admin` e exigem usuário do tipo **Administrador**.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin` | Dashboard administrativo. |
| `GET` | `/admin/usuarios` | Lista usuários. |
| `POST` | `/admin/usuarios/:id/status` | Ativa ou desativa usuário. |
| `GET` | `/admin/produtos` | Lista produtos. |
| `GET` | `/admin/produtos/novo` | Formulário de novo produto. |
| `POST` | `/admin/produtos/novo` | Cadastra produto. |
| `GET` | `/admin/produtos/:id/editar` | Formulário de edição de produto. |
| `POST` | `/admin/produtos/:id/editar` | Salva edição de produto. |
| `POST` | `/admin/produtos/:id/estoque` | Atualiza estoque por tamanho. |
| `POST` | `/admin/produtos/:id/status` | Ativa ou desativa produto. |
| `GET` | `/admin/pedidos` | Lista pedidos do site. |
| `GET` | `/admin/pedidos/:id` | Detalhes de pedido. |
| `POST` | `/admin/pedidos/:id/status` | Atualiza status do pedido. |
| `POST` | `/admin/pedidos/:id/rastreio` | Salva código de rastreio. |
| `POST` | `/admin/pedidos/:id/cancelar` | Cancela pedido. |
| `GET` | `/admin/vendas` | Lista vendas. |
| `GET` | `/admin/vendas/nova` | Formulário de venda manual. |
| `POST` | `/admin/vendas/nova` | Registra venda manual. |
| `GET` | `/admin/vendas/manuais/:id` | Detalhes de venda manual. |
| `POST` | `/admin/vendas/manuais/:id/cancelar` | Cancela venda manual. |

---

## Fluxo de compra

1. Cliente acessa o catálogo.
2. Cliente abre a página do produto.
3. Cliente escolhe tamanho e quantidade.
4. Produto é adicionado ao carrinho.
5. Cliente acessa o carrinho.
6. Cliente segue para o checkout.
7. Cliente informa endereço de entrega.
8. Sistema cria o pedido como **Pendente**.
9. Cliente é redirecionado para a InfinitePay.
10. Pagamento é confirmado pelo retorno e/ou webhook.
11. Pedido é atualizado para **Pago**.
12. Administrador inicia preparação.
13. Administrador informa envio e rastreio, quando necessário.
14. Pedido pode ser marcado como **Entregue**.

---

## Integração com InfinitePay

O sistema possui integração com a InfinitePay para criação de links de pagamento e verificação de transações.

Principais pontos:

- O pedido é criado localmente com status **Pendente**.
- O cliente é redirecionado para o checkout da InfinitePay.
- O retorno pelo navegador tenta validar a transação.
- O webhook também confirma o pagamento.
- A confirmação é idempotente, ou seja, evita duplicar pagamento ou baixa de estoque.
- A URL de comprovante é validada antes de ser salva.
- As chamadas para a InfinitePay possuem timeout configurável por `INFINITEPAY_TIMEOUT_MS`.

Em ambiente local, o webhook automático pode não funcionar se a aplicação estiver apenas em `localhost`, pois a InfinitePay precisa acessar uma URL pública. Para testes reais de webhook, é necessário usar uma URL pública ou túnel apropriado.

---

## Painel administrativo

O painel administrativo permite gerenciar a operação da loja.

### Produtos

- Cadastro de produtos.
- Edição de informações.
- Upload de imagem principal.
- Controle de estoque por tamanho.
- Ativação e desativação de produtos.

### Pedidos

- Visualização dos pedidos do site.
- Alteração de status.
- Cancelamento com restituição de estoque quando aplicável.
- Registro de código de rastreio.

### Vendas manuais

- Registro de vendas feitas fora do site.
- Baixa de estoque automática.
- Cancelamento com restituição de estoque quando permitido.

### Usuários

- Listagem de usuários.
- Ativação ou desativação de contas.
- Separação entre Cliente e Administrador.

---

## Regras importantes do sistema

- Produtos com estoque total zero continuam cadastrados e visíveis no painel administrativo, mas não aparecem no catálogo público.
- Produtos de tipos diferentes possuem estoque independente, mesmo que sejam do mesmo modelo.
- Cada produto utiliza uma imagem principal.
- O estoque é controlado por tamanho.
- Pedidos pendentes podem expirar automaticamente.
- Pedidos cancelados podem restituir estoque, dependendo do status e da regra aplicada.
- A Box Misteriosa respeita a preferência escolhida pelo cliente.
- O cliente só consegue visualizar pedidos vinculados à sua própria conta.
- O painel administrativo exige usuário autenticado como Administrador.

---

## Segurança básica implementada

O sistema possui as seguintes proteções básicas:

- Senhas criptografadas com `bcryptjs`.
- Sessão de usuário com `express-session`.
- Cookie de sessão com `httpOnly`.
- Regeneração da sessão no login.
- Separação entre Cliente e Administrador.
- Rotas administrativas protegidas por middleware.
- Rotas de carrinho, checkout e minha conta exigem login.
- Rate limit no login para reduzir tentativas repetidas de senha.
- Upload limitado a imagens JPG, PNG ou WEBP.
- Tamanho máximo de upload: 5 MB.
- Consultas SQL com parâmetros.
- Validação da URL de comprovante da InfinitePay.
- Tratamento genérico de erros no webhook.

---

## Upload de imagens

O upload de imagens de produtos é feito com `multer`.

Formatos aceitos:

- JPG
- PNG
- WEBP

Tamanho máximo:

```text
5 MB
```

As imagens enviadas pelo painel administrativo são salvas em:

```text
public/images/produtos/uploads/
```

---

## Testes recomendados

Antes de considerar o projeto finalizado ou publicar, recomenda-se testar:

### Cliente

- Criar conta.
- Fazer login.
- Tentar login com senha errada.
- Acessar catálogo.
- Abrir produto.
- Adicionar produto ao carrinho.
- Alterar quantidade.
- Remover item.
- Finalizar checkout.
- Criar pedido.
- Iniciar pagamento.
- Conferir pedido em Minha Conta.

### Administração

- Login como administrador.
- Acessar `/admin`.
- Cadastrar produto.
- Editar produto.
- Alterar estoque.
- Desativar produto.
- Ativar produto.
- Visualizar pedidos.
- Alterar status de pedido.
- Inserir código de rastreio.
- Registrar venda manual.
- Cancelar venda manual.

### Segurança básica

- Acessar `/admin` sem login.
- Acessar `/admin` com usuário Cliente.
- Acessar `/checkout` sem login.
- Tentar visualizar pedido de outro usuário.
- Testar limite de tentativas de login.

### Estoque

- Produto com estoque zero não aparecer no catálogo.
- Produto com estoque zero continuar no painel administrativo.
- Compra reduzir estoque correto.
- Cancelamento restituir estoque quando aplicável.
- Box Misteriosa respeitar preferência e tamanho.

---

## Comandos úteis

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Rodar normalmente:

```bash
npm start
```

Testar banco de dados:

```bash
node database/testarBanco.js
```

Verificar dependências vulneráveis:

```bash
npm audit
```

Corrigir vulnerabilidades automaticamente, quando seguro:

```bash
npm audit fix
```

---

## Observações para produção

Antes de publicar o sistema em produção, recomenda-se:

- Usar uma `SESSION_SECRET` forte.
- Configurar `NODE_ENV=production`.
- Usar HTTPS.
- Configurar `APP_URL` com o domínio real.
- Configurar `INFINITEPAY_WEBHOOK_URL` com uma URL pública.
- Usar um armazenamento persistente para sessão, em vez do armazenamento em memória.
- Manter backups do banco de dados.
- Rodar `npm audit`.
- Revisar permissões de arquivos enviados.

---

## Autores

Projeto desenvolvido por:

- Alexandre Luis Lourenci Filho
- Felipe Fribel da Rosa
- Fellipe de Oliveira Ferreira
- Luiz Henrique Tezza

---

## Licença

Este projeto está configurado como licença ISC no `package.json`.

---

## Status do projeto

Versão final corrigida e preparada para testes finais, apresentação e publicação em ambiente controlado.
