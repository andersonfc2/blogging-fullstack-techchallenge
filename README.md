# FIAP Pos-Tech - Tech Challenge - Fases 2 e 3

Aplicação full stack para blogging educacional, composta por uma API REST em Node.js/Express, banco de dados PostgreSQL e interface gráfica em React.

A aplicação permite que estudantes consultem postagens educacionais e que docentes autenticados criem, editem e removam conteúdos.

## Objetivo

Desenvolver uma interface gráfica robusta, responsiva e intuitiva para consumir os endpoints REST do backend criado na fase anterior do Tech Challenge.

## Funcionalidades

### Área pública

- Listagem de posts.
- Busca de posts por palavra-chave.
- Leitura completa de uma postagem.

### Área docente

- Login de professor.
- Criação de postagens.
- Edição de postagens.
- Administração de postagens.
- Exclusão de postagens.
- Proteção de rotas com autenticação JWT.

## Tecnologias

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- bcryptjs
- Docker
- Jest
- Supertest

### Frontend

- React
- Vite
- React Router DOM
- CSS responsivo
- Fetch API

### DevOps

- Docker Compose
- GitHub Actions
- Docker Hub

## Arquitetura do projeto

```text
blogging-fullstack-techchallenge/
  src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    tests/
  frontend/
    src/
      components/
      contexts/
      pages/
      services/
  .github/
    workflows/
  docker-compose.yml
  Dockerfile
  README.md
```

## Backend

O backend expõe endpoints REST para gerenciamento das postagens e autenticação dos docentes.

### Endpoints públicos

```text
GET /health
GET /database/health
GET /posts
GET /posts/search?term=palavra
GET /posts/:id
POST /auth/login
```

### Endpoints protegidos

Os endpoints abaixo exigem token JWT no cabeçalho `Authorization`.

```text
POST /posts
PUT /posts/:id
DELETE /posts/:id
```

Exemplo de cabeçalho:

```text
Authorization: Bearer token_jwt
```

## Frontend

O front-end foi desenvolvido em React com componentes funcionais e hooks.

### Páginas

```text
/                Lista e busca de posts
/posts/:id       Leitura completa de post
/login           Login de professor
/posts/new       Criação de post protegida
/posts/:id/edit  Edição de post protegida
/admin           Administração protegida
```

## Variáveis de ambiente

### Backend

Crie um arquivo `.env` na raiz com:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techchallenge

JWT_SECRET=techchallenge_secret_dev
TEACHER_NAME=Professor Admin
TEACHER_EMAIL=professor@fiap.com
TEACHER_PASSWORD=123456
```

### Frontend

Crie um arquivo `frontend/.env` com:

```env
VITE_API_URL=http://localhost:3000
```

## Executando com Docker

Na raiz do projeto, rode:

```bash
docker compose up --build
```

A aplicação ficará disponível em:

```text
Frontend: http://localhost:5173
Backend: http://localhost:3000
PostgreSQL: localhost:5432
```

Usuário docente padrão:

```text
Email: professor@fiap.com
Senha: 123456
```

## Executando localmente sem Docker

### Backend

Na raiz do projeto:

```bash
npm install
npm start
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

## Testes e build

### Backend

```bash
npm test
```

### Frontend

```bash
cd frontend
npm run build
```

## CI/CD

O projeto possui workflows no GitHub Actions para:

- Instalar dependências e executar testes do backend.
- Instalar dependências e gerar build do front-end.
- Gerar imagens Docker do backend e do front-end.
- Publicar imagens no Docker Hub.

Para publicação das imagens, é necessário configurar os secrets abaixo no GitHub:

```text
DOCKER_USERNAME
DOCKER_PASSWORD
```

## Imagens Docker

O workflow publica duas imagens:

```text
fiap-techchallenge-api
fiap-techchallenge-frontend
```

## Guia de uso

1. Acesse `http://localhost:5173`.
2. Consulte a lista de postagens.
3. Use o campo de busca para filtrar conteúdos.
4. Clique em um post para ler o conteúdo completo.
5. Acesse `Login professor`.
6. Entre com o usuário docente padrão.
7. Acesse a administração.
8. Crie, edite ou exclua postagens.

## Relato técnico

Durante a fase 3, o backend da fase anterior foi aproveitado como base da aplicação. A principal evolução foi a criação do front-end em React, com rotas públicas e protegidas, consumo da API REST e autenticação JWT.

Também foram adicionados ajustes de Docker e CI/CD para permitir execução completa da aplicação e validação automatizada do backend e do front-end.

## Status

Projeto preparado para entrega da Fase 3 do Tech Challenge.
