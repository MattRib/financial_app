import React from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, Calendar, Landmark, PiggyBank } from 'lucide-react'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import { CategoryBarChart } from '../../components/charts/CategoryBarChart'
import { AnimatedCard } from '../../components/ui/AnimatedCard'
import {
  InvestmentCard,
  InvestmentCardSkeleton,
  InvestmentTable,
  InvestmentTableSkeleton,
  InvestmentModal,
  InvestmentFilters,
  InvestmentEvolutionChart,
  InvestmentEvolutionChartSkeleton,
} from '../../components/investments'
import { useInvestment } from '../../hooks/useInvestment'
import { formatCurrency } from '../../hooks/useTransaction'

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
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const InvestmentsPage: React.FC = () => {
  const {
    // Period
    month,
    year,
    goToPrevMonth,
    goToNextMonth,
    
    // Filters
    selectedType,
    setSelectedType,
    
    // Modal state
    isModalOpen,
    isDeleteModalOpen,
    selectedInvestment,
    investmentToDelete,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    
    // CRUD
    handleSubmit,
    handleDelete,
    
    // Data
    filteredInvestments,
    loading,
    evolution,
    evolutionLoading,
    
    // Computed
    totalInvested,
    monthlyTotal,
    summaryByType,
    chartData,
  } = useInvestment()

  // Get renda_fixa and renda_variavel totals for stat cards
  const rendaFixaTotal = summaryByType.find(s => s.type === 'renda_fixa')?.total ?? 0
  const rendaVariavelTotal = summaryByType.find(s => s.type === 'renda_variavel')?.total ?? 0

  // Find investment to delete for confirmation modal
  const investmentForDelete = filteredInvestments.find(inv => inv.id === investmentToDelete)

  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Investimentos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Acompanhe sua carteira de investimentos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              bg-slate-900 hover:bg-slate-800
              dark:bg-slate-700 dark:hover:bg-slate-600
              text-white rounded-xl
              text-sm font-medium
              transition-colors cursor-pointer
            "
          >
            <Plus size={18} />
            Novo Investimento
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <InvestmentFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            month={month}
            year={year}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Investido"
            value={formatCurrency(totalInvested)}
            icon={<TrendingUp size={24} />}
            loading={loading}
            index={0}
          />
          <StatCard
            title="Este Mês"
            value={formatCurrency(monthlyTotal)}
            icon={<Calendar size={24} />}
            loading={loading}
            index={1}
          />
          <StatCard
            title="Renda Fixa"
            value={formatCurrency(rendaFixaTotal)}
            icon={<Landmark size={24} />}
            loading={loading}
            index={2}
          />
          <StatCard
            title="Renda Variável"
            value={formatCurrency(rendaVariavelTotal)}
            icon={<TrendingUp size={24} />}
            loading={loading}
            index={3}
          />
        </div>

        {/* Charts Grid - Distribution and Evolution */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribution Chart */}
            <AnimatedCard delay={0.2}>
              <SectionHeader title="Distribuição por Tipo" />
              <div className="mt-4">
                {chartData.length > 0 ? (
                  <CategoryBarChart data={chartData} height={200} />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                    Nenhum investimento cadastrado
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* Evolution Chart */}
            <AnimatedCard delay={0.3}>
              <SectionHeader title={`Evolução Mensal - ${year}`} />
              <div className="mt-4">
                {evolutionLoading ? (
                  <InvestmentEvolutionChartSkeleton height={200} />
                ) : evolution.length > 0 ? (
                  <InvestmentEvolutionChart data={evolution} height={200} />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                    Nenhum dado de evolução disponível para {year}
                  </div>
                )}
              </div>
            </AnimatedCard>
          </div>
        </motion.div>

        {/* Investments Section */}
        <motion.div variants={itemVariants}>
          <SectionHeader title="Seus investimentos" />

          {/* Loading State - Desktop */}
          {loading && filteredInvestments.length === 0 && (
            <>
              <div className="hidden md:block">
                <InvestmentTableSkeleton rows={5} />
              </div>
              <div className="md:hidden grid grid-cols-1 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <InvestmentCardSkeleton key={i} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && filteredInvestments.length === 0 && (
            <PremiumEmptyState
              icon={PiggyBank}
              title="Nenhum investimento encontrado"
              description="Comece a registrar seus investimentos para acompanhar sua carteira"
              action={{
                label: 'Adicionar investimento',
                onClick: openCreateModal,
              }}
            />
          )}

          {/* Desktop Table View */}
          {filteredInvestments.length > 0 && (
            <>
              <div className="hidden md:block">
                <InvestmentTable
                  investments={filteredInvestments}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredInvestments.map((investment, index) => (
                  <InvestmentCard
                    key={investment.id}
                    investment={investment}
                    index={index}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Investment Modal (Create/Edit) */}
      <InvestmentModal
        isOpen={isModalOpen}
        investment={selectedInvestment}
        loading={loading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir investimento"
        description={
          investmentForDelete
            ? `Tem certeza que deseja excluir "${investmentForDelete.name}" no valor de ${formatCurrency(investmentForDelete.amount)}? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.'
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </MainLayout>
  )
}

export default InvestmentsPage
