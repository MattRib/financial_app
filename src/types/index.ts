// Category
export type CategoryType = 'income' | 'expense' | 'investment'

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  created_at: string
}

export interface CreateCategoryDto {
  name: string
  type: CategoryType
  color?: string
  icon?: string
}

export interface UpdateCategoryDto {
  name?: string
  type?: CategoryType
  color?: string
  icon?: string
}

// Transaction
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  date: string
  tags: string[]
  attachment_url: string | null
  created_at: string

  // Account field
  account_id: string
  
  // Transfer fields (only for transfers with transfer_id)
  from_account_id?: string | null
  to_account_id?: string | null
  transfer_id?: string | null
  
  // Installment fields
  installment_group_id?: string | null
  installment_number?: number | null
  total_installments?: number | null

  // Recurring expense fields
  recurring_group_id?: string | null
  recurring_number?: number | null
  total_recurrences?: number | null
  is_recurring?: boolean

  categories?: {
    name: string
    color: string
    icon: string
  }
}

export interface CreateTransactionDto {
  amount: number
  type: TransactionType
  category_id?: string
  description?: string
  date: string
  tags?: string[]
  total_installments?: number
  account_id: string
}

export interface UpdateTransactionDto {
  amount?: number
  type?: TransactionType
  category_id?: string
  description?: string
  date?: string
  tags?: string[]
  account_id?: string
}

export interface TransactionFilters {
  type?: TransactionType
  category_id?: string
  start_date?: string
  end_date?: string
  account_id?: string
}

export interface TransactionSummary {
  total_income: number
  total_expense: number
  balance: number
}

export interface CategorySummary {
  category_id: string
  category_name: string
  category_color: string
  total: number
  percentage: number
}

export interface InstallmentGroupSummary {
  installment_group_id: string
  description: string
  category?: { name: string; color: string; icon: string } | null
  total_installments: number
  paid_installments: number
  monthly_amount: number
  total_amount: number
  remaining_amount: number
  first_date: string
  last_date: string
  type: TransactionType
}

// Recurring Expenses
export interface RecurringExpenseSummary {
  recurring_group_id: string
  description: string
  category?: { name: string; color: string; icon: string } | null
  total_recurrences: number
  completed_recurrences: number
  pending_recurrences: number
  monthly_amount: number
  total_amount: number
  paid_amount: number
  remaining_amount: number
  first_date: string
  last_date: string
  type: TransactionType
  is_active: boolean
}

export interface CreateRecurringExpenseDto {
  amount: number
  type: TransactionType
  category_id?: string
  description: string
  start_date: string
  tags?: string[]
  account_id: string
  attachment_url?: string
  total_recurrences: number
}

// OFX Import
export interface ParsedOfxTransaction {
  description: string
  amount: number
  date: string
  type: TransactionType
  suggested_category_id?: string
}

export interface OfxPreview {
  total_transactions: number
  transactions: ParsedOfxTransaction[]
  duplicates: number[]
}

export interface OfxImportConfirm {
  transactions: CreateTransactionDto[]
}

// Budget
export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  month: number
  year: number
  created_at: string
  spent?: number
  remaining?: number
  percentage?: number
  category?: {
    name: string
    color: string
    icon: string
  }
}

export interface BudgetOverview {
  total_budget: number
  total_spent: number
  total_remaining: number
  percentage: number
  budgets: Budget[]
}

export interface CreateBudgetDto {
  category_id?: string
  amount: number
  month: number
  year: number
}

export interface UpdateBudgetDto {
  category_id?: string
  amount?: number
  month?: number
  year?: number
}

// Investment
export type InvestmentType = 'renda_fixa' | 'renda_variavel' | 'cripto' | 'outros'

export interface Investment {
  id: string
  user_id: string
  type: InvestmentType
  name: string
  amount: number
  date: string
  notes: string | null
  created_at: string
}

export interface CreateInvestmentDto {
  type: InvestmentType
  name: string
  amount: number
  date: string
  notes?: string
}

export interface UpdateInvestmentDto {
  type?: InvestmentType
  name?: string
  amount?: number
  date?: string
  notes?: string
}

// Goal
export type GoalStatus = 'active' | 'completed' | 'cancelled'

export const GoalCategoryValues = [
  'emergency_fund',
  'travel',
  'purchase',
  'debt_payoff',
  'investment',
  'education',
  'retirement',
  'other',
] as const

export type GoalCategory = (typeof GoalCategoryValues)[number]

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  status: GoalStatus
  category?: GoalCategory
  notes?: string
  created_at: string
}

export interface GoalWithProgress extends Goal {
  progress_percentage: number
  days_remaining: number
}

