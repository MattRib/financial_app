# Design System - Financial App

> **IMPORTANTE**: Este arquivo DEVE ser lido antes de qualquer alteração no frontend.
> Contém os padrões de design, cores, componentes e animações da aplicação.

## Filosofia de Design

- **Minimalista**: Menos é mais. Evitar elementos desnecessários.
- **Premium**: Visual sofisticado e profissional.
- **Sem Gradients**: Usar apenas cores sólidas.
- **Animações Sutis**: Framer Motion para elegância, não exagero.

---

## Paleta de Cores

### Base UI (Dashboard - Slate)

Padrão de neutros usado no dashboard para superfícies, texto e skeletons (paleta Tailwind `slate`).
```
slate-50:  #f8fafc  (fundos claros)
slate-100: #f1f5f9
slate-200: #e2e8f0  (bordas/skeleton light)
slate-400: #94a3b8  (texto terciário)
slate-500: #64748b  (texto secundário)
slate-600: #475569  (ícones neutros)
slate-700: #334155
slate-800: #1e293b  (bordas/skeleton dark)
slate-900: #0f172a  (fundos dark)
slate-950: #020617
```

### Cores Principais (Azul)

Todas as cores são definidas em `src/index.css` dentro do `@theme`. Azul segue sendo a cor de acento/destaque.

#### Azul - Base da UI (Primary)
```
primary-50:  #eff6ff  (backgrounds claros)
primary-100: #dbeafe
primary-200: #bfdbfe  (bordas light)
primary-300: #93c5fd
primary-400: #60a5fa  (texto terciário)
primary-500: #3b82f6  (texto secundário / destaque)
primary-600: #2563eb  (hover / ícones)
primary-700: #1d4ed8
primary-800: #1e40af  (backgrounds dark)
primary-900: #1e3a8a  (cards dark / dark base)
```

#### Accent - Azul (alias)
```
accent-50:  #eff6ff
accent-100: #dbeafe
accent-200: #bfdbfe
accent-300: #93c5fd
accent-400: #60a5fa
accent-500: #3b82f6
accent-600: #2563eb
```

#### Semânticas
```
Sucesso (receitas):  emerald-500 (#10b981), green-500 (#22c55e)
Erro (despesas):     red-600 (#dc2626)  (uso preferencial — tom mais acessível para texto e indicadores)
Alerta:              amber-500 (#f59e0b), yellow-500 (#eab308)
```

**Diretrizes de uso para cor de erro (acessibilidade)**
- Use `text-red-600` para mensagens de erro inline e ícones.
- Para maior contraste em textos importantes use `text-red-700` ou `text-red-800`.
- Para fundos leves use `bg-red-50` ou `bg-red-100` e prefira `text-red-600` para o texto.
- Use `focus:ring-red-600` para estados de foco e `hover:bg-red-700` para ações críticas.


---

## Temas (Light/Dark)

### Configuração
- Dark mode habilitado via classe `.dark` no `<html>`
- CSS: `@custom-variant dark (&:where(.dark, .dark *));`
- Store: `src/store/themeStore.ts`
- Provider: `src/components/providers/ThemeProvider.tsx`

### Padrão de Classes
```tsx
// Superfícies padrão (cards / containers)
className="bg-white dark:bg-slate-900"
className="border border-slate-200 dark:border-slate-800"

// Texto base
className="text-slate-900 dark:text-slate-50"      // primário
className="text-slate-600 dark:text-slate-300"     // secundário
className="text-slate-500 dark:text-slate-400"     // terciário

// Acentos (usar azul para chamadas e links)
className="text-primary-600 dark:text-primary-400"
className="hover:bg-slate-50 dark:hover:bg-slate-800"
```

---

## Componentes Base

### Card (AnimatedCard)
**Arquivo**: `src/components/ui/AnimatedCard.tsx`

```tsx
<AnimatedCard delay={0.3} padding="lg">
  {children}
</AnimatedCard>
```

**Classes padrão**:
```css
bg-white dark:bg-slate-900
border border-slate-200 dark:border-slate-800
rounded-xl
p-6 (padding lg)
```

