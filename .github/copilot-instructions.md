# Copilot Instructions — Finances App

## Quick summary
- Monorepo-like project with a **frontend (Vite + React + TypeScript)** at the repo root and a **backend (NestJS)** in `finances-api/`.
- Auth and data store: **Supabase**. Frontend uses `VITE_` env vars; backend requires `SUPABASE_SERVICE_ROLE_KEY` for server operations.

## Where to start (Dev workflow) ✅
- Install deps (root & backend): `npm install` (then `cd finances-api && npm install`).
- Run both dev servers: `npm run dev:all` (or separately: `npm run dev` and `cd finances-api && npm run start:dev`).
- API base URL used by frontend: `import.meta.env.VITE_API_URL || 'http://localhost:3333/api'` (see `src/services/api.ts`).
- Swagger docs: `http://localhost:3333/docs` (backend `main.ts`), note `ignoreGlobalPrefix` is set so docs live at `/docs`.

## Key architecture notes (big picture) 🔧
- Frontend: `src/`
  - `src/services/` — http client & resource services (e.g., `api.ts`, `categories.ts`, `transactions.ts`). Use the `api` helpers.
  - `src/services/supabase.ts` — Supabase client for browser flows (uses `VITE_SUPABASE_*`).
  - `src/store/` — Zustand stores (auth, categories, transactions). `authStore.getAccessToken()` is used by `api.ts` to inject the `Authorization: Bearer` header.
  - `src/types/index.ts` — shared TypeScript types used across components and services.

- Backend: `finances-api/src/`
  - Organized into **modules** (`modules/*`) each exposing controllers/services/DTOs. DTOs use `class-validator` / `class-transformer` conventions.
  - Supabase integration in `finances-api/src/config/supabase.module.ts` and `finances-api/supabase/migrations/` for DB migrations.

## Patterns & conventions (be specific) 💡
- HTTP client: use `src/services/api.ts` helpers: `api.get<T>('/transactions', { page: 1 })`, `api.post<T>('/categories', body)`.
- Token injection: do NOT re-implement header management; rely on `authStore.getAccessToken()` and `api.ts` which appends `Authorization` when token exists.
- Handle 204 responses in code paths (the client returns `undefined` for 204 responses).
- Keep frontend DTO/type changes mirrored in `src/types/index.ts` and, when relevant, update backend DTOs in `finances-api/src/modules/*`.

## Scripts & debug tips 🐞
- Root scripts: `dev` (vite), `dev:all` (both servers), `build` (tsc + vite build), `test` (Jest), `lint` (ESLint).
- Backend scripts (in `finances-api/package.json`): `start:dev`, `build`, `supabase:push`, `supabase:apply-profiles` (runs a single SQL migration file).
- Debug tests: `npm run test:debug` or `cd finances-api && npm run test:debug` uses `node --inspect-brk`.

## Supabase & migrations ✨
- Frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite only injects `VITE_` prefixed vars).
- Backend needs `SUPABASE_SERVICE_ROLE_KEY` for elevated DB ops; don't commit this secret.
- Use Supabase CLI for migrations: from `finances-api` run `npx supabase db push` or the provided `supabase:apply-profiles` script for the `profiles` SQL:
  - `cd finances-api && npx supabase db push`
  - or `npm run supabase:apply-profiles` (runs a single SQL file already committed).

## Testing & CI considerations ✅
- Jest powers tests for both frontend and backend. Use `npm test` in the appropriate folder.
- Coverage artifacts are kept in `finances-api/coverage` and root coverage config points to `coverage` outputs.

## Non-obvious gotchas / repository specifics ⚠️
- Vite is overridden to `rolldown-vite` via `package.json` overrides (this affects plugin behavior/fallbacks).
- Tailwind v4 note: project uses PostCSS import of Tailwind rather than the v3 CLI. If a change requires Tailwind CLI usage, follow the README guidance.
- `main.ts` sets a global prefix (`api`) but Swagger docs live at `/docs` due to `ignoreGlobalPrefix` — expect API routes under `/api/*`.

## Where to look for examples (quick links) 🔍
- HTTP client & token usage: `src/services/api.ts` and `src/services/supabase.ts`.
- State handling: `src/store/authStore.ts`.
- Backend modules & DTO patterns: `finances-api/src/modules/*`.
- Migration example: `finances-api/supabase/migrations/20251217183000_create_profiles.sql`.

## PR guidance & checklist ✅
- Run `npm run lint` and `npm test` (root or `finances-api`) before opening PR.
- If changing types that affect both client and server, update `src/types/index.ts` and corresponding backend DTOs.
- Add tests for new endpoints or business logic in the corresponding folder.

---
If anything in these instructions is unclear or incomplete, point me to the spot you'd like clarified and I'll iterate. Thanks!