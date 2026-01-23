# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo-style financial management application with:
- **Frontend**: React + Vite + TypeScript (root directory)
- **Backend**: NestJS + TypeScript (`finances-api/`)
- **Database & Auth**: Supabase (PostgreSQL-compatible)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4

## Common Commands

### Development
```powershell
# Install dependencies
npm install                              # Frontend
cd finances-api && npm install           # Backend

# Run development servers
npm run dev:all                          # Both frontend + backend concurrently
npm run dev                              # Frontend only (http://localhost:5173)
cd finances-api && npm run start:dev     # Backend only (http://localhost:3333)
```

### Testing
```powershell
# Frontend tests
npm test                                 # Run all tests
npm run test:watch                       # Watch mode
npm run test:cov                         # With coverage

# Backend tests
cd finances-api
npm test                                 # Run all tests
npm run test:watch                       # Watch mode
npm run test:cov                         # With coverage
npm run test:debug                       # Debug mode
```

### Build & Lint
```powershell
# Frontend
npm run build                            # TypeScript check + Vite build
npm run lint                             # ESLint

# Backend
cd finances-api
npm run build                            # NestJS build
npm run lint                             # ESLint with auto-fix
```

### Utility Scripts
```powershell
npm run remove-users                     # Remove all users from Supabase (uses tsx scripts/remove-all-users.ts)
```

### Supabase Migrations
```powershell
cd finances-api
npm run supabase:push                    # Apply pending migrations
npm run supabase:apply-profiles          # Apply profiles migration specifically
npx supabase login                       # Login to Supabase CLI
npx supabase link --project-ref <REF>    # Link to project
```

## Architecture

### Frontend (`src/`)

**State Management Pattern**:
- Zustand stores in `src/store/` for each domain (auth, categories, transactions, budgets, goals, investments)
- `authStore` manages Supabase session and provides `getAccessToken()` used by API client
- Stores subscribe to Supabase auth state changes automatically

**HTTP Client Pattern** (`src/services/api.ts`):
- Centralized `api` object with `.get()`, `.post()`, `.patch()`, `.delete()` methods
- Automatically injects `Authorization: Bearer <token>` from `authStore.getAccessToken()`
- Handles 401 by auto-signout and redirect to `/auth/login`
- Returns `undefined` for 204 No Content responses
- Throws `HttpError` instances with status code and parsed error data

**Service Layer** (`src/services/`):
- Each domain has a service file (e.g., `categories.ts`, `transactions.ts`)
- Services use the `api` client and return typed responses
- Types defined in `src/types/index.ts`

**Key Files**:
- `src/services/api.ts` — HTTP client with token injection and error handling
- `src/services/supabase.ts` — Supabase client for browser (uses `VITE_SUPABASE_*` env vars)
- `src/store/authStore.ts` — Auth state, session management, `getAccessToken()`
- `src/types/index.ts` — Shared TypeScript interfaces

### Backend (`finances-api/src/`)

**Module Structure**:
- NestJS modules in `src/modules/` for each domain:
  - `auth/` — Authentication (Supabase token verification)
  - `categories/` — Expense/income/investment categories
  - `transactions/` — Financial transactions
  - `budgets/` — Monthly budgets per category
  - `goals/` — Financial goals with progress tracking
  - `debts/` — Debt management with payment tracking
  - `investments/` — Investment portfolio with history
  - `profiles/` — User profile management

**Authentication**:
- `src/common/guards/auth.guard.ts` and `src/common/guards/supabase-auth.guard.ts` verify JWT tokens
- Controllers use `@UseGuards(AuthGuard)` to require authentication
- Token passed via `Authorization: Bearer <token>` header

**Supabase Integration**:
- `src/config/supabase.module.ts` — Global module providing `SUPABASE_CLIENT`
- Uses `SUPABASE_SERVICE_ROLE_KEY` for elevated server-side operations
- Migrations in `finances-api/supabase/migrations/`

**API Structure**:
- Global prefix: `/api` (set in `main.ts`)
- Swagger docs: `/docs` (uses `ignoreGlobalPrefix: true`)
- Root `/` redirects to `/docs`
- Validation: `ValidationPipe` with `whitelist: true` and `transform: true`
- CORS: Configurable via `CORS_ORIGINS` env var (default: `http://localhost:5173,http://localhost:5174`)

**DTOs & Validation**:
- Each module has `dto/` folder with `class-validator` decorators
- Use `class-transformer` for automatic type transformation
- Swagger decorators (`@ApiProperty`, `@ApiPropertyOptional`) for documentation

**Key Files**:
- `finances-api/src/main.ts` — Bootstrap, CORS, Swagger, validation pipeline
- `finances-api/src/config/supabase.module.ts` — Supabase client factory
- `finances-api/src/common/guards/*.guard.ts` — Authentication guards

## Environment Variables

Frontend (`.env` in root):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3333/api
```

Backend (`.env` in root, shared with frontend):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3333
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Important**: Vite only exposes variables prefixed with `VITE_` to the browser.

## Testing Conventions

- Jest configuration in `package.json` for both frontend and backend
- Test files use `.spec.ts` suffix
- Backend: `rootDir: "src"`, coverage output to `finances-api/coverage/`
- Frontend: Similar Jest setup with coverage output to root `coverage/`

## Important Patterns

### Adding API Endpoints

1. Create/update DTO in `finances-api/src/modules/<domain>/dto/`
2. Add endpoint in controller with Swagger decorators
3. Implement service method
4. Update frontend types in `src/types/index.ts`
5. Create/update service in `src/services/<domain>.ts`
6. Write tests for controller and service

### Error Handling

- Backend throws standard NestJS exceptions (`UnauthorizedException`, `NotFoundException`, etc.)
- Frontend `api.ts` catches these and throws `HttpError` with status and message
- 401 errors auto-signout and redirect to login
- 204 responses return `undefined`

### Authentication Flow

1. User signs in via `authStore.signIn()` → calls Supabase Auth
2. Supabase returns session with access token
3. `authStore` saves session and user
4. `onAuthStateChange` listener updates store on session changes
5. API calls get token via `authStore.getAccessToken()`
6. Backend verifies token using `AuthGuard` → extracts user ID from JWT
7. Services use user ID to filter data per user

### Type Synchronization

- Frontend types in `src/types/index.ts` should match backend DTOs
- When changing API contracts, update both simultaneously
- Use Swagger docs at `/docs` to verify API shape

## Repository-Specific Notes

- **Vite override**: Uses `rolldown-vite@7.2.5` instead of standard Vite (see `package.json` overrides)
- **Tailwind v4**: Uses PostCSS plugin, not CLI (config in `tailwind.config.cjs` and `postcss.config.cjs`)
- **Supabase CLI**: Available in `finances-api/node_modules` via `npx supabase`
- **Port configuration**: Backend port via `PORT` env var (default: 3333)
- **ESLint disabled for test files**: Some test files have `/* eslint-disable @typescript-eslint/no-explicit-any */` header
