/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base UI - Slate (padrão para todo o projeto)
        // Já incluído no Tailwind por padrão, mas documentado aqui:
        // slate-50:  #f8fafc  (fundos claros)
        // slate-100: #f1f5f9
        // slate-200: #e2e8f0  (bordas/skeleton light)
        // slate-400: #94a3b8  (texto terciário)
        // slate-500: #64748b  (texto secundário)
        // slate-600: #475569  (ícones neutros)
        // slate-700: #334155
        // slate-800: #1e293b  (bordas/skeleton dark)
        // slate-900: #0f172a  (fundos dark)
        // slate-950: #020617

        // Primary - Azul (acentos e ações principais)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent - Alias para Primary (compatibilidade)
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
    },
  },
  plugins: [],
}
