import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
} from 'lucide-react'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import {
  AccountCard,
  AccountCardSkeleton,
  AccountModal,
  TransferModal,
  CreditCardInvoiceModal,
} from '../../components/accounts'
import { useAccount } from '../../hooks/useAccount'
import { AccountTypeLabels, type Account } from '../../types'

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const AccountsPage: React.FC = () => {
  const [invoiceAccount, setInvoiceAccount] = useState<Account | null>(null)

  const {
    // Data
    accounts,
    allAccounts,
    summary,
    loading,

    // Filters
    selectedType,
    setSelectedType,

    // Modal state
    showModal,
    editingAccount,
    showTransferModal,
    setShowTransferModal,

    // Delete confirmation
    deleteConfirm,

    // Handlers
    handleNew,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleTransfer,
    handleTransferSubmit,
  } = useAccount()

  const handleInvoice = (account: Account) => {
    setInvoiceAccount(account)
  }

  // Stats
  const totalBalance = summary?.total_balance || 0
  const totalAccounts = summary?.total_accounts || 0
  const activeAccountsCount = allAccounts.filter((a) => a.is_active).length

  // Group accounts by type for better organization
  const accountsByType = accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = []
      }
      acc[account.type].push(account)
      return acc
    },
    {} as Record<string, typeof accounts>
  )

  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Contas e Carteiras
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie suas contas bancárias e carteiras
            </p>
          </div>
          <div className="flex gap-3">
            {allAccounts.length >= 2 && (
              <button
                onClick={handleTransfer}
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                  border border-slate-200 dark:border-slate-700
                  bg-white dark:bg-slate-800
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  text-slate-700 dark:text-slate-300
                  text-sm font-medium
                  transition-colors duration-200
                  cursor-pointer
                `}
              >
                <ArrowRightLeft size={18} />
                Transferir
              </button>
            )}
            <button
              onClick={handleNew}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-slate-900 dark:bg-slate-700
                hover:bg-slate-800 dark:hover:bg-slate-600
                text-white text-sm font-medium
                transition-colors duration-200
                cursor-pointer
              `}
            >
              <Plus size={18} />
              Nova Conta
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(totalBalance)}
            icon={<Wallet size={24} />}
            loading={loading}
            index={0}
          />
          <StatCard
            title="Total de Contas"
            value={totalAccounts.toString()}
            icon={<TrendingUp size={24} />}
            loading={loading}
            index={1}
          />
          <StatCard
            title="Contas Ativas"
            value={activeAccountsCount.toString()}
            icon={<TrendingDown size={24} />}
            loading={loading}
            index={2}
          />
          <StatCard
            title="Tipos de Conta"
            value={Object.keys(accountsByType).length.toString()}
            icon={<Wallet size={24} />}
            loading={loading}
            index={3}
          />
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <div
            className={`
              p-4 rounded-xl
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
            `}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${
                    selectedType === 'all'
                      ? 'bg-slate-900 dark:bg-slate-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                Todas
              </button>
              {Object.entries(AccountTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as Parameters<typeof setSelectedType>[0])}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${
                      selectedType === type
                        ? 'bg-slate-900 dark:bg-slate-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Accounts Grid */}
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="Suas Contas"
            action={
              accounts.length > 0
                ? {
                    label: `${accounts.length} conta${accounts.length !== 1 ? 's' : ''}`,
                    onClick: () => {},
                  }
                : undefined
            }
          />

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <AccountCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && accounts.length === 0 && (
            <div className="mt-4">
              <PremiumEmptyState
                icon={Wallet}
                title="Nenhuma conta encontrada"
                description={
                  selectedType !== 'all'
                    ? 'Tente ajustar os filtros para ver mais contas ou crie uma nova'
                    : 'Comece criando sua primeira conta bancária ou carteira'
                }
                action={{
                  label: 'Criar primeira conta',
                  onClick: handleNew,
                }}
              />
            </div>
          )}

          {/* Accounts Grid - Grouped by Type */}
          {!loading && accounts.length > 0 && (
            <div className="space-y-6 mt-4">
              {Object.entries(accountsByType).map(([type, typeAccounts]) => (
                <div key={type}>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    {AccountTypeLabels[type as keyof typeof AccountTypeLabels]}
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {typeAccounts.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeAccounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onInvoice={handleInvoice}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AccountModal
        isOpen={showModal}
        account={editingAccount}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleTransferSubmit}
        accounts={allAccounts.filter((a) => a.is_active)}
      />

      <CreditCardInvoiceModal
        isOpen={!!invoiceAccount}
        account={invoiceAccount}
        onClose={() => setInvoiceAccount(null)}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Excluir conta"
        description="Tem certeza que deseja excluir esta conta? As transações associadas não serão excluídas, mas perderão a associação com esta conta."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loading}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </MainLayout>
  )
}

export default AccountsPage