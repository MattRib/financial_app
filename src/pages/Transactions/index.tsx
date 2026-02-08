import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { DeleteInstallmentModal } from '../../components/common'
import { TransactionCard, TransactionCardSkeleton } from '../../components/transactions/TransactionCard'
import { TransactionModal } from '../../components/transactions/TransactionModal'
import { TransactionFilters } from '../../components/transactions/TransactionFilters'
import { OfxImportModal } from '../../components/transactions/OfxImportModal'
import { useTransaction, formatCurrency } from '../../hooks/useTransaction'
import {
  Plus,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Loader2,
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

const TransactionsPage: React.FC = () => {
  const [showOfxModal, setShowOfxModal] = useState(false)

  const {
    // Data
    transactions,
    allTransactions,
    summary,
    categories,
    transactionCounts,

    // State
    loading,
    error,
    isLoadingMore,
    hasMore,
    showModal,
    editingTransaction,
    deleteConfirm,

    // Filters
    selectedTab,
    filterCategory,
    filterDateStart,
    filterDateEnd,

    // Refs
    loadMoreRef,
    // Accounts
    accounts,

    // Handlers
    setSelectedTab,
    setFilterCategory,
    setFilterDateStart,
    setFilterDateEnd,
    handleNewTransaction,
    handleEditTransaction,
    handleCloseModal,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleSubmitTransaction,
    handleClearFilters,
  } = useTransaction({ itemsPerPage: 15 })

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
              Transações
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie suas receitas e despesas
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowOfxModal(true)}
              className="
                inline-flex items-center gap-2 px-4 py-2.5
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-300
                rounded-xl font-medium text-sm
                hover:bg-slate-50 dark:hover:bg-slate-700
                transition-colors shadow-sm
                cursor-pointer
              "
            >
              <Upload size={18} />
              Importar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewTransaction}
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
              Nova Transação
            </motion.button>
          </div>
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
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Entradas"
              value={formatCurrency(summary.total_income)}
              icon={<TrendingUp size={24} />}
              loading={loading}
              index={0}
            />
            <StatCard
              title="Total Saídas"
              value={formatCurrency(summary.total_expense)}
              icon={<TrendingDown size={24} />}
              loading={loading}
              index={1}
            />
            <StatCard
              title="Saldo"
              value={formatCurrency(summary.balance)}
              icon={<Wallet size={24} />}
              loading={loading}
              index={2}
              trend={
                summary.total_income > 0 && summary.balance !== 0
                  ? { 
                      value: Math.abs(Math.round((summary.balance / summary.total_income) * 100)), 
                      positive: summary.balance > 0 
                    }
                  : undefined
              }
            />
          </div>
        )}

        {/* Filters */}
        <TransactionFilters
          selectedTab={selectedTab}
          transactionCounts={transactionCounts}
          categories={categories}
          filterCategory={filterCategory}
          filterDateStart={filterDateStart}
          filterDateEnd={filterDateEnd}
          onTabChange={setSelectedTab}
          onCategoryChange={setFilterCategory}
          onDateStartChange={setFilterDateStart}
          onDateEndChange={setFilterDateEnd}
          onClearFilters={handleClearFilters}
        />

        {/* Transactions List */}
        <div className="space-y-3">
          {/* Loading Skeleton */}
          {loading && transactions.length === 0 && (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <TransactionCardSkeleton key={index} index={index} />
              ))}
            </>
          )}

          {/* Empty State */}
          {!loading && allTransactions.length === 0 && (
            <PremiumEmptyState
              icon={Receipt}
              title="Nenhuma transação encontrada"
              description="Comece registrando suas transações para acompanhar suas finanças"
              action={{
                label: 'Criar primeira transação',
                onClick: handleNewTransaction,
              }}
            />
          )}

          {/* No Results (with filters) */}
          {!loading && transactions.length === 0 && allTransactions.length > 0 && (
            <PremiumEmptyState
              icon={Receipt}
              title="Nenhum resultado"
              description="Tente ajustar os filtros para encontrar transações"
              action={{
                label: 'Limpar filtros',
                onClick: handleClearFilters,
              }}
            />
          )}

          {/* Transaction Cards */}
          <AnimatePresence mode="popLayout">
            {transactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                index={index}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteClick}
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
          {!hasMore && transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center"
            >
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Mostrando todas as {allTransactions.length} transações
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        transaction={editingTransaction}
        categories={categories}
        loading={loading}
        accounts={accounts}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInstallmentModal
        isOpen={deleteConfirm.show}
        transactionDescription={deleteConfirm.transaction?.description}
        isInstallment={Boolean(
          deleteConfirm.transaction?.installment_number &&
          deleteConfirm.transaction?.total_installments
        )}
        installmentNumber={deleteConfirm.transaction?.installment_number || 1}
        totalInstallments={deleteConfirm.transaction?.total_installments || 1}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
      />

      {/* OFX Import Modal */}
      <OfxImportModal
        isOpen={showOfxModal}
        accounts={accounts}
        categories={categories}
        onClose={() => setShowOfxModal(false)}
        onComplete={() => {
          setShowOfxModal(false)
          window.location.reload()
        }}
      />
    </MainLayout>
  )
}

export default TransactionsPage
