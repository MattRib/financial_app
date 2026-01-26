import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard } from '../../../components/ui/AnimatedCard'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  PieChart,
} from 'lucide-react'
import type { InsightReport } from '../../../types'
import { formatPercentage } from '../../../utils/formatters'

interface InsightReportCardProps {
  report: InsightReport
  totalIncome: number
  totalExpense: number
  balance: number
  formatCurrency: (value: number) => string
}

const healthColors = {
  excellent: 'text-emerald-600 dark:text-emerald-500',
  good: 'text-green-600 dark:text-green-500',
  moderate: 'text-amber-600 dark:text-amber-500',
  warning: 'text-orange-600 dark:text-orange-500',
  critical: 'text-red-600 dark:text-red-500',
}

const healthLabels = {
  excellent: 'Excelente',
  good: 'Boa',
  moderate: 'Moderada',
  warning: 'Atenção',
  critical: 'Crítica',
}

const impactIcons = {
  high: AlertTriangle,
  medium: Lightbulb,
  low: TrendingUp,
}

const typeColors = {
  observation:
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  warning:
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  opportunity:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
}

export const InsightReportCard: React.FC<InsightReportCardProps> = ({
  report,
  totalIncome,
  totalExpense,
  balance,
  formatCurrency,
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <AnimatedCard delay={0.1}>
        <SectionHeader title="Resumo Financeiro" icon={<PieChart size={20} />} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Receitas
            </p>
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Despesas
            </p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-500 mt-1">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Saldo</p>
            <p
              className={`text-xl font-semibold mt-1 ${
                balance >= 0
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Saúde Financeira:
            </span>
            <span
              className={`font-semibold ${healthColors[report.summary.financial_health]}`}
            >
              {healthLabels[report.summary.financial_health]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Tendência:
            </span>
            <div className="flex items-center gap-2">
              {report.summary.balance_trend === 'positive' && (
                <TrendingUp size={16} className="text-emerald-600" />
              )}
              {report.summary.balance_trend === 'negative' && (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className="font-medium text-slate-900 dark:text-slate-50 capitalize">
                {report.summary.balance_trend === 'positive'
                  ? 'Positiva'
                  : report.summary.balance_trend === 'negative'
                    ? 'Negativa'
                    : 'Neutra'}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-slate-700 dark:text-slate-300">
          {report.summary.spending_pattern}
        </p>
      </AnimatedCard>

      {/* Insights Section */}
      {report.insights && report.insights.length > 0 && (
        <AnimatedCard delay={0.2}>
          <SectionHeader title="Insights" icon={<Lightbulb size={20} />} />
          <div className="space-y-3 mt-4">
            {report.insights.map((insight, index) => {
              const Icon = impactIcons[insight.impact]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-lg ${typeColors[insight.type]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">
                        {insight.description}
                      </p>
                      {insight.category && (
                        <span className="text-xs mt-2 inline-block opacity-75">
                          Categoria: {insight.category}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatedCard>
      )}

      {/* Recommendations Section */}
      {report.recommendations && report.recommendations.length > 0 && (
        <AnimatedCard delay={0.3}>
          <SectionHeader title="Recomendações" icon={<Target size={20} />} />
          <div className="space-y-3 mt-4">
            {report.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                        {rec.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : rec.priority === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {rec.priority === 'high'
                          ? 'Alta'
                          : rec.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  {rec.estimated_savings && rec.estimated_savings > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Economia estimada
                      </p>
                      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">
                        {formatCurrency(rec.estimated_savings)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Top Categories Section */}
      {report.top_categories && report.top_categories.length > 0 && (
        <AnimatedCard delay={0.4}>
          <SectionHeader
            title="Top Categorias"
            icon={<PieChart size={20} />}
          />
          <div className="space-y-2 mt-4">
            {report.top_categories.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {cat.category_name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {formatPercentage(cat.percentage)}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}
