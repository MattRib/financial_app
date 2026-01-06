# Scripts de Manutenção

Este diretório contém scripts utilitários para manutenção do projeto.

## Remover Todos os Usuários

### Script TypeScript (Recomendado)

O script `remove-all-users.ts` remove automaticamente todos os usuários e seus dados associados do Supabase.

#### Pré-requisitos

- Node.js instalado
- Arquivo `.env` configurado com as credenciais do Supabase
- As seguintes variáveis de ambiente devem estar definidas:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### Como Executar

```bash
# Na raiz do projeto
npm run remove-users
```

#### O que o script faz

1. Deleta todos os dados das tabelas da aplicação:
   - `debts` (dívidas)
   - `goals` (metas)
   - `investments` (investimentos)
   - `budgets` (orçamentos)
   - `transactions` (transações)
   - `categories` (categorias)
   - `profiles` (perfis)

2. Lista todos os usuários do Supabase Auth

3. Deleta cada usuário usando a Admin API do Supabase

4. Exibe um resumo das operações realizadas

#### Recursos de Segurança

- **Confirmação obrigatória**: O script solicita confirmação antes de executar
- **Logging detalhado**: Mostra o progresso de cada operação
- **Tratamento de erros**: Relata erros sem interromper o processo completo

#### Saída Esperada

```
⚠️  WARNING: This will permanently delete ALL users and their data!
⚠️  This action CANNOT be undone!

Are you sure you want to continue? (yes/no): yes

🗑️  Starting removal of all users and their data...

📊 Deleting user data from application tables...
   ✅ Deleted all records from debts
   ✅ Deleted all records from goals
   ✅ Deleted all records from investments
   ✅ Deleted all records from budgets
   ✅ Deleted all records from transactions
   ✅ Deleted all records from categories
   ✅ Deleted all records from profiles

👥 Fetching all users from Supabase Auth...
   Found 2 user(s)

🗑️  Deleting users from Supabase Auth...
   ✅ Deleted user: user1@example.com
   ✅ Deleted user: user2@example.com

==================================================
📋 Summary:
   ✅ Successfully deleted: 2 user(s)
   ✅ All user data removed from application tables
==================================================
```

### Script SQL (Alternativo)

Se preferir executar manualmente via SQL Editor do Supabase:

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o arquivo `supabase/remove_all_users.sql`

**Nota**: O script SQL remove apenas os dados das tabelas da aplicação. Para remover usuários do `auth.users`, você precisará:
- Usar o Dashboard do Supabase (Authentication > Users)
- Ou executar com privilégios de service role

## Aviso

⚠️ **ATENÇÃO**: Estas operações são irreversíveis! Certifique-se de ter backups antes de executar.
