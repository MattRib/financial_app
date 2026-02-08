import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { transactionsService } from '../../../services/transactions'
import { AnimatedCard } from '../../../components/ui/AnimatedCard'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export const MonthlyExpensesChart: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<{ month: string; total: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await transactionsService.getMonthlyExpenses(year)
        const formattedData = response.map((item) => ({
          month: MONTH_LABELS[item.month - 1],
          total: item.total,
        }))
        setData(formattedData)
      } catch (error) {
        console.error('Erro ao buscar gastos mensais:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [year])

  // Ensure Recharts recalculates size after mount / data load
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 250)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // trigger a resize shortly after data finishes loading so ResponsiveContainer measures correctly
    if (!isLoading) {
      const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120)
      return () => clearTimeout(t)
    }
  }, [isLoading, data.length])

  const totalYear = data.reduce((sum, item) => sum + item.total, 0)
  const averageMonth = totalYear / 12

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <AnimatedCard>
      <div className="space-y-4">
        {/* Header com filtro de ano */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SectionHeader
              title="Gastos do Ano"
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setYear(year - 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </motion.button>

            <span className="text-lg font-semibold text-slate-900 dark:text-slate-50 min-w-[80px] text-center">
              {year}
            </span>

            <motion.button
              onClick={() => setYear(year + 1)}
              disabled={year >= currentYear}
              whileHover={{ scale: year < currentYear ? 1.05 : 1 }}
              whileTap={{ scale: year < currentYear ? 0.95 : 1 }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                year >= currentYear
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total do Ano
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 mt-1">
              {formatCurrency(totalYear)}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Média Mensal
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 mt-1">
              {formatCurrency(averageMonth)}
            </p>
          </div>
        </div>

        {/* Gráfico */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-50" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-700"
                />
                <XAxis
                  dataKey="month"
                  className="text-xs fill-slate-600 dark:fill-slate-400"
                />
                <YAxis
                  className="text-xs fill-slate-600 dark:fill-slate-400"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e2e8f0)',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelClassName="text-slate-900 dark:text-slate-50"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={theme === 'light' ? '#0f172a' : '#3b82f6'}
                  strokeWidth={2}
                  dot={{ fill: theme === 'light' ? '#0f172a' : '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}
