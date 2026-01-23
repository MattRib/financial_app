# Backend API - CLAUDE.md

Documentação específica do backend NestJS para o Claude Code.

## Stack Tecnológica

- **NestJS 11** + **TypeScript**
- **Supabase** (PostgreSQL + Auth)
- **class-validator** + **class-transformer** (validação)
- **Swagger** (documentação API)
- **Jest** (testes)

## Estrutura de Diretórios

```
finances-api/
├── src/
│   ├── main.ts                  # Bootstrap da aplicação
│   ├── app.module.ts            # Módulo raiz
│   ├── app.controller.ts        # Controller raiz (redirect → /docs)
│   ├── app.service.ts           # Service raiz
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Guard principal de autenticação
│   │   │   └── supabase-auth.guard.ts  # Guard Supabase específico
│   │   ├── decorators/
│   │   │   └── user.decorator.ts       # @CurrentUser() decorator
│   │   └── types/
│   │       └── database.types.ts       # Tipos do banco
│   │
│   ├── config/
│   │   └── supabase.module.ts   # Factory do cliente Supabase
│   │
│   └── modules/
│       ├── auth/                # Autenticação
│       ├── profiles/            # Perfis de usuário
│       ├── categories/          # Categorias (receita/despesa/investimento)
│       ├── transactions/        # Transações financeiras
│       ├── budgets/             # Orçamentos mensais
│       ├── investments/         # Carteira de investimentos
│       ├── goals/               # Metas financeiras
│       └── debts/               # Gestão de dívidas
│
├── supabase/
│   └── migrations/              # Migrações SQL
│
├── test/                        # Testes e2e
├── dist/                        # Build output
└── coverage/                    # Coverage reports
```

## Estrutura de Módulo

Cada módulo em `src/modules/` segue este padrão:

```
modules/<domain>/
├── <domain>.module.ts           # Configuração do módulo
├── <domain>.controller.ts       # Endpoints REST
├── <domain>.service.ts          # Lógica de negócio
├── <domain>.controller.spec.ts  # Testes do controller
├── <domain>.service.spec.ts     # Testes do service
├── dto/
│   ├── create-<domain>.dto.ts   # DTO de criação
│   ├── update-<domain>.dto.ts   # DTO de atualização
│   └── index.ts                 # Exports
└── entities/
    └── <domain>.entity.ts       # Definição da entidade
```

## Arquivos Críticos

### `main.ts` - Bootstrap

```typescript
// Configurações importantes:
app.setGlobalPrefix('api');                    // Prefixo /api em todas as rotas
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,                             // Remove props não declaradas
  transform: true,                             // Auto-transform tipos
}));
app.enableCors({ origin: CORS_ORIGINS });      // CORS configurável

// Swagger em /docs (ignora prefixo global)
SwaggerModule.setup('docs', app, document, { ignoreGlobalPrefix: true });
```

### `common/guards/auth.guard.ts` - Autenticação

```typescript
// Uso no controller:
@UseGuards(AuthGuard)
@Controller('domain')
export class DomainController { ... }

// O guard:
// 1. Extrai token do header Authorization: Bearer <token>
// 2. Valida token com Supabase
// 3. Anexa user ao request
// 4. Rejeita com 401 se inválido
```

### `common/decorators/user.decorator.ts`

```typescript
// Uso:
@Get()
findAll(@CurrentUser() userId: string) {
  return this.service.findAll(userId);
}
```

### `config/supabase.module.ts`

```typescript
// Provê SUPABASE_CLIENT globalmente
// Usa SUPABASE_SERVICE_ROLE_KEY para operações elevadas

// Injeção:
constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}
```

## Padrões de Código

### Controller

```typescript
@ApiTags('domain')
@UseGuards(AuthGuard)
@Controller('domain')
export class DomainController {
  constructor(private readonly service: DomainService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os items' })
  @ApiResponse({ status: 200, type: [DomainEntity] })
  findAll(@CurrentUser() userId: string) {
    return this.service.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria novo item' })
  @ApiResponse({ status: 201, type: DomainEntity })
  create(@CurrentUser() userId: string, @Body() dto: CreateDomainDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza item' })
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDomainDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove item' })
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
```

### Service

```typescript
@Injectable()
export class DomainService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('domain')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(userId: string, dto: CreateDomainDto) {
    const { data, error } = await this.supabase
      .from('domain')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(userId: string, id: string, dto: UpdateDomainDto) {
    const { data, error } = await this.supabase
      .from('domain')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)  // Segurança: só atualiza do próprio usuário
      .select()
      .single();

    if (error) throw new NotFoundException('Item não encontrado');
    return data;
  }

  async remove(userId: string, id: string) {
    const { error } = await this.supabase
      .from('domain')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new NotFoundException('Item não encontrado');
  }
}
```

### DTO

