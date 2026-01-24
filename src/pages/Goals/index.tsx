import { motion } from 'framer-motion'
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { MainLayout } from '../../components/layout'
import { StatCard } from '../../components/dashboard/StatCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { PremiumEmptyState } from '../../components/common/PremiumEmptyState'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import {
  GoalCard,
  GoalCardSkeleton,
  GoalFilters,
  GoalModal,
  AddProgressModal,
} from '../../components/goals'
import { useGoal } from '../../hooks/useGoal'
import { formatGoalCurrency, GOAL_CATEGORY_CONFIG } from '../../constants/goals'

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

const GoalsPage: React.FC = () => {
  const {
    // Data
    filteredGoals,
    summary,
    atRiskGoals,
    loading,

    // Filters
    statusFilter,
    categoryFilter,
    setStatusFilter,
    setCategoryFilter,

    // Modal states
    isModalOpen,
    isDeleteModalOpen,
    isAddProgressModalOpen,
    selectedGoal,
    goalToAddProgress,

    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    openAddProgressModal,
    closeAddProgressModal,

    // CRUD operations
    handleSubmit,
    handleDelete,
    handleAddProgress,
    handleMarkComplete,
  } = useGoal()

  // Calculate stats
  const totalGoals = summary?.by_status
    ? summary.by_status.active.count +
      summary.by_status.completed.count +
      summary.by_status.cancelled.count
    : 0
  const activeGoals = summary?.by_status?.active.count || 0
  const totalTarget = summary?.total_target || 0
  const progressPercentage = summary?.progress_percentage || 0

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
              Metas Financeiras
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acompanhe o progresso das suas metas de economia
            </p>
          </div>
          <button
            onClick={openCreateModal}
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
            Nova Meta
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Metas"
            value={totalGoals.toString()}
            icon={<Target size={24} />}
            loading={loading}
            index={0}
          />
          <StatCard
            title="Valor Total Alvo"
            value={formatGoalCurrency(totalTarget)}
            icon={<TrendingUp size={24} />}
            loading={loading}
            index={1}
          />
          <StatCard
            title="Progresso Geral"
            value={`${progressPercentage}%`}
            icon={<TrendingUp size={24} />}
            loading={loading}
            index={2}
          />
          <StatCard
            title="Metas Ativas"
            value={activeGoals.toString()}
            icon={<CheckCircle2 size={24} />}
            loading={loading}
            index={3}
          />
        </div>

        {/* At Risk Goals Section */}
        {!loading && atRiskGoals.length > 0 && (
          <div>
            <div
              className={`
                p-4 rounded-xl
                bg-amber-50 dark:bg-amber-900/20
                border border-amber-200 dark:border-amber-800
              `}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Atenção Necessária
                </h3>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  ({atRiskGoals.length} meta{atRiskGoals.length !== 1 ? 's' : ''} em risco)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {atRiskGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className={`
                      p-4 rounded-lg
                      bg-white dark:bg-slate-900
                      border border-amber-200 dark:border-amber-800
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {goal.category
                          ? GOAL_CATEGORY_CONFIG[goal.category].emoji
                          : '🎯'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {goal.name}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {goal.progress_percentage}% concluído • {goal.days_remaining} dias restantes
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openAddProgressModal(goal)}
                      className={`
                        w-full mt-2 px-3 py-1.5 rounded-lg text-sm font-medium
                        bg-amber-100 dark:bg-amber-900/30
                        text-amber-700 dark:text-amber-300
                        hover:bg-amber-200 dark:hover:bg-amber-900/50
                        transition-colors duration-200
                        cursor-pointer
                      `}
                    >
                      Adicionar progresso
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <GoalFilters
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
          />
        </motion.div>

        {/* Goals Grid */}
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="Suas Metas"
            action={
              filteredGoals.length > 0
                ? {
                    label: `${filteredGoals.length} meta${filteredGoals.length !== 1 ? 's' : ''}`,
                    onClick: () => {},
                  }
                : undefined
            }
          />

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <GoalCardSkeleton key={index} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredGoals.length === 0 && (
            <div className="mt-4">
              <PremiumEmptyState
                icon={Target}
                title="Nenhuma meta encontrada"
                description={
                  statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Tente ajustar os filtros para ver mais metas'
                    : 'Comece criando sua primeira meta financeira'
                }
                action={
                  statusFilter === 'all' && categoryFilter === 'all'
                    ? {
                        label: 'Criar primeira meta',
                        onClick: openCreateModal,
                      }
                    : undefined
                }
              />
            </div>
          )}

          {/* Goals Grid */}
          {!loading && filteredGoals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredGoals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={index}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onAddProgress={openAddProgressModal}
                  onMarkComplete={handleMarkComplete}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}
      <GoalModal
        isOpen={isModalOpen}
        goal={selectedGoal}
        loading={loading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <AddProgressModal
        isOpen={isAddProgressModalOpen}
        goal={goalToAddProgress}
        loading={loading}
        onClose={closeAddProgressModal}
        onSubmit={handleAddProgress}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir meta"
        description="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
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

export default GoalsPage

