import React from 'react'
import { motion } from 'framer-motion'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react'
import type { Debt, DebtStatus } from '../../types'

interface DebtCardProps {
  debt: Debt
  index?: number
  onEdit: (debt: Debt) => void
  onDelete: (id: string) => void
  onMarkAsPaid: (id: string) => void
}

// Format currency to Brazilian Real
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Format date to Brazilian format
const formatDate = (dateString: string): string => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Calculate days until due date
const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Status configuration
const statusConfig: Record<DebtStatus, { 
  label: string
  icon: React.ElementType
  bgClass: string
  textClass: string
  borderClass: string
}> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  paid: {
    label: 'Paga',
    icon: CheckCircle,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  overdue: {
    label: 'Vencida',
    icon: AlertTriangle,
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
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

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  index = 0,
  onEdit,
  onDelete,
  onMarkAsPaid,
}) => {
  const [showActions, setShowActions] = React.useState(false)
  const status = statusConfig[debt.status]
  const StatusIcon = status.icon
  const daysUntilDue = getDaysUntilDue(debt.due_date)
  
  // Calculate progress percentage
  const progressPercentage = debt.amount > 0 
    ? Math.min((debt.amount_paid / debt.amount) * 100, 100) 
    : 0
  
  // Show quick pay button only for pending/overdue debts
  const canMarkAsPaid = debt.status !== 'paid'

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      layout
      className="
        p-4
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-2xl
        hover:border-slate-300 dark:hover:border-slate-700
        transition-colors duration-150
      "
    >
      {/* Top Row: Name + Status + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {debt.name}
          </h3>
          {/* Creditor */}
          {debt.creditor && (
            <div className="flex items-center gap-1 mt-1">
              <User size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {debt.creditor}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
          ${status.bgClass} ${status.textClass}
        `}>
          <StatusIcon size={12} />
          {status.label}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            onBlur={() => setTimeout(() => setShowActions(false), 150)}
            className="
              p-2 rounded-lg
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors cursor-pointer
            "
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Dropdown Menu */}
          {showActions && (
            <div
              className="
                absolute right-0 top-full mt-1 z-10
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-xl shadow-lg
                py-1 min-w-[160px]
                animate-in fade-in zoom-in-95 duration-150
              "
            >
              {canMarkAsPaid && (
                <button
                  onClick={() => {
                    setShowActions(false)
                    onMarkAsPaid(debt.id)
                  }}
                  className="
                    w-full flex items-center gap-2.5 px-3 py-2
                    text-sm text-emerald-600 dark:text-emerald-400
                    hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                    transition-colors cursor-pointer
                  "
                >
                  <CheckCircle size={15} />
                  Marcar como paga
                </button>
              )}
              <button
                onClick={() => {
                  setShowActions(false)
                  onEdit(debt)
                }}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-slate-700 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transition-colors cursor-pointer
                "
              >
                <Edit2 size={15} />
                Editar
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onDelete(debt.id)
                }}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors cursor-pointer
                "
              >
                <Trash2 size={15} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Amount + Progress */}
      <div className="mt-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Valor total</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(debt.amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Pago</p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(debt.amount_paid)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              progressPercentage >= 100 
                ? 'bg-emerald-500' 
                : progressPercentage > 50 
                  ? 'bg-amber-500' 
                  : 'bg-slate-400'
            }`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {progressPercentage.toFixed(0)}% pago
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Restante: {formatCurrency(debt.amount - debt.amount_paid)}
          </span>
        </div>
      </div>

      {/* Bottom Row: Due Date + Quick Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Vencimento: {formatDate(debt.due_date)}
          </span>
          {debt.status === 'pending' && daysUntilDue >= 0 && daysUntilDue <= 7 && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              ({daysUntilDue === 0 ? 'Hoje' : `${daysUntilDue} dias`})
            </span>
          )}
          {debt.status === 'overdue' && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              ({Math.abs(daysUntilDue)} dias de atraso)
            </span>
          )}
        </div>

        {/* Quick Pay Button */}
        {canMarkAsPaid && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMarkAsPaid(debt.id)}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium
              text-emerald-600 dark:text-emerald-400
              bg-emerald-50 dark:bg-emerald-900/20
              hover:bg-emerald-100 dark:hover:bg-emerald-900/30
              border border-emerald-200 dark:border-emerald-800
              rounded-lg transition-colors cursor-pointer
            "
          >
            <CheckCircle size={14} />
            Pagar
          </motion.button>
        )}
      </div>

      {/* Notes (if any) */}
      {debt.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {debt.notes}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Skeleton for loading state
export const DebtCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="
      p-4
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-2xl
    "
  >
    {/* Top Row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <div className="w-40 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>

    {/* Middle Row */}
    <div className="mt-4">
      <div className="flex items-end justify-between mb-2">
        <div className="space-y-1">
          <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-28 h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="w-12 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse ml-auto" />
          <div className="w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse ml-auto" />
        </div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
      <div className="flex justify-between mt-1">
        <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>

    {/* Bottom Row */}
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div className="w-36 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div className="w-16 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>
  </motion.div>
)
