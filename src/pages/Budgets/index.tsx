import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Wallet, TrendingDown, PiggyBank, Percent, Receipt } from 'lucide-react'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import {
  BudgetCard,
  BudgetCardSkeleton,
  BudgetModal,
  BudgetFilters,
} from '../../components/budgets'
import { useBudget } from '../../hooks/useBudget'
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

const BudgetsPage: React.FC = () => {
  const {
    // Period
    month,
    year,
    goToPrevMonth,
    goToNextMonth,
    
    // Modal state
    isModalOpen,
    isDeleteModalOpen,
    selectedBudget,
    budgetToDelete,
    
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
    budgets,
    overview,
    loading,
    categories,
  } = useBudget()

  // Find budget to delete for confirmation modal
  const budgetForDelete = budgets.find((b) => b.id === budgetToDelete)

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
              Orçamentos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Gerencie seus orçamentos mensais
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
            Novo Orçamento
          </motion.button>
        </motion.div>

        {/* Period Filter */}
        <motion.div variants={itemVariants}>
          <BudgetFilters
            month={month}
            year={year}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Orçado Total"
            value={formatCurrency(overview?.total_budget ?? 0)}
            icon={<Wallet size={24} />}
            loading={loading}
            index={0}
          />
          <StatCard
            title="Gasto Total"
            value={formatCurrency(overview?.total_spent ?? 0)}
            icon={<TrendingDown size={24} />}
            loading={loading}
            index={1}
          />
          <StatCard
            title="Saldo Disponível"
            value={formatCurrency(overview?.total_remaining ?? 0)}
            icon={<PiggyBank size={24} />}
            loading={loading}
            index={2}
          />
          <StatCard
            title="% Utilizado"
            value={`${Math.round(overview?.percentage ?? 0)}%`}
            icon={<Percent size={24} />}
            loading={loading}
            index={3}
          />
        </div>

        {/* Budgets Section */}
        <motion.div variants={itemVariants}>
          <SectionHeader title="Orçamentos do mês" />

          {/* Loading State */}
          {loading && budgets.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <BudgetCardSkeleton key={i} index={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && budgets.length === 0 && (
            <PremiumEmptyState
              icon={Receipt}
              title="Nenhum orçamento encontrado"
              description="Crie orçamentos para controlar seus gastos mensais por categoria"
              action={{
                label: 'Criar orçamento',
                onClick: openCreateModal,
              }}
            />
          )}

          {/* Budgets Grid */}
          {budgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget, index) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  index={index}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Budget Modal (Create/Edit) */}
      <BudgetModal
        isOpen={isModalOpen}
        budget={selectedBudget}
        categories={categories}
        loading={loading}
        currentMonth={month}
        currentYear={year}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir orçamento"
        description={
          budgetForDelete
            ? `Tem certeza que deseja excluir o orçamento "${budgetForDelete.category?.name || 'Orçamento Geral'}" de ${formatCurrency(budgetForDelete.amount)}? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.'
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

export default BudgetsPage
