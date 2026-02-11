import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { useInsightsStore } from '../../store/insightsStore'
import { useToast } from '../../store/toastStore'
import { MonthYearSelector } from './components/MonthYearSelector'
import { GenerateInsightButton } from './components/GenerateInsightButton'
import { InsightReportCard } from './components/InsightReportCard'
import { FinancialEvolutionChart } from './components/FinancialEvolutionChart'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { insightsService } from '../../services/insights'
import type { FinancialEvolution } from '../../types'

const InsightsPage: React.FC = () => {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [evolution, setEvolution] = useState<FinancialEvolution[]>([])
  const [loadingEvolution, setLoadingEvolution] = useState(false)

  const { currentInsight, generating, error, generateInsight, regenerateInsight, setCurrentInsight } =
    useInsightsStore()
  const toast = useToast()

  // Navegação de mês
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

  // Handler de geração
  const handleGenerate = async () => {
    try {
      await generateInsight({ month, year })
      ;(toast as unknown as { showToast?: (message: string, variant?: 'success' | 'error') => void }).showToast?.(
        'Insights gerados com sucesso!',
        'success'
      )
    } catch {
      ;(toast as unknown as { showToast?: (message: string, variant?: 'success' | 'error') => void }).showToast?.(
        'Erro ao gerar insights. Tente novamente.',
        'error'
      )
    }
  }

  // Handler de regeneração
  const handleRegenerate = async () => {
    try {
      await regenerateInsight({ month, year })
      ;(toast as unknown as { showToast?: (message: string, variant?: 'success' | 'error') => void }).showToast?.(
        'Insights atualizados com sucesso!',
        'success'
      )
    } catch {
      ;(toast as unknown as { showToast?: (message: string, variant?: 'success' | 'error') => void }).showToast?.(
        'Erro ao atualizar insights. Tente novamente.',
        'error'
      )
    }
  }

  // Buscar evolução financeira
  const fetchEvolution = async () => {
    setLoadingEvolution(true)
    try {
      const data = await insightsService.getEvolution(6)
      setEvolution(data)
    } catch (err) {
      console.error('Erro ao buscar evolução:', err)
    } finally {
      setLoadingEvolution(false)
    }
  }

  // Carregar evolução ao montar
  useEffect(() => {
    fetchEvolution()
  }, [])

  // Reset ao mudar mês/ano
  useEffect(() => {
    setCurrentInsight(null)
  }, [month, year, setCurrentInsight])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Insights Financeiros
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Análise inteligente dos seus gastos com recomendações personalizadas
          </p>
        </div>

        {/* Evolution Chart */}
        {!loadingEvolution && evolution.length > 0 && (
          <FinancialEvolutionChart
            data={evolution}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Month/Year Selector */}
        <MonthYearSelector
          month={month}
          year={year}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
        />

        {/* Generate Button */}
        {!currentInsight && (
          <div className="flex justify-center">
            <GenerateInsightButton
              loading={generating}
              onClick={handleGenerate}
              disabled={generating}
            />
          </div>
        )}

        {/* Loading State */}
        {generating && (
          <PremiumEmptyState
            icon={Sparkles}
            title="Gerando insights..."
            description="Analisando suas transações. Isso pode levar alguns segundos."
            minHeight={300}
          />
        )}

        {/* Error State */}
        {error && !generating && (
          <PremiumEmptyState
            icon={AlertCircle}
            title="Erro ao gerar insights"
            description={error}
            action={{
              label: 'Tentar novamente',
              onClick: handleGenerate,
            }}
            minHeight={300}
          />
        )}

        {/* Report Display */}
        {currentInsight && !generating && (
          <>
            <div className="flex justify-end mb-4">
              <motion.button
                onClick={handleRegenerate}
                disabled={generating}
                whileHover={{ scale: generating ? 1 : 1.02 }}
                whileTap={{ scale: generating ? 1 : 0.98 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  font-medium text-sm transition-all
                  ${
                    generating
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer'
                  }
                `}
              >
                <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Atualizando...' : 'Atualizar com dados recentes'}
              </motion.button>
            </div>
            <InsightReportCard
              report={currentInsight.report_data}
              totalIncome={currentInsight.total_income}
              totalExpense={currentInsight.total_expense}
              balance={currentInsight.balance}
              formatCurrency={formatCurrency}
            />
          </>
        )}

        {/* Empty State (primeira vez) */}
        {!currentInsight && !generating && !error && (
          <PremiumEmptyState
            icon={Sparkles}
            title="Gere seus primeiros insights"
            description="Clique no botão acima para receber uma análise detalhada dos seus gastos mensais com recomendações personalizadas."
            minHeight={300}
          />
        )}
      </motion.div>
    </MainLayout>
  )
}

export default InsightsPage