### StatCard
**Arquivo**: `src/components/dashboard/StatCard.tsx`

```tsx
<StatCard
  title="Receitas do mês"
  value="R$ 5.000,00"
  icon={<TrendingUp size={24} />}
  loading={false}
  index={0}  // para stagger animation
  trend={{ value: 12, positive: true }}  // opcional
/>
```

**Layout**: Horizontal compacto
- Ícone à esquerda (cor neutra: `text-slate-400 dark:text-slate-500`)
- Conteúdo à direita (título + valor)
- Hover: `scale: 1.02`

### SectionHeader
**Arquivo**: `src/components/ui/SectionHeader.tsx`

```tsx
<SectionHeader
  title="Transações recentes"
  action={{
    label: 'Ver todas',
    onClick: () => navigate('/transactions')
  }}
/>
```

### PremiumEmptyState
**Arquivo**: `src/components/common/PremiumEmptyState.tsx`

```tsx
<PremiumEmptyState
  icon={Receipt}
  title="Nenhuma transação"
  description="Suas transações aparecerão aqui"
  action={{
    label: 'Adicionar',
    onClick: () => {}
  }}
/>
```

### ThemeToggle
**Arquivo**: `src/components/ui/ThemeToggle.tsx`

Botão animado com ícones Sun/Moon para alternar tema.

---

## Animações (Framer Motion)

### Diretrizes
- **Duração**: 300-400ms (micro), 600-800ms (reveals)
- **Easing**: `[0.25, 0.46, 0.45, 0.94]` (ease-out suave)
- **Stagger**: 50-100ms entre itens
- **Hover scale**: máx 1.02-1.05
- **Entrada**: fade + translateY (de baixo para cima)

### Container com Stagger
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>
```

### Animação de Entrada Individual
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.4,
    delay: index * 0.1,
    ease: [0.25, 0.46, 0.45, 0.94],
  }}
>
```

### Hover Scale
```tsx
<motion.div whileHover={{ scale: 1.02 }}>
```

### Barras Animadas (Charts)
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{
    duration: 0.8,
    delay: 0.2 + index * 0.08,
    ease: [0.25, 0.46, 0.45, 0.94],
  }}
/>
```

---

## Tipografia

### Hierarquia
```css
/* Títulos de página */
text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50

/* Títulos de seção */
text-base font-semibold text-slate-900 dark:text-slate-100

/* Labels (uppercase) */
text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400

/* Valores grandes */
text-2xl font-semibold tracking-tight

/* Corpo */
text-sm text-slate-700 dark:text-slate-200

/* Texto secundário */
text-sm text-slate-500 dark:text-slate-400

/* Números tabulares */
tabular-nums (para alinhamento de números)
```

### Font Family
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

---

## Espaçamento

### Padding
```
p-3   (12px) - itens pequenos
p-4   (16px) - itens médios
p-5   (20px) - cards compactos
p-6   (24px) - cards padrão
```

### Gap
```
gap-1   (4px)  - inline elements
gap-3   (12px) - lista de itens
gap-4   (16px) - grid de cards
gap-6   (24px) - seções
gap-8   (32px) - seções maiores
```

### Margin
```
mb-1   (4px)  - entre label e valor
mb-4   (16px) - entre header e conteúdo
mt-1   (4px)  - trends
space-y-3     - lista vertical
space-y-8     - seções da página
```

---

## Border Radius

```
rounded-lg    (8px)  - itens, badges
rounded-xl    (12px) - cards
rounded-2xl   (16px) - navbar, modais
rounded-full  (50%)  - avatares, indicadores
```

---

## Shadows

```css
/* Cards */
shadow-sm

/* Navbar */
shadow-lg shadow-primary-200/50 dark:shadow-primary-900/50

/* Elementos ativos */
shadow-lg shadow-primary-300/40 dark:shadow-primary-700/40
```

---

## Layout

### Container Principal
```tsx
<main className="min-h-screen px-4 lg:px-8 xl:px-16 pt-8 pb-28 max-w-7xl mx-auto">
```

### Grid Responsivo
```tsx
// 4 colunas (stats)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// 2 colunas (conteúdo)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

