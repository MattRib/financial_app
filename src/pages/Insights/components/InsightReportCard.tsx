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
  Award,
  Flag,
  Bell,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Clock,
  Gauge,
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

const difficultyColors = {
  easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

const timeframeLabels = {
  immediate: 'Imediato',
  short_term: 'Curto prazo',
  long_term: 'Longo prazo',
}

const scoreColors = {
  excellent: 'text-emerald-600 dark:text-emerald-500',
  good: 'text-green-600 dark:text-green-500',
  moderate: 'text-amber-600 dark:text-amber-500',
  needs_attention: 'text-orange-600 dark:text-orange-500',
  critical: 'text-red-600 dark:text-red-500',
}

const scoreLabels = {
  excellent: 'Excelente',
  good: 'Bom',
  moderate: 'Moderado',
  needs_attention: 'Precisa Atenção',
  critical: 'Crítico',
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
      {/* Financial Score Section */}
      {report.financial_score && (
        <AnimatedCard delay={0.05}>
          <div className="flex items-center justify-between">
            <SectionHeader title="Score Financeiro" icon={<Award size={20} />} />
            <div className="text-right">
              <div className={`text-4xl font-bold ${scoreColors[report.financial_score.level]}`}>
                {report.financial_score.score}
                <span className="text-lg text-slate-500 dark:text-slate-400">/100</span>
              </div>
              <div className={`text-sm font-medium mt-1 ${scoreColors[report.financial_score.level]}`}>
                {scoreLabels[report.financial_score.level]}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${report.financial_score.score}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full ${
                  report.financial_score.score >= 90
                    ? 'bg-emerald-500'
                    : report.financial_score.score >= 70
                      ? 'bg-green-500'
                      : report.financial_score.score >= 50
                        ? 'bg-amber-500'
                        : report.financial_score.score >= 30
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              {report.financial_score.description}
            </p>
          </div>
        </AnimatedCard>
      )}

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

        {report.summary.key_highlight && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
              🌟 {report.summary.key_highlight}
            </p>
          </div>
        )}
      </AnimatedCard>

      {/* Month Comparison Section */}
      {report.month_comparison && (
        <AnimatedCard delay={0.15}>
          <SectionHeader title="Comparação com Mês Anterior" icon={<Gauge size={20} />} />
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {report.month_comparison.income_trend === 'increasing' && (
                    <ArrowUpCircle size={20} className="text-emerald-600" />
                  )}
                  {report.month_comparison.income_trend === 'decreasing' && (
                    <ArrowDownCircle size={20} className="text-red-600" />
                  )}
                  {report.month_comparison.income_trend === 'stable' && (
                    <MinusCircle size={20} className="text-slate-600" />
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tendência de Receitas
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  report.month_comparison.income_trend === 'increasing'
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : report.month_comparison.income_trend === 'decreasing'
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {report.month_comparison.income_trend === 'increasing'
                    ? 'Em crescimento'
                    : report.month_comparison.income_trend === 'decreasing'
                      ? 'Em queda'
                      : 'Estável'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {report.month_comparison.expense_trend === 'increasing' && (
                    <ArrowUpCircle size={20} className="text-red-600" />
                  )}
                  {report.month_comparison.expense_trend === 'decreasing' && (
                    <ArrowDownCircle size={20} className="text-emerald-600" />
                  )}
                  {report.month_comparison.expense_trend === 'stable' && (
                    <MinusCircle size={20} className="text-slate-600" />
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tendência de Despesas
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  report.month_comparison.expense_trend === 'decreasing'
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : report.month_comparison.expense_trend === 'increasing'
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {report.month_comparison.expense_trend === 'increasing'
                    ? 'Em crescimento'
                    : report.month_comparison.expense_trend === 'decreasing'
                      ? 'Em queda'
                      : 'Estável'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              {report.month_comparison.analysis}
            </p>
          </div>
        </AnimatedCard>
      )}

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
                      {insight.metric && (
                        <div className="text-xs font-medium mt-1 opacity-75">
                          📊 {insight.metric}
                        </div>
                      )}
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
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {rec.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[rec.difficulty]}`}>
                          {rec.difficulty === 'easy' ? 'Fácil' : rec.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </span>
                      )}
                      {rec.timeframe && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Clock size={12} />
                          {timeframeLabels[rec.timeframe]}
                        </span>
                      )}
                    </div>
                    {rec.category && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        📂 {rec.category}
                      </div>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
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

      {/* Spending Alerts Section */}
      {report.spending_alerts && report.spending_alerts.length > 0 && (
        <AnimatedCard delay={0.35}>
          <SectionHeader title="Alertas de Gastos" icon={<Bell size={20} />} />
          <div className="space-y-3 mt-4">
            {report.spending_alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : alert.severity === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className={`mt-0.5 flex-shrink-0 ${
                      alert.severity === 'high'
                        ? 'text-red-600 dark:text-red-500'
                        : alert.severity === 'medium'
                          ? 'text-amber-600 dark:text-amber-500'
                          : 'text-slate-600 dark:text-slate-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                        {alert.category}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          alert.severity === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : alert.severity === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {alert.severity === 'high'
                          ? 'Crítico'
                          : alert.severity === 'medium'
                            ? 'Moderado'
                            : 'Baixo'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {alert.message}
                    </p>
                    {alert.suggested_limit && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        💡 Limite sugerido: {formatCurrency(alert.suggested_limit)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Goals Suggestions Section */}
      {report.goals_suggestions && report.goals_suggestions.length > 0 && (
        <AnimatedCard delay={0.4}>
          <SectionHeader title="Metas Sugeridas" icon={<Flag size={20} />} />
          <div className="space-y-3 mt-4">
            {report.goals_suggestions.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.1 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                      {goal.title}
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                      <span>🎯 Meta: {formatCurrency(goal.target_amount)}</span>
                      <span>📅 Prazo: {goal.timeframe_months} {goal.timeframe_months === 1 ? 'mês' : 'meses'}</span>
                    </div>
                  </div>
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
