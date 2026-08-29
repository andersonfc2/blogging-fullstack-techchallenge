# Documentação Técnica - Tech Challenge Fase 3

## Visão geral

O projeto consiste em uma aplicação full stack para blogging educacional. A solução aproveita o backend desenvolvido na fase anterior e adiciona uma interface gráfica em React para permitir que estudantes consultem conteúdos e que docentes autenticados administrem postagens.

A aplicação é composta por três partes principais:

- Frontend em React.
- Backend em Node.js/Express.
- Banco de dados PostgreSQL.

## Objetivo da fase 3

O objetivo da fase 3 foi desenvolver uma interface gráfica robusta, responsiva e intuitiva para consumir os endpoints REST do backend. A interface permite listar, buscar, ler, criar, editar e excluir postagens, além de autenticar docentes para proteger as operações administrativas.

## Arquitetura da aplicação

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
```

## Backend

O backend foi construído com Node.js e Express. Ele expõe uma API REST responsável por gerenciar postagens e autenticar docentes.

### Principais responsabilidades

- Criar a conexão com o PostgreSQL.
- Inicializar as tabelas necessárias.
- Disponibilizar rotas públicas para leitura e busca de posts.
- Disponibilizar rotas protegidas para criação, edição e exclusão.
- Autenticar docentes com JWT.
- Validar o token enviado nas requisições protegidas.

### Banco de dados

O banco PostgreSQL armazena duas entidades principais:

- `posts`: postagens do blog educacional.
- `teachers`: usuários docentes autorizados a acessar a área administrativa.

Na inicialização da aplicação, o backend verifica se as tabelas existem e cria a estrutura necessária quando necessário.

### Autenticação

A autenticação foi implementada com JWT. O docente realiza login informando email e senha. Quando as credenciais são válidas, o backend retorna um token, que deve ser enviado nas requisições protegidas.

Exemplo de cabeçalho:

```text
Authorization: Bearer token_jwt
```

## Frontend

O frontend foi desenvolvido em React com Vite. A aplicação utiliza componentes funcionais, hooks, React Router DOM para navegação e Context API para controle de autenticação.

### Páginas implementadas

```text
/                Lista e busca de posts
/posts/:id       Leitura completa de post
/login           Login de professor
/posts/new       Criação de post protegida
/posts/:id/edit  Edição de post protegida
/admin           Administração protegida
```

### Organização do frontend

- `pages`: telas principais da aplicação.
- `components`: componentes reutilizáveis, como proteção de rotas.
- `contexts`: contexto de autenticação.
- `services`: comunicação centralizada com a API.

## Fluxo de uso

### Estudante

1. Acessa a página inicial.
2. Visualiza a lista de postagens disponíveis.
3. Busca conteúdos por palavra-chave.
4. Abre uma postagem para ler o conteúdo completo.

### Docente

1. Acessa a tela de login.
2. Informa email e senha.
3. Após autenticação, acessa a área administrativa.
4. Cria novas postagens.
5. Edita postagens existentes.
6. Exclui postagens quando necessário.
7. Encerra a sessão usando logout.

## Docker

A aplicação pode ser executada com Docker Compose. O arquivo `docker-compose.yml` sobe os seguintes serviços:

- `fiap-db`: banco PostgreSQL.
- `fiap-api`: backend Node.js/Express.
- `fiap-frontend`: frontend React servido por Nginx.

Com isso, o projeto pode ser executado de forma padronizada em diferentes ambientes.

## CI/CD

O projeto possui workflows do GitHub Actions para validar e publicar a aplicação.

### Workflow de CI

Executa:

- Instalação das dependências do backend.
- Testes automatizados do backend.
- Instalação das dependências do frontend.
- Build de produção do frontend.

### Workflow de Docker

Executa:

- Build da imagem Docker do backend.
- Push da imagem do backend para o Docker Hub.
- Build da imagem Docker do frontend.
- Push da imagem do frontend para o Docker Hub.

## Testes

O backend possui testes automatizados com Jest e Supertest, cobrindo controladores, rotas e configuração do banco.

O frontend foi validado por build de produção e testes manuais dos principais fluxos:

- Listagem.
- Busca.
- Leitura.
- Login.
- Criação.
- Edição.
- Exclusão.
- Logout.
- Rotas protegidas.

## Decisões técnicas

### React com Vite

O Vite foi escolhido por simplificar a criação do projeto React e oferecer execução local rápida durante o desenvolvimento.

### React Router DOM

Foi utilizado para criar navegação entre as páginas públicas e protegidas da aplicação.

### Context API

Foi utilizada para controlar o estado de autenticação do docente, armazenando os dados de login no navegador e permitindo proteger rotas administrativas.

### Serviço centralizado de API

As chamadas HTTP foram concentradas em `frontend/src/services/api.js`. Essa decisão evita repetição de código e facilita a manutenção da URL da API e do envio do token JWT.

### JWT

O JWT foi utilizado por ser uma solução simples e adequada para proteger endpoints REST. O token é gerado no login e enviado pelo frontend nas operações administrativas.

### Docker Compose

O Docker Compose foi utilizado para facilitar a execução conjunta de frontend, backend e banco de dados.

## Desafios encontrados

Durante o desenvolvimento, alguns desafios importantes foram tratados:

- Integração entre frontend e backend em portas diferentes, resolvida com configuração de CORS.
- Proteção das rotas administrativas no backend e no frontend.
- Envio do token JWT nas requisições de criação, edição e exclusão.
- Ajuste do Docker para não copiar `node_modules`, evitando erro de build no Windows.
- Inclusão do frontend no Docker Compose.
- Organização do código React para separar páginas, contexto, componentes e serviços.