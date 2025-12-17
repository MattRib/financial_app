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
}

export interface UpdateTransactionDto {
  amount?: number
  type?: TransactionType
  category_id?: string
  description?: string
  date?: string
  tags?: string[]
}

export interface TransactionFilters {
  type?: TransactionType
  category_id?: string
  start_date?: string
  end_date?: string
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

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  status: GoalStatus
  category?: string
  notes?: string
  created_at: string
}

export interface CreateGoalDto {
  name: string
  target_amount: number
  target_date: string
  category?: string
  notes?: string
}

export interface UpdateGoalDto {
  name?: string
  target_amount?: number
  current_amount?: number
  target_date?: string
  status?: GoalStatus
  category?: string
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
}

export interface CreateDebtDto {
  name: string
  amount: number
  due_date: string
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
