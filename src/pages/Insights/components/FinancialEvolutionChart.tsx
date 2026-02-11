import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AnimatedCard } from '../../../components/ui/AnimatedCard'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { TrendingUp } from 'lucide-react'
import type { FinancialEvolution } from '../../../types'

interface FinancialEvolutionChartProps {
  data: FinancialEvolution[]
  formatCurrency: (value: number) => string
}

export const FinancialEvolutionChart: React.FC<FinancialEvolutionChartProps> = ({
  data,
  formatCurrency,
}) => {
  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.month_name,
    Receitas: item.total_income,
    Despesas: item.total_expense,
    Saldo: item.balance,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {payload[0].payload.name}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <AnimatedCard delay={0.05}>
      <SectionHeader
        title="Evolução Financeira (Últimos 6 Meses)"
        icon={<TrendingUp size={20} />}
      />

      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              stroke="currentColor"
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              stroke="currentColor"
              tickFormatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            <Line
              type="monotone"
              dataKey="Receitas"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Despesas"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Saldo"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            Receita Média
          </p>
          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.total_income, 0) / data.length
            )}
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            Despesa Média
          </p>
          <p className="text-xl font-bold text-red-900 dark:text-red-100 mt-1">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.total_expense, 0) / data.length
            )}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            Saldo Médio
          </p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.balance, 0) / data.length
            )}
          </p>
        </div>
      </div>
    </AnimatedCard>
  )
}
