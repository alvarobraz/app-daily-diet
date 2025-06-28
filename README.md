<p align="center">
  <h2>Daily Diet API 🚀</h2>
  API para controle e monitoramento de dieta diária.
  <br>
  <br>

  <a href="https://www.linkedin.com/in/alvarobraz/">
    <img alt="Made by alvarobraz" src="https://img.shields.io/badge/made%20by-alvarobraz-%237519C1?style=for-the-badge">
  </a>
</p>

---

<p align="center">
  <a href="#dart-sobre">Sobre</a> &#xa0; | &#xa0;
  <a href="#rocket-tecnologias">Tecnologias</a> &#xa0; | &#xa0;
  <a href="#estrutura">Estrutura</a> &#xa0; | &#xa0;
  <a href="#memo-requisitos-do-projeto">Requisitos do Projeto</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-começando">Começando</a>
</p>

<br>

## :dart: Sobre ##

A **Daily Diet API** é uma aplicação backend robusta e escalável, desenvolvida para ajudar usuários a registrar e monitorar suas refeições diárias de forma eficiente. Através desta API, os usuários podem gerenciar suas dietas, identificando quais refeições estão dentro ou fora dos seus objetivos nutricionais e acompanhando seu progresso com métricas detalhadas.

A aplicação inclui funcionalidades essenciais como autenticação de usuário via cookies, criação de usuários, registro completo de refeições com nome, descrição, data/hora e status de dieta, além de permitir a edição, exclusão e listagem de refeições. Um dos principais diferenciais é a capacidade de gerar métricas personalizadas, como a quantidade total de refeições, refeições dentro e fora da dieta, e a melhor sequência consecutiva de refeições saudáveis, fornecendo insights valiosos para o controle da dieta.

## :rocket: Tecnologias ##

As seguintes tecnologias foram utilizadas no desenvolvimento do projeto:

-   **[Node.js](https://nodejs.org/en/docs/)**: Ambiente de execução JavaScript.
-   **[TypeScript](https://www.typescriptlang.org/)**: Superset de JavaScript que adiciona tipagem estática.
-   **[Fastify](https://www.fastify.io/)**: Framework web rápido e de baixo overhead para Node.js.
-   **[Knex.js](https://knexjs.org/)**: Query builder SQL flexível e poderoso para Node.js.
-   **[Zod](https://zod.dev/)**: Biblioteca de declaração e validação de schemas TypeScript.
-   **[@fastify/cookie](https://www.npmjs.com/package/@fastify/cookie)**: Plugin para Fastify para gerenciar cookies.

## Estrutura ##
```
├── db
│   ├── app.db
│   └── migrations
│       ├── 20250627034211_create-users.ts
│       ├── 20250627041026_add-session-id-to-users.ts
│       └── 20250628040812_create-meals.ts
├── Insomnia.json
├── knexfile.ts
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app.ts
│   ├── database.ts
│   ├── env
│   │   └── index.ts
│   ├── middlewares
│   │   └── check-session-id-exists.ts
│   ├── routes
│   │   ├── meals.ts
│   │   └── users.ts
│   ├── server.ts
│   └── @types
│       ├── fastify.d.ts
│       └── knex.d.ts
└── tsconfig.json
```
## :memo: Requisitos do Projeto ##

Este projeto implementa as seguintes **funcionalidades** e **regras de negócio**:

### Requisitos Funcionais (RF)

-   [x] O usuário deve poder **criar uma nova refeição**.
-   [x] O usuário deve poder **listar todas as suas refeições**.
-   [x] O usuário deve poder **visualizar uma refeição única**.
-   [x] O usuário pode **editar uma refeição**.
-   [x] O usuário pode **deletar uma refeição**.
-   [x] O usuário deve poder **recuperar métricas** de suas refeições, incluindo:
    -   Quantidade total de refeições registradas.
    -   Quantidade total de refeições dentro da dieta.
    -   Quantidade total de refeições fora da dieta.
    -   A melhor sequência consecutiva de refeições dentro da dieta.

### Regras de Negócio (RN)

-   [x] Deve ser possível **criar um usuário**.
-   [x] Deve ser possível **identificar o usuário** entre as requisições (via `session_id` em cookies).
-   [x] O registro de uma refeição deve incluir: **Nome, Descrição, Data e Hora, e se está dentro ou não da dieta**.
    -   *As refeições devem ser **relacionadas a um usuário específico**.*
-   [x] A edição de uma refeição deve permitir **alterar todos os seus dados**.
-   [x] O usuário **só pode visualizar, editar e apagar as refeições que ele mesmo criou**.

## :checkered_flag: Começando ##

Para configurar e rodar o projeto em sua máquina local, siga os passos abaixo:

```bash
# Clone este repositório
$ git clone https://github.com/alvarobraz/app-daily-diet.git

# Acesse o diretório do projeto
$ cd app-daily-diet

# Instale as dependências
$ npm install

# Execute as migrations do banco de dados (irá criar o arquivo db/app.db e as tabelas)
$ npx knex migrate:latest

# Inicie o servidor em modo de desenvolvimento
$ npm run dev # Se você tem um script 'dev' configurado no package.json
# ou
$ npm start # Se o seu script de inicialização principal for 'start'

# O servidor estará disponível em http://localhost:3333/ (ou na porta configurada em seu .env)
