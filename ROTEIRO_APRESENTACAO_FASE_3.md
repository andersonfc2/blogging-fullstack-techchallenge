# Roteiro de Apresentação - Tech Challenge Fase 3

Tempo total sugerido: 5 minutos.

- Parte técnica: 2 minutos.
- Demonstração do site: 3 minutos.

## 1. Parte técnica - 2 minutos

### Abertura - 20 segundos

Fala sugerida:

> Este projeto é uma aplicação full stack de blogging educacional para o Tech Challenge da Fase 3. O backend da fase anterior foi aproveitado e evoluído, e nesta fase foi criada uma interface gráfica em React para estudantes e docentes.

### Arquitetura e tecnologias - 50 segundos

Mostrar rapidamente o VS Code com a estrutura do projeto.

Fala sugerida:

> A aplicação é dividida em três partes. O backend fica na pasta `src`, foi feito com Node.js, Express e PostgreSQL. O frontend fica na pasta `frontend`, foi feito com React, Vite e React Router DOM. A autenticação dos docentes usa JWT, e as chamadas para a API ficam centralizadas em um serviço no frontend.

Pontos para citar:

- `src`: backend.
- `frontend`: interface React.
- `frontend/src/services/api.js`: integração com API.
- `frontend/src/contexts/AuthContext.jsx`: autenticação.
- `frontend/src/components/ProtectedRoute.jsx`: rotas protegidas.

### Docker e CI/CD - 30 segundos

Mostrar `docker-compose.yml` e `.github/workflows`.

Fala sugerida:

> O projeto roda com Docker Compose, subindo banco PostgreSQL, API Node.js e frontend servido por Nginx. Também foram configurados workflows no GitHub Actions para testar o backend, gerar build do frontend e publicar imagens Docker.

### Testes e documentação - 20 segundos

Mostrar `README.md` e `DOCUMENTACAO_FASE_3.md`.

Fala sugerida:

> O backend possui testes automatizados com Jest e Supertest. O frontend foi validado com build de produção. A documentação descreve setup, arquitetura, endpoints, uso da aplicação e decisões técnicas.

## 2. Demonstração do site - 3 minutos

### Preparação

Antes de gravar, deixe a aplicação rodando com:

```bash
docker compose up --build
```

Abra:

```text
http://localhost:5173
```

Tenha pelo menos um post cadastrado.

### Área pública - 45 segundos

Demonstrar:

1. Página inicial com lista de posts.
2. Busca por palavra-chave.
3. Clique em "Ler post completo".

Fala sugerida:

> Esta é a área pública. Estudantes podem listar postagens, buscar conteúdos por palavra-chave e abrir um post para leitura completa.

### Login docente - 30 segundos

Abrir:

```text
/login
```

Usar:

```text
Email: professor@fiap.com
Senha: 123456
```

Fala sugerida:

> Para acessar a área administrativa, o docente realiza login. O backend valida as credenciais e retorna um token JWT, usado nas próximas operações protegidas.

### Administração - 40 segundos

Abrir:

```text
/admin
```

Demonstrar:

1. Lista administrativa.
2. Botões "Ver", "Editar" e "Excluir".

Fala sugerida:

> Na administração, o docente visualiza todas as postagens e pode acessar as ações de gerenciamento. Essa rota é protegida e só pode ser acessada com login.

### Criação de post - 35 segundos

Abrir:

```text
/posts/new
```

Criar um post curto:

```text
Título: Aula sobre React
Autor: Professor Admin
Conteúdo: Post criado durante a demonstração da Fase 3.
```

Fala sugerida:

> A criação de post também é protegida. O frontend envia o token no cabeçalho Authorization, e o backend permite a operação apenas quando o token é válido.

### Edição e exclusão - 50 segundos

Demonstrar:

1. Editar o post criado.
2. Salvar alteração.
3. Voltar para administração.
4. Excluir o post de teste.

Fala sugerida:

> Aqui vemos o restante do CRUD: edição e exclusão. Antes de excluir, a interface pede confirmação para evitar remoções acidentais.

### Logout e proteção de rota - 20 segundos

Demonstrar:

1. Clicar em "Sair".
2. Tentar acessar `/admin`.
3. Mostrar redirecionamento para `/login`.

Fala sugerida:

> Após o logout, o token é removido. Ao tentar acessar uma rota protegida, o usuário é redirecionado para o login.

## Encerramento - 10 segundos

Fala sugerida:

> Com isso, o projeto atende aos requisitos da Fase 3: interface React, integração com backend REST, autenticação docente, rotas protegidas, CRUD completo, Docker, CI/CD e documentação.

## Checklist rápido antes de gravar

- Rodar `docker compose up --build`.
- Abrir `http://localhost:5173`.
- Confirmar que login funciona.
- Ter um post pronto para busca/leitura.
- Usar um post de teste para criação, edição e exclusão.
- Deixar VS Code aberto no README, documentação e workflows.
