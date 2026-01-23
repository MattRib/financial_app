# Frontend - CLAUDE.md

Documentação específica do frontend React para o Claude Code.

## Stack Tecnológica

- **React 19** + **TypeScript**
- **Vite** (rolldown-vite@7.2.5)
- **Zustand** (state management)
- **Tailwind CSS v4** (PostCSS plugin)
- **React Router v7**
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **date-fns** (manipulação de datas)

## Estrutura de Diretórios

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Router principal
├── index.css                # Tailwind imports
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Navegação superior
│   │   ├── Sidebar.tsx      # Menu lateral
│   │   ├── MainLayout.tsx   # Layout wrapper
│   │   └── PrivateRoute.tsx # Proteção de rotas autenticadas
│   ├── ui/                  # Componentes UI reutilizáveis
│   ├── charts/              # Componentes de gráficos
│   └── common/              # Componentes compartilhados
│
├── pages/
│   ├── Auth/                # Login, Register
│   ├── Dashboard/           # Dashboard principal
│   ├── Transactions/        # Gestão de transações
│   ├── categories/          # Gestão de categorias
│   ├── Budgets/             # Orçamentos mensais
│   ├── Investments/         # Carteira de investimentos
│   ├── Goals/               # Metas financeiras
│   ├── Debts/               # Gestão de dívidas
│   ├── Insights/            # Analytics e tendências
│   └── settings/            # Configurações do usuário
│
├── store/                   # Zustand stores
│   ├── authStore.ts         # Autenticação e sessão
│   ├── categoriesStore.ts   # Estado de categorias
│   ├── transactionsStore.ts # Estado de transações
│   ├── budgetsStore.ts      # Estado de orçamentos
│   ├── goalsStore.ts        # Estado de metas
│   └── investmentsStore.ts  # Estado de investimentos
│
├── services/                # Camada de API
│   ├── api.ts               # HTTP client centralizado
│   ├── supabase.ts          # Cliente Supabase
│   ├── categories.ts        # API de categorias
│   ├── transactions.ts      # API de transações
│   ├── budgets.ts           # API de orçamentos
│   ├── investments.ts       # API de investimentos
│   ├── debts.ts             # API de dívidas
│   ├── goals.ts             # API de metas
│   └── insights.ts          # API de insights
│
├── types/
│   └── index.ts             # Interfaces TypeScript centralizadas
│
├── hooks/                   # Custom hooks
│   ├── useAsync.ts          # Data fetching
│   ├── useCategory.ts       # Lógica de categorias
│   ├── useBudget.ts         # Lógica de orçamentos
│   └── useTransaction.ts    # Lógica de transações
│
├── utils/                   # Funções utilitárias
│   ├── formatters.ts        # Formatação de dados
│   ├── validators.ts        # Validação de formulários
│   ├── currency.ts          # Utilitários de moeda
│   └── date.ts              # Utilitários de data
│
├── constants/               # Constantes da aplicação
│   ├── categories.ts        # Categorias padrão
│   ├── colors.ts            # Paleta de cores
│   └── navigation.ts        # Rotas de navegação
│
└── assets/                  # Imagens, ícones, etc.
```

## Arquivos Críticos

### `services/api.ts` - HTTP Client

```typescript
// Uso:
api.get<T>('/endpoint')
api.post<T>('/endpoint', data)
api.patch<T>('/endpoint', data)
api.delete('/endpoint')

// Comportamentos:
// - Injeta Authorization: Bearer <token> automaticamente
// - 401 → auto-logout e redirect para /auth/login
// - 204 → retorna undefined
// - Erros → throw HttpError(status, message, data)
```

### `store/authStore.ts` - Autenticação

```typescript
// Estado:
user: User | null
session: Session | null
isLoading: boolean

// Métodos:
signIn(email, password)
signUp(email, password)
signOut()
getAccessToken(): string | null  // Usado pelo api.ts
```

### `types/index.ts` - Interfaces

Contém todas as interfaces TypeScript que espelham os DTOs do backend:
- `Category`, `Transaction`, `Budget`
- `Investment`, `Goal`, `Debt`
- `Profile`, `User`

## Padrões de Código

### Componentes de Página

```typescript
// pages/Domain/DomainPage.tsx
export function DomainPage() {
  const { items, isLoading, fetchItems } = useDomainStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) return <Loading />;

  return <DomainList items={items} />;
}
```

### Zustand Store

```typescript
// store/domainStore.ts
interface DomainState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateItemDTO) => Promise<void>;
}

export const useDomainStore = create<DomainState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await domainService.getAll();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### Service Layer

```typescript
// services/domain.ts
export const domainService = {
  getAll: () => api.get<Item[]>('/domain'),
  getById: (id: string) => api.get<Item>(`/domain/${id}`),
  create: (data: CreateItemDTO) => api.post<Item>('/domain', data),
  update: (id: string, data: UpdateItemDTO) => api.patch<Item>(`/domain/${id}`, data),
  delete: (id: string) => api.delete(`/domain/${id}`),
};
```

## Rotas da Aplicação

| Rota | Componente | Autenticado |
|------|------------|-------------|
| `/auth/login` | Login | Não |
| `/auth/register` | Register | Não |
| `/` | Dashboard | Sim |
| `/transactions` | Transactions | Sim |
| `/categories` | Categories | Sim |
| `/budgets` | Budgets | Sim |
| `/investments` | Investments | Sim |
| `/goals` | Goals | Sim |
| `/debts` | Debts | Sim |
| `/insights` | Insights | Sim |
| `/settings` | Settings | Sim |

## Comandos

```powershell
npm run dev          # Dev server: http://localhost:5173
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm test             # Jest
npm run test:watch   # Jest watch mode
npm run test:cov     # Jest com coverage
```

## Variáveis de Ambiente

Arquivo `.env` na raiz do projeto (prefixo `VITE_` obrigatório):

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3333/api
```

## Convenções

1. **Nomes de arquivos**: PascalCase para componentes, camelCase para utils/services
2. **Exports**: Named exports (não default) para melhor tree-shaking
3. **Tipos**: Definir em `types/index.ts` para compartilhar
4. **Estado**: Usar Zustand stores, não prop drilling
5. **API calls**: Sempre através da camada de services
6. **Erros**: Tratar nos stores, mostrar feedback ao usuário

## Adicionando Nova Feature

1. Criar tipos em `types/index.ts`
2. Criar service em `services/<feature>.ts`
3. Criar store em `store/<feature>Store.ts`
4. Criar componentes em `components/` ou `pages/<Feature>/`
5. Adicionar rota em `App.tsx`
6. Escrever testes

## Notas Importantes

- **React 19**: Usar novas features como `use()` hook quando apropriado
- **Tailwind v4**: Classes utilitárias, evitar CSS custom
- **Vite**: Hot reload rápido, usar `import.meta.env` para env vars
- **Types**: Manter sincronizado com DTOs do backend
