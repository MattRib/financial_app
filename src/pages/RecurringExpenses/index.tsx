import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import {
  RecurringExpenseCard,
  RecurringExpenseCardSkeleton,
  RecurringExpenseModal,
} from '../../components/recurringExpenses'
import { useRecurringExpensesStore } from '../../store/recurringExpensesStore'
import { useCategoriesStore } from '../../store/categoriesStore'
import { useAccountsStore } from '../../store/accountsStore'
import { Plus, Repeat, Trash2 } from 'lucide-react'

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

// Helper function
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const RecurringExpensesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean
    groupId: string | null
    description: string | null
  }>({ show: false, groupId: null, description: null })

  const {
    recurringExpenses,
    loading,
    error,
    fetchRecurringExpenses,
    createRecurringExpense,
    removeRecurringExpense,
  } = useRecurringExpensesStore()

  const { categories, fetchCategories } = useCategoriesStore()
  const { accounts, fetch: fetchAccounts } = useAccountsStore()

  useEffect(() => {
    fetchRecurringExpenses()
    fetchCategories()
    fetchAccounts()
  }, [fetchRecurringExpenses, fetchCategories, fetchAccounts])

  const handleNewRecurringExpense = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (data: any) => {
    await createRecurringExpense(data)
    setShowModal(false)
  }

  const handleDeleteClick = (groupId: string, description: string) => {
    setDeleteConfirm({ show: true, groupId, description })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.groupId) {
      try {
        const deletedCount = await removeRecurringExpense(deleteConfirm.groupId)
        console.log(`${deletedCount} transações futuras deletadas`)
      } catch (err) {
        console.error('Erro ao deletar:', err)
      }
    }
    setDeleteConfirm({ show: false, groupId: null, description: null })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, groupId: null, description: null })
  }

  // Calculate totals
  const totalMonthly = recurringExpenses.reduce(
    (sum, exp) => sum + exp.monthly_amount,
    0,
  )
  const totalYearly = totalMonthly * 12

  return (
    <MainLayout>
      <motion.div
        className="space-y-6"
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
              Despesas Fixas Recorrentes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie suas despesas mensais fixas (aluguel, faculdade, etc.)
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewRecurringExpense}
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              bg-slate-900 dark:bg-slate-100
              text-white dark:text-slate-900
              rounded-xl font-medium text-sm
              hover:bg-slate-800 dark:hover:bg-slate-200
              transition-colors shadow-sm
              cursor-pointer
            "
          >
            <Plus size={18} />
            Nova Despesa Fixa
          </motion.button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Summary Cards */}
        {!loading && recurringExpenses.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="
              bg-gradient-to-br from-slate-50 to-slate-100
              dark:from-slate-900 dark:to-slate-800
              border border-slate-200 dark:border-slate-700
              rounded-xl p-6
            "
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Despesas Fixas
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {recurringExpenses.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Mensal
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(totalMonthly)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Projeção Anual
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(totalYearly)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recurring Expenses List */}
        <div className="space-y-4">
          {/* Loading Skeleton */}
          {loading && recurringExpenses.length === 0 && (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <RecurringExpenseCardSkeleton key={index} index={index} />
              ))}
            </>
          )}

          {/* Empty State */}
          {!loading && recurringExpenses.length === 0 && (
            <PremiumEmptyState
              icon={Repeat}
              title="Nenhuma despesa fixa cadastrada"
              description="Cadastre suas despesas mensais fixas como aluguel, faculdade, internet, etc."
              action={{
                label: 'Criar primeira despesa fixa',
                onClick: handleNewRecurringExpense,
              }}
            />
          )}

          {/* Recurring Expense Cards */}
          <AnimatePresence mode="popLayout">
            {recurringExpenses.map((expense, index) => (
              <RecurringExpenseCard
                key={expense.recurring_group_id}
                expense={expense}
                index={index}
                onDelete={(groupId) =>
                  handleDeleteClick(groupId, expense.description)
                }
                formatCurrency={formatCurrency}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Create Modal */}
      <RecurringExpenseModal
        isOpen={showModal}
        categories={categories}
        accounts={accounts}
        loading={loading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formatCurrency={formatCurrency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Remover despesa fixa recorrente"
        description="Tem certeza que deseja remover esta despesa fixa? Apenas as transações futuras serão deletadas. O histórico será mantido."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        icon={Trash2}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteConfirm.description && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              {deleteConfirm.description}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Apenas transações com data futura serão removidas
            </p>
          </div>
        )}
      </ConfirmationModal>
    </MainLayout>
  )
}

export default RecurringExpensesPage
