import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../../components/layout'
import { useTransactionsStore } from '../../store/transactionsStore'
import { useBudgetsStore } from '../../store/budgetsStore'
import { investmentsService } from '../../services/investments'
import { transactionsService } from '../../services/transactions'
import PieChart from '../../components/charts/PieChart'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react'

const StatCard: React.FC<{
  title: string
  value: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color: string
  loading?: boolean
}> = ({ title, value, icon, trend, color, loading }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        {trend && !loading && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}% vs mês anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // Stores
  const {
    transactions,
    summary,
    fetchTransactions,
    fetchSummary,
  } = useTransactionsStore()

  const {
    budgets,
    fetchBudgets,
  } = useBudgetsStore()

  // Local state
  const [investmentsTotal, setInvestmentsTotal] = React.useState<number | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    transactions?: string
    summary?: string
    budgets?: string
    investments?: string
    categories?: string
  }>({})

  type CategoryData = {
    category_name?: string
    total: number
    category_color?: string
  }

  const [categoryData, setCategoryData] = React.useState<CategoryData[]>([])

  // Get current month dates
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

  // Fetch all data in parallel on mount
  useEffect(() => {
    let mounted = true

    const loadDashboardData = async () => {
      if (!mounted) return

      setIsLoadingDashboard(true)
      setErrors({})

      // Parallelize all API calls using Promise.allSettled
      const results = await Promise.allSettled([
        // 1. Fetch transactions for current month
        fetchTransactions({
          start_date: startDate,
          end_date: endDate,
        }),
        
        // 2. Fetch summary for current month
        fetchSummary(startDate, endDate),
        
        // 3. Fetch budgets for current month
        fetchBudgets(currentMonth, currentYear),
        
        // 4. Fetch investments total
        investmentsService.getMonthlyTotal(currentMonth, currentYear),
        
        // 5. Fetch transactions by category
        transactionsService.getByCategory(startDate, endDate),
      ])

      if (!mounted) return

      // Handle results individually
      const newErrors: typeof errors = {}

      // Result 0: Transactions
      if (results[0].status === 'rejected') {
        newErrors.transactions = 'Erro ao carregar transações'
      }

      // Result 1: Summary
      if (results[1].status === 'rejected') {
        newErrors.summary = 'Erro ao carregar resumo'
      }

      // Result 2: Budgets
      if (results[2].status === 'rejected') {
        newErrors.budgets = 'Erro ao carregar orçamentos'
      }

      // Result 3: Investments
      if (results[3].status === 'fulfilled') {
        setInvestmentsTotal(results[3].value)
      } else {
        newErrors.investments = 'Erro ao carregar investimentos'
        setInvestmentsTotal(0)
      }

      // Result 4: Categories
      if (results[4].status === 'fulfilled') {
        setCategoryData(results[4].value as CategoryData[])
      } else {
        newErrors.categories = 'Erro ao carregar categorias'
        setCategoryData([])
      }

      setErrors(newErrors)
      setIsLoadingDashboard(false)
    }

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [fetchTransactions, fetchSummary, fetchBudgets, currentMonth, currentYear, startDate, endDate])

  // Fetch transactions by category is defined above using React.useCallback

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    return categoryData.map((item) => ({
      name: item.category_name || 'Sem categoria',
      value: item.total,
      color: item.category_color || '#6b7280',
    }))
  }, [categoryData])

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  // Get budget alerts (> 80%)
  const budgetAlerts = useMemo(() => {
    return budgets.filter((budget) => {
      const percentage = budget.percentage !== undefined 
        ? budget.percentage 
        : budget.spent && budget.amount 
          ? (budget.spent / budget.amount) * 100 
          : 0
      return percentage > 80
    })
  }, [budgets])

  const isLoading = isLoadingDashboard
  const hasTransactionsError = errors.transactions || errors.summary
  const hasCategoriesError = errors.categories

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral das suas finanças</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receitas do mês"
            value={summary ? formatCurrency(summary.total_income) : 'R$ 0,00'}
            icon={<TrendingUp size={24} className="text-green-600" />}
            color="bg-green-50"
            loading={isLoadingDashboard}
          />
          <StatCard
            title="Despesas do mês"
            value={summary ? formatCurrency(summary.total_expense) : 'R$ 0,00'}
            icon={<TrendingDown size={24} className="text-red-600" />}
            color="bg-red-50"
            loading={isLoadingDashboard}
          />
          <StatCard
            title="Saldo atual"
            value={summary ? formatCurrency(summary.balance) : 'R$ 0,00'}
            icon={<Wallet size={24} className="text-indigo-600" />}
            color="bg-indigo-50"
            loading={isLoadingDashboard}
          />
          <StatCard
            title="Investimentos"
            value={investmentsTotal !== null ? formatCurrency(investmentsTotal) : 'R$ 0,00'}
            icon={<PiggyBank size={24} className="text-amber-600" />}
            color="bg-amber-50"
            loading={isLoadingDashboard}
          />
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por categoria</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Carregando gráfico...</div>
              </div>
            ) : hasCategoriesError ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-red-200 rounded-lg">
                <p className="text-red-400">{errors.categories}</p>
              </div>
            ) : pieChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-400">Nenhum gasto registrado este mês</p>
              </div>
            ) : (
              <PieChart data={pieChartData} height={250} />
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transações recentes</h3>
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Ver todas
                <ArrowRight size={14} />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : hasTransactionsError ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-red-200 rounded-lg">
                <p className="text-red-400">{errors.transactions || errors.summary}</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-400">Nenhuma transação recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                        {transaction.categories && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${transaction.categories.color}20`,
                              color: transaction.categories.color,
                            }}
                          >
                            {transaction.categories.icon} {transaction.categories.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {transaction.description || 'Sem descrição'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        -{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Budget alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertas de orçamento</h3>
            <button
              onClick={() => navigate('/budgets')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Gerenciar
              <ArrowRight size={14} />
            </button>
          </div>
          {isLoadingDashboard ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : errors.budgets ? (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-red-200 rounded-lg">
              <p className="text-red-400">{errors.budgets}</p>
            </div>
          ) : budgetAlerts.length === 0 ? (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-400">Nenhum alerta de orçamento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetAlerts.map((budget) => {
                const percentage = budget.percentage !== undefined
                  ? budget.percentage
                  : budget.spent && budget.amount
                    ? Math.round((budget.spent / budget.amount) * 100)
                    : 0
                const categoryName = budget.category?.name || 'Orçamento Geral'

                return (
                  <div
                    key={budget.id}
                    className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <AlertTriangle size={20} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Você usou {percentage}% do orçamento de {categoryName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(budget.spent || 0)} de {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