export interface GoalSummary {
  total_target: number
  current_amount: number
  remaining: number
  progress_percentage: number
  by_status: {
    active: { count: number; total: number }
    completed: { count: number; total: number }
    cancelled: { count: number; total: number }
  }
}

export interface FilterGoalDto {
  status?: GoalStatus
  target_date_start?: string
  target_date_end?: string
  category?: GoalCategory
}

export interface CreateGoalDto {
  name: string
  target_amount: number
  current_amount?: number
  target_date: string
  status?: GoalStatus
  category?: GoalCategory
  notes?: string
}

export interface UpdateGoalDto {
  name?: string
  target_amount?: number
  current_amount?: number
  target_date?: string
  status?: GoalStatus
  category?: GoalCategory
  notes?: string
}

// Debt
export type DebtStatus = 'pending' | 'paid' | 'overdue'

export interface Debt {
  id: string
  user_id: string
  name: string
  amount: number
  due_date: string
  status: DebtStatus
  amount_paid: number
  creditor?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface DebtSummary {
  total_debt: number
  total_paid: number
  remaining: number
  by_status: {
    pending: { count: number; total: number }
    paid: { count: number; total: number }
    overdue: { count: number; total: number }
  }
}

export interface FilterDebtDto {
  status?: DebtStatus
  due_date_start?: string
  due_date_end?: string
}

export interface CreateDebtDto {
  name: string
  amount: number
  due_date: string
  status?: DebtStatus
  amount_paid?: number
  creditor?: string
  notes?: string
}

export interface UpdateDebtDto {
  name?: string
  amount?: number
  due_date?: string
  status?: DebtStatus
  amount_paid?: number
  creditor?: string
  notes?: string
}

// Profile & Settings
export interface Profile {
  id: string
  username?: string | null
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  role?: string | null
  currency?: string | null
  locale?: string | null
  date_format?: string | null
  email_notifications?: boolean | null
  push_notifications?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface UpdateProfileDto {
  username?: string
  full_name?: string
  avatar_url?: string
  currency?: string
  locale?: string
  date_format?: string
  email_notifications?: boolean
  push_notifications?: boolean
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

// Insights
export interface InsightReport {
  summary: {
    spending_pattern: string
    financial_health: 'excellent' | 'good' | 'moderate' | 'warning' | 'critical'
    balance_trend: 'positive' | 'neutral' | 'negative'
  }
  insights: Array<{
    title: string
    description: string
    category?: string
    impact: 'high' | 'medium' | 'low'
    type: 'observation' | 'warning' | 'opportunity'
  }>
  recommendations: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    estimated_savings?: number
  }>
  top_categories: Array<{
    category_name: string
    amount: number
    percentage: number
  }>
}

export interface Insight {
  id: string
  user_id: string
  month: number
  year: number
  generated_at: string
  total_income: number
  total_expense: number
  balance: number
  transactions_count: number
  report_data: InsightReport
  model_used: string
  tokens_used?: number
  generation_time_ms?: number
  created_at: string
}

export interface GenerateInsightDto {
  month: number
  year: number
}

export interface FilterInsightDto {
  month?: number
  year?: number
}

// Account
export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'cash'
  | 'investment'
  | 'other'

export const AccountTypeLabels: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro',
  investment: 'Investimento',
  other: 'Outro',
}

export const AccountTypeIcons: Record<AccountType, string> = {
  checking: '🏦',
  savings: '🐷',
  credit_card: '💳',
  cash: '💵',
  investment: '📈',
  other: '📁',
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  credit_limit?: number | null
  closing_day?: number | null
  due_day?: number | null
  color: string
  icon: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreditCardInvoice {
  period_start: string
  period_end: string
  closing_day: number
  due_day?: number | null
  total: number
  is_paid: boolean
  paid_at?: string | null
  transactions?: Array<{
    id: string
    date: string
    amount: number
    description: string | null
    category?: { name: string; color: string; icon: string } | null
  }>
}

export interface AccountSummary {
  total_accounts: number
  by_type: Array<{
    type: AccountType
    count: number
  }>
}

export interface CreateAccountDto {
  name: string
  type: AccountType
  credit_limit?: number
  closing_day?: number
  due_day?: number
  color?: string
  icon?: string
  notes?: string
}

export interface UpdateAccountDto {
  name?: string
  type?: AccountType
  credit_limit?: number
  closing_day?: number
  due_day?: number
  color?: string
  icon?: string
  is_active?: boolean
  notes?: string
}

export interface FilterAccountDto {
  type?: AccountType
  is_active?: boolean
}

// Transaction Filters - Date modes and presets
export type DateFilterMode = 'month' | 'custom'

export type DatePreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'last-year'
