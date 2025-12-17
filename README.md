# Finanças Pessoais (Finances App)

Aplicação web moderna para gerenciamento de finanças pessoais (frontend + backend).

Este repositório contém um frontend em React + Vite (TypeScript) e uma API backend construída com NestJS que utiliza o Supabase como backend de dados.

---

## Visão Geral

O projeto tem como objetivo oferecer uma solução simples e organizada para controle de finanças pessoais com funcionalidades como:

- Gerenciamento de categorias (receitas, despesas, investimentos)
- Lançamento de transações (entradas e saídas)
- Orçamentos mensais por categoria
- Investimentos com histórico e análise
- Metas financeiras (goals) com acompanhamento de progresso
- Gestão de dívidas (debts) com pagamento e status
- Autenticação com Supabase (frontend e backend)

---

## Tecnologias

- Frontend: React + Vite + TypeScript
- Backend: NestJS + TypeScript
- Banco: Supabase (Postgres compatível)
- Autenticação: Supabase Auth
- Testes: Jest
- UI/Estilização: Tailwind CSS
- Client state: Zustand

---

## Estrutura do Repositório

- `/` - Frontend (Vite + React)
  - `src/` - código do frontend
  - `src/services/` - api client e services (e.g., `api.ts`, `categories.ts`, `transactions.ts`)
  - `src/types/` - tipos TypeScript compartilhados para frontend
- `/finances-api` - Backend (NestJS)
  - `src/modules` - módulos como `categories`, `transactions`, `investments`, `goals`, `debts`, `auth`
  - `src/main.ts` - bootstrap do servidor (Swagger + validação + CORS)
  - `src/config/supabase.module.ts` - configuração do cliente Supabase para o backend

---

## Variáveis de Ambiente

As variáveis de ambiente ficam em `.env` na raiz do projeto. Exemplo principal (já presente no repositório):

```dotenv
# Backend (server-side)
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Frontend (Vite - prefixo VITE_)
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_API_URL=http://localhost:3333/api

# App port
PORT=3333
```

Observações:
- O Vite só injeta variáveis que começam com `VITE_` para o código do cliente.
- Não adicione suas chaves secretas a commits públicos.

---

## Instalação e Execução (Desenvolvimento)

Recomendo abrir duas janelas de terminal (uma para frontend e outra para backend).

1) Instalar dependências (na raiz e no backend):

```powershell
cd C:\Users\mathe\Documents\GitHub\financial_app
npm install

cd finances-api
npm install
```

2) Rodar o backend (em uma janela):

```powershell
cd C:\Users\mathe\Documents\GitHub\financial_app\finances-api
npm run start:dev
```

3) Rodar o frontend (em outra janela):

```powershell
cd C:\Users\mathe\Documents\GitHub\financial_app
npm run dev
```

Alternativamente, rode ambos (frontend + backend) com um único comando:

```powershell
npm run dev:all
```

Endpoints e URLs:
- API: http://localhost:3333/api
- Swagger (docs): http://localhost:3333/docs
- Frontend: http://localhost:5173

---

## Testes

- Rodar todos os testes (frontend):
```powershell
cd C:\Users\mathe\Documents\GitHub\financial_app
npm test
```

- Rodar os testes do backend (NestJS):
```powershell
cd C:\Users\mathe\Documents\GitHub\financial_app\finances-api
npm test
```

---

## Lint e Build

- Lint (root): `npm run lint`
- Lint (backend): `cd finances-api && npm run lint`

- Build (frontend + backend):
```powershell
# Frontend build
cd C:\Users\mathe\Documents\GitHub\financial_app
npm run build

# Backend build
cd finances-api
npm run build
```

---

## Documentação da API

- A API usa o Swagger: http://localhost:3333/docs
- O `main.ts` foi configurado com `ignoreGlobalPrefix: true` para expor a documentação em `/docs` mesmo quando `app.setGlobalPrefix('api')` está habilitado.

---

## Client API (Frontend)

- `src/services/api.ts` — cliente HTTP genérico usando `fetch` e injetando token do `authStore`.
- Services para cada recurso (e.g. `src/services/categories.ts`, `src/services/transactions.ts`) chamam a API e retornam objetos tipados.
- Tipos compartilhados: `src/types/index.ts` com todas as interfaces (Category, Transaction, Budget, Investment, Goal, Debt).

---

## Rotas Principais do Backend (exemplos)

- `GET /api` - Root (Hello World) - AppController
- `GET /api/categories` - List categories (requer autenticação)
- `POST /api/categories` - Criar categoria
- `GET /api/transactions` - Buscar transações com filtros
- `POST /api/transactions` - Criar transação
- `GET /api/goals` - Listar metas, etc.

Autenticação: o `AuthGuard` exige um token JWT/Supabase no header `Authorization: Bearer <token>`.

---

## Healthcheck e Monitoramento

- Sugestão: adicionar uma rota `/health` pública para checks de disponibilidade (botão/ready/liveness probe). Atualmente a raiz `/api` retorna "Hello World" quando o `AppController` está registrado.

---

## Contribuição

Contribuições são bem-vindas! Algumas orientações:

- Use `git pull` e crie branches temáticos (`feature/`, `fix/`, `chore/`).
- Siga as regras do ESLint e rode `npm run lint` antes de abrir PRs.
- Adicione testes quando criar novas funcionalidades (Jest para frontend/back).

---

## Deploy (Notas rápidas)

- Para o backend em produção, configure `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL` em variáveis de ambiente no ambiente de deploy.
- Considere usar Vercel/Netlify (frontend) + Supabase + um container ou serviço serverless para o backend (ou deploy do NestJS em uma VM/serviço de container).

---

## Contato

- Mantainer: MattRib
- Para dúvidas técnicas, abra um issue com o título `issue: <resumo>` e descreva o problema/requisição.

---

© 2024 - Finanças Pessoais
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Tailwind setup note

If you get `npm error could not determine executable to run` when running `npx tailwindcss init -p`, it means the tailwind package version installed does not expose a CLI binary (Tailwind v4 currently doesn't ship a direct CLI). There are three ways to proceed:

1. Use the preinstalled Tailwind PostCSS plugin (no CLI needed)

  - We added `tailwind.config.cjs` and `postcss.config.cjs` already, and imported Tailwind into `src/index.css`.
  - Vite will use PostCSS, so you can run `npm run dev` and Tailwind will work.

2. Use the official Tailwind v3 CLI to generate files with `npx` (one-time):

```powershell
npx -p tailwindcss@3 tailwindcss init -p
```

3. Install the Tailwind v3 CLI as a dev dependency (longer-term):

```powershell
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Choose option 1 if you're happy with the manual config files we created; choose option 2 or 3 if you specifically need the CLI's `init` command to re-create config files.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Supabase Authentication (frontend)

To use Supabase authentication from the React app:

- Add environment variables to `.env` (Vite requires variables to start with `VITE_`):

```dotenv
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- A Supabase client is already provided at `src/services/supabase.ts`:

```ts
import { supabase } from './services/supabase'

// Sign up
await supabase.auth.signUp({ email: 'me@email.com', password: 'password' })

// Sign in
await supabase.auth.signInWithPassword({ email: 'me@email.com', password: 'password' })

// Get session
const { data: session } = await supabase.auth.getSession()

// Sign out
await supabase.auth.signOut()
```


