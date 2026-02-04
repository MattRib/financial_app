import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { useTransactionsStore } from '../../store/transactionsStore'
import { useBudgetsStore } from '../../store/budgetsStore'
import { investmentsService } from '../../services/investments'
import { transactionsService } from '../../services/transactions'
import { CategoryBarChart } from '../../components/charts/CategoryBarChart'
import {
  StatCard,
  TransactionItem,
  BudgetAlert,
  DashboardFilters,
  InstallmentsCard,
} from '../../components/dashboard'
import { MonthlyExpensesChart } from './components/MonthlyExpensesChart'
import { AnimatedCard } from '../../components/ui/AnimatedCard'
import type { InstallmentGroupSummary } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  PieChart,
  AlertTriangle,
} from 'lucide-react'

// Animation variants
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // Stores
  const { transactions, summary, fetchTransactions, fetchSummary } =
    useTransactionsStore()

  const { budgets, fetchBudgets } = useBudgetsStore()

  // Local state
  const [month, setMonth] = React.useState(() => new Date().getMonth() + 1)
  const [year, setYear] = React.useState(() => new Date().getFullYear())
  const [investmentsTotal, setInvestmentsTotal] = React.useState<number | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = React.useState(false)
  const [installmentGroups, setInstallmentGroups] = React.useState<InstallmentGroupSummary[]>([])
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

  // Calculate dates based on selected month/year
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  // Month navigation functions
  const goToPrevMonth = () => {
    setMonth((current) => {
      if (current === 1) {
        setYear((y) => y - 1)
        return 12
      }
      return current - 1
    })
  }

  const goToNextMonth = () => {
    setMonth((current) => {
      if (current === 12) {
        setYear((y) => y + 1)
        return 1
      }
      return current + 1
    })
  }

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
        fetchBudgets(month, year),

        // 4. Fetch investments total
        investmentsService.getMonthlyTotal(month, year),

        // 5. Fetch transactions by category
        transactionsService.getByCategory(startDate, endDate),

        // 6. Fetch installment groups (only active ones)
        transactionsService.getInstallmentGroups(true),
      ])

      if (!mounted) return

      // Handle results individually
      const newErrors: typeof errors = {}

      // Result 0: Transactions
      if (results[0].status === 'rejected') {
        newErrors.transactions = 'Erro ao carregar transacoes'
      }

      // Result 1: Summary
      if (results[1].status === 'rejected') {
        newErrors.summary = 'Erro ao carregar resumo'
      }

      // Result 2: Budgets
      if (results[2].status === 'rejected') {
        newErrors.budgets = 'Erro ao carregar orcamentos'
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

      // Result 5: Installment Groups
      if (results[5].status === 'fulfilled') {
        const raw = results[5].value as InstallmentGroupSummary[]
        // Defensive client-side filter in case backend didn't filter
        const filtered = raw.filter(
          (g) => (g.paid_installments ?? 0) < (g.total_installments ?? 0) && (g.remaining_amount ?? 0) > 0,
        )
        setInstallmentGroups(filtered)
      } else {
        setInstallmentGroups([])
      }

      setErrors(newErrors)
      setIsLoadingDashboard(false)
    }

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [fetchTransactions, fetchSummary, fetchBudgets, month, year, startDate, endDate])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    return categoryData.map((item) => ({
      name: item.category_name || 'Sem categoria',
      value: item.total,
      color: item.category_color || '#64748b',
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
      const percentage =
        budget.percentage !== undefined
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
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visao geral das suas financas
          </p>
        </motion.div>

        {/* Period Filter */}
        <motion.div variants={itemVariants}>
          <DashboardFilters
            month={month}
            year={year}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
          />
        </motion.div>

        {/* Stats grid - horizontal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receitas do mes"
            value={summary ? formatCurrency(summary.total_income) : 'R$ 0,00'}
            icon={<TrendingUp size={24} />}
            loading={isLoadingDashboard}
            index={0}
          />
          <StatCard
            title="Despesas do mes"
            value={summary ? formatCurrency(summary.total_expense) : 'R$ 0,00'}
            icon={<TrendingDown size={24} />}
            loading={isLoadingDashboard}
            index={1}
          />
          <StatCard
            title="Saldo atual"
            value={summary ? formatCurrency(summary.balance) : 'R$ 0,00'}
            icon={<Wallet size={24} />}
            loading={isLoadingDashboard}
            index={2}
          />
          <StatCard
            title="Investimentos"
            value={investmentsTotal !== null ? formatCurrency(investmentsTotal) : 'R$ 0,00'}
            icon={<PiggyBank size={24} />}
            loading={isLoadingDashboard}
            index={3}
          />
        </div>

        {/* Monthly Expenses Chart */}
        <motion.div variants={itemVariants}>
          <MonthlyExpensesChart />
        </motion.div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <AnimatedCard delay={0.3}>
            <SectionHeader title="Gastos por categoria" />
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : hasCategoriesError ? (
              <PremiumEmptyState
                icon={PieChart}
                title="Erro ao carregar dados"
                description={errors.categories}
                minHeight={250}
              />
            ) : barChartData.length === 0 ? (
              <PremiumEmptyState
                icon={PieChart}
                title="Nenhum gasto registrado"
                description="Seus gastos por categoria aparecerão aqui"
                minHeight={250}
              />
            ) : (
              <CategoryBarChart data={barChartData} height={250} />
            )}
          </AnimatedCard>

          {/* Recent transactions */}
          <AnimatedCard delay={0.4}>
            <SectionHeader
              title="Transacoes recentes"
              action={{
                label: 'Ver todas',
                onClick: () => navigate('/transactions'),
              }}
            />
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : hasTransactionsError ? (
              <PremiumEmptyState
                icon={Receipt}
                title="Erro ao carregar transacoes"
                description={errors.transactions || errors.summary}
                minHeight={250}
              />
            ) : recentTransactions.length === 0 ? (
              <PremiumEmptyState
                icon={Receipt}
                title="Nenhuma transacao recente"
                description="Suas transacoes aparecerão aqui"
                action={{
                  label: 'Adicionar transacao',
                  onClick: () => navigate('/transactions'),
                }}
                minHeight={250}
              />
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    date={transaction.date}
                    description={transaction.description || ''}
                    amount={transaction.amount}
                    category={
                      transaction.categories
                        ? {
                            name: transaction.categories.name,
                            color: transaction.categories.color,
                            icon: transaction.categories.icon,
                          }
                        : undefined
                    }
                    index={index}
                  />
                ))}
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Installments Card */}
        <AnimatedCard delay={0.45}>
          <SectionHeader
            title="Compras parceladas"
            action={{
              label: 'Ver transacoes',
              onClick: () => navigate('/transactions'),
            }}
          />
          <InstallmentsCard
            groups={installmentGroups}
            loading={isLoadingDashboard}
            formatCurrency={formatCurrency}
          />
        </AnimatedCard>

        {/* Budget alerts */}
        <AnimatedCard delay={0.5}>
          <SectionHeader
            title="Alertas de orcamento"
            action={{
              label: 'Gerenciar',
              onClick: () => navigate('/budgets'),
            }}
          />
          {isLoadingDashboard ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : errors.budgets ? (
            <PremiumEmptyState
              icon={AlertTriangle}
              title="Erro ao carregar orcamentos"
              description={errors.budgets}
            />
          ) : budgetAlerts.length === 0 ? (
            <PremiumEmptyState
              icon={AlertTriangle}
              title="Nenhum alerta de orcamento"
              description="Voce sera notificado quando seus gastos ultrapassarem 80% do orcamento"
            />
          ) : (
            <div className="space-y-3">
              {budgetAlerts.map((budget, index) => {
                const percentage =
                  budget.percentage !== undefined
                    ? budget.percentage
                    : budget.spent && budget.amount
                      ? Math.round((budget.spent / budget.amount) * 100)
                      : 0
                const categoryName = budget.category?.name || 'Orcamento Geral'

                return (
                  <BudgetAlert
                    key={budget.id}
                    categoryName={categoryName}
                    percentage={percentage}
                    spent={budget.spent || 0}
                    total={budget.amount}
                    index={index}
                  />
                )
              })}
            </div>
          )}
        </AnimatedCard>
      </motion.div>
    </MainLayout>
  )
}

export default Dashboard