---

## Loading States

### Skeleton
```tsx
<div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
```

### Skeleton para Cards
```tsx
<div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
```

### Skeleton para Barras
```tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
  </div>
  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
</div>
```

---

## Gráficos

### CategoryBarChart
**Arquivo**: `src/components/charts/CategoryBarChart.tsx`

Barras horizontais animadas para comparação de categorias.

```tsx
<CategoryBarChart
  data={[
    { name: 'Alimentação', value: 1500, color: '#ef4444' },
    { name: 'Transporte', value: 800, color: '#3b82f6' },
  ]}
  height={250}
/>
```

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── charts/
│   │   └── CategoryBarChart.tsx
│   ├── common/
│   │   └── PremiumEmptyState.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── BudgetAlert.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── FloatingNavbar.tsx
│   │   └── PrivateRoute.tsx
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   └── ui/
│       ├── AnimatedCard.tsx
│       ├── SectionHeader.tsx
│       ├── ThemeToggle.tsx
│       └── ...
├── store/
│   └── themeStore.ts
└── index.css (cores e tema)
```

---

## Checklist para Novos Componentes

- [ ] Suporta dark mode (`dark:` classes)
- [ ] Usa neutros slate como base e azul como acento
- [ ] Tem animação de entrada (Framer Motion)
- [ ] Segue hierarquia tipográfica
- [ ] Tem loading state (skeleton)
- [ ] Tem empty state (PremiumEmptyState)
- [ ] Responsivo (mobile-first)
- [ ] Sem gradients
- [ ] Hover sutil (scale 1.02 máx)

---

## Exemplos de Uso

### Página Completa
```tsx
import { motion } from 'framer-motion'
import { MainLayout } from '../components/layout'
import { AnimatedCard } from '../components/ui/AnimatedCard'
import { SectionHeader } from '../components/ui/SectionHeader'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function MyPage() {
  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Título da Página
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Descrição da página
          </p>
        </motion.div>

        {/* Content */}
        <AnimatedCard delay={0.2}>
          <SectionHeader title="Seção" />
          {/* conteúdo */}
        </AnimatedCard>
      </motion.div>
    </MainLayout>
  )
}
```

---

## FloatingNavbar

**Arquivo**: `src/components/layout/FloatingNavbar.tsx`

### Características
- Navbar fixa no bottom da tela
- Glass morphism: `bg-white/90 backdrop-blur-xl`
- Sem gradients - cores sólidas
- Animação de entrada staggered
- `layoutId` para transição suave do indicador ativo

### Animações
- **Entrada**: Fade + slide up com stagger nos itens
- **Hover**: Scale 1.05 + background fade in (usar `bg-slate-200` / `dark:bg-slate-800/60` para contraste acessível)
- **Logout hover**: Use um vermelho suave para indicar ação crítica — `bg-red-50` / `dark:bg-red-900/20` com `text-red-600` para o ícone (contraste acessível).
- **Ativo**: Background animado via `layoutId`, ícone sobe 2px
- **Tooltip**: Fade + scale com arrow

### Estrutura
```tsx
<motion.nav variants={navbarVariants}>
  {navigation.map((item) => (
    <NavItem key={item.name} item={item} isActive={isActive} />
  ))}
  <Divider />
  <ThemeToggle />
  <Divider />
  <LogoutButton />
</motion.nav>
```

### NavItem Component
- Usa `layoutId="activeNavBackground"` para animação do indicador
- Tooltip com AnimatePresence para entrada/saída suave
- Indicador dot animado no bottom

---

## Atualizações

| Data | Mudança |
|------|---------|
| 2025-01 | Criação do design system |
| 2025-01 | Paleta Slate/Blue implementada |
| 2025-01 | Dark mode via CSS custom-variant |
| 2025-01 | Framer Motion para animações |
| 2025-01 | FloatingNavbar redesenhada com Framer Motion |
