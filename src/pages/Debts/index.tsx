import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import { DebtCard, DebtCardSkeleton, DebtFilters, DebtModal } from '../../components/debts'
import { useDebt, formatCurrency } from '../../hooks/useDebt'
import {
  Plus,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Wallet,
  AlertCircle,
  Loader2,
  Trash2,
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

const DebtsPage: React.FC = () => {
  const {
    // Data
    debts,
    allDebts,
    summary,
    debtCounts,
    debtToDelete,

    // State
    loading,
    error,
    isLoadingMore,
    hasMore,
    showModal,
    editingDebt,
    deleteConfirm,
    notification,

    // Filters
    selectedTab,
    filterDateStart,
    filterDateEnd,

    // Refs
    loadMoreRef,

    // Handlers
    setSelectedTab,
    setFilterDateStart,
    setFilterDateEnd,
    handleNewDebt,
    handleEditDebt,
    handleCloseModal,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleMarkAsPaid,
    handleSubmitDebt,
    handleClearFilters,
  } = useDebt({ itemsPerPage: 15 })

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
              Dívidas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie e acompanhe suas dívidas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewDebt}
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
            Nova Dívida
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Dívidas"
              value={formatCurrency(summary.total_debt)}
              icon={<CreditCard size={24} />}
              loading={loading}
              index={0}
            />
            <StatCard
              title="Total Pago"
              value={formatCurrency(summary.total_paid)}
              icon={<CheckCircle size={24} />}
              loading={loading}
              index={1}
            />
            <StatCard
              title="Restante"
              value={formatCurrency(summary.remaining)}
              icon={<Wallet size={24} />}
              loading={loading}
              index={2}
              trend={
                summary.total_debt > 0
                  ? { 
                      value: Math.round((summary.total_paid / summary.total_debt) * 100), 
                      positive: summary.total_paid > 0 
                    }
                  : undefined
              }
            />
            <StatCard
              title="Vencidas"
              value={String(summary.by_status.overdue.count)}
              icon={<AlertTriangle size={24} />}
              loading={loading}
              index={3}
            />
          </div>
        )}

        {/* Filters */}
        <DebtFilters
          selectedTab={selectedTab}
          debtCounts={debtCounts}
          filterDateStart={filterDateStart}
          filterDateEnd={filterDateEnd}
          onTabChange={setSelectedTab}
          onDateStartChange={setFilterDateStart}
          onDateEndChange={setFilterDateEnd}
          onClearFilters={handleClearFilters}
        />

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                p-4 rounded-xl flex items-center gap-3
                ${notification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }
              `}
            >
              {notification.type === 'success' ? (
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              )}
              <p className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {notification.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          </motion.div>
        )}

        {/* Debts List */}
        <div className="space-y-3">
          {/* Loading Skeleton */}
          {loading && debts.length === 0 && (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <DebtCardSkeleton key={index} index={index} />
              ))}
            </>
          )}

          {/* Empty State */}
          {!loading && allDebts.length === 0 && debtCounts.all === 0 && (
            <PremiumEmptyState
              icon={CreditCard}
              title="Nenhuma dívida registrada"
              description="Comece registrando suas dívidas para acompanhar e gerenciar seus pagamentos"
              action={{
                label: 'Criar primeira dívida',
                onClick: handleNewDebt,
              }}
            />
          )}

          {/* No Results (with filters) */}
          {!loading && debts.length === 0 && allDebts.length === 0 && debtCounts.all > 0 && (
            <PremiumEmptyState
              icon={CreditCard}
              title="Nenhum resultado"
              description="Tente ajustar os filtros para encontrar dívidas"
              action={{
                label: 'Limpar filtros',
                onClick: handleClearFilters,
              }}
            />
          )}

          {/* Debt Cards */}
          <AnimatePresence mode="popLayout">
            {debts.map((debt, index) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                index={index}
                onEdit={handleEditDebt}
                onDelete={handleDeleteClick}
                onMarkAsPaid={handleMarkAsPaid}
              />
            ))}
          </AnimatePresence>

          {/* Load More Trigger & Indicator */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isLoadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400"
                >
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Carregando mais...</span>
                </motion.div>
              )}
            </div>
          )}

          {/* End of List Indicator */}
          {!hasMore && debts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center"
            >
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Mostrando todas as {debtCounts.all} dívidas
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Debt Modal */}
      <DebtModal
        isOpen={showModal}
        debt={editingDebt}
        loading={loading}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDebt}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Excluir dívida"
        description="Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon={Trash2}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {debtToDelete && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              {debtToDelete.name}
            </p>
            <p className="text-sm font-semibold mt-1 text-red-600 dark:text-red-500">
              {formatCurrency(debtToDelete.amount)}
            </p>
            {debtToDelete.creditor && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Credor: {debtToDelete.creditor}
              </p>
            )}
          </div>
        )}
      </ConfirmationModal>
    </MainLayout>
  )
}

export default DebtsPage