```typescript
// dto/create-domain.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateDomainDto {
  @ApiProperty({ description: 'Nome do item' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição opcional' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Valor', example: 100.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['type1', 'type2'] })
  @IsEnum(['type1', 'type2'])
  type: string;
}
```

```typescript
// dto/update-domain.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateDomainDto } from './create-domain.dto';

export class UpdateDomainDto extends PartialType(CreateDomainDto) {}
```

## Endpoints da API

Base URL: `http://localhost:3333/api`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/auth/me` | Dados do usuário autenticado |
| GET | `/profiles` | Perfil do usuário |
| PATCH | `/profiles` | Atualiza perfil |
| GET | `/categories` | Lista categorias |
| POST | `/categories` | Cria categoria |
| PATCH | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Remove categoria |
| GET | `/transactions` | Lista transações |
| POST | `/transactions` | Cria transação |
| PATCH | `/transactions/:id` | Atualiza transação |
| DELETE | `/transactions/:id` | Remove transação |
| GET | `/budgets` | Lista orçamentos |
| POST | `/budgets` | Cria orçamento |
| PATCH | `/budgets/:id` | Atualiza orçamento |
| DELETE | `/budgets/:id` | Remove orçamento |
| GET | `/investments` | Lista investimentos |
| POST | `/investments` | Cria investimento |
| PATCH | `/investments/:id` | Atualiza investimento |
| DELETE | `/investments/:id` | Remove investimento |
| GET | `/goals` | Lista metas |
| POST | `/goals` | Cria meta |
| PATCH | `/goals/:id` | Atualiza meta |
| DELETE | `/goals/:id` | Remove meta |
| GET | `/debts` | Lista dívidas |
| POST | `/debts` | Cria dívida |
| PATCH | `/debts/:id` | Atualiza dívida |
| DELETE | `/debts/:id` | Remove dívida |

## Comandos

```powershell
npm run start:dev     # Dev server com hot reload: http://localhost:3333
npm run build         # Build para produção
npm run start:prod    # Executa build de produção
npm run lint          # ESLint com auto-fix
npm test              # Jest
npm run test:watch    # Jest watch mode
npm run test:cov      # Jest com coverage
npm run test:debug    # Jest debug mode

# Supabase
npm run supabase:push           # Aplica migrações pendentes
npm run supabase:apply-profiles # Aplica migração de profiles
npx supabase login              # Login no Supabase CLI
npx supabase link --project-ref <REF>  # Vincula projeto
```

## Variáveis de Ambiente

Lidas do `.env` na raiz do projeto:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Chave com permissões elevadas
PORT=3333                           # Porta do servidor (default: 3333)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Tratamento de Erros

Usar exceções NestJS padrão:

```typescript
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// Exemplos:
throw new NotFoundException('Item não encontrado');
throw new UnauthorizedException('Token inválido');
throw new BadRequestException('Dados inválidos');
throw new InternalServerErrorException('Erro no banco de dados');
```

## Swagger

- **URL**: `http://localhost:3333/docs`
- Decorators obrigatórios em controllers:
  - `@ApiTags('tag')` - Agrupa endpoints
  - `@ApiOperation({ summary: '...' })` - Descrição
  - `@ApiResponse({ status: 200, type: Entity })` - Resposta esperada
- DTOs devem ter `@ApiProperty()` em todas as props

## Convenções

1. **Nomes de arquivos**: kebab-case (ex: `create-category.dto.ts`)
2. **Classe DTO**: PascalCase com sufixo Dto (ex: `CreateCategoryDto`)
3. **Validação**: Sempre usar class-validator decorators
4. **Segurança**: Sempre filtrar por `user_id` nas queries
5. **Testes**: Cada controller e service deve ter `.spec.ts`
6. **HTTP codes**: 200 (GET), 201 (POST), 204 (DELETE)

## Adicionando Novo Módulo

1. Criar estrutura de pastas em `src/modules/<domain>/`
2. Criar entity em `entities/<domain>.entity.ts`
3. Criar DTOs em `dto/`
4. Criar service com injeção do Supabase client
5. Criar controller com guards e swagger decorators
6. Criar module e importar no `app.module.ts`
7. Criar migração SQL em `supabase/migrations/`
8. Escrever testes `.spec.ts`
9. Executar `npm run supabase:push` para aplicar migração

## Migrações Supabase

Arquivos SQL em `supabase/migrations/`:

```sql
-- Exemplo: 20240101000000_create_domain.sql
CREATE TABLE domain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE domain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own data"
  ON domain FOR ALL
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_domain_user_id ON domain(user_id);
```

## Notas Importantes

- **Service Role Key**: Nunca expor no frontend, apenas backend
- **RLS**: Supabase tem Row Level Security, mas API também valida
- **user_id**: Sempre extrair do JWT, nunca confiar no body
- **Validação**: `whitelist: true` remove props não declaradas no DTO
- **Testes**: Mockar Supabase client nos testes unitários
