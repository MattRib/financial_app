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

Next steps: implement a simple `AuthProvider`/hook and UI flows for sign-in/sign-up and to pass auth info to the backend API.

