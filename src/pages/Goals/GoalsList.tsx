import React from 'react'
import type { Goal, GoalStatus } from '../../types'
import { Edit2, Trash2, CheckCircle } from 'lucide-react'

interface GoalsListProps {
  goals: Goal[]
  loading: boolean
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onComplete?: (id: string) => void
}

// Helper functions (outside component for better performance)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return 'bg-blue-500'
  if (percentage < 80) return 'bg-yellow-500'
  if (percentage < 100) return 'bg-green-500'
  return 'bg-green-600'
}

const getDaysRemaining = (targetDate: string): { days: number; isPast: boolean; label: string; color: string } => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const isPast = diffDays < 0
  const days = Math.abs(diffDays)
  
  const label = isPast
    ? `Vencida há ${days} dia${days !== 1 ? 's' : ''}`
    : `Faltam ${days} dia${days !== 1 ? 's' : ''}`
  
  const color = isPast ? 'text-red-600' : 'text-green-600'
  
  return { days, isPast, label, color }
}

const getStatusLabel = (status: GoalStatus): string => {
  switch (status) {
    case 'active':
      return 'Ativa'
    case 'completed':
      return 'Concluída'
    case 'cancelled':
      return 'Cancelada'
    default:
      return status
  }
}

const getStatusIcon = (status: GoalStatus): string => {
  switch (status) {
    case 'active':
      return '🎯'
    case 'completed':
      return '✅'
    case 'cancelled':
      return '❌'
    default:
      return '🎯'
  }
}

const getStatusBadgeClasses = (status: GoalStatus): string => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium'
  
  switch (status) {
    case 'active':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'cancelled':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Memoized goal item component
const GoalItem = React.memo<{
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onComplete?: (id: string) => void
}>(({ goal, onEdit, onDelete, onComplete }) => {
  const percentage = calculatePercentage(goal.current_amount, goal.target_amount)
  const progressColor = getProgressColor(percentage)
  const daysInfo = getDaysRemaining(goal.target_date)

  return (
    <>
      {/* Desktop Table Row */}
      <tr className="hidden md:table-row hover:bg-gray-50 border-b border-gray-200">
        {/* Nome */}
        <td className="px-4 py-3 text-sm">
          <div className="font-medium text-gray-900">{goal.name}</div>
          {goal.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
              {goal.category}
            </span>
          )}
        </td>

        {/* Progresso */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[100px]">
              <div
                className={`h-2.5 rounded-full transition-all ${progressColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
              {percentage}% atingido
            </span>
          </div>
        </td>

        {/* Valores */}
        <td className="px-4 py-3 text-sm">
          <div className="font-medium text-gray-900">{formatCurrency(goal.current_amount)}</div>
          <div className="text-xs text-gray-500">de {formatCurrency(goal.target_amount)}</div>
        </td>

        {/* Data Alvo */}
        <td className="px-4 py-3 text-sm">
          <div className="text-gray-900">{formatDate(goal.target_date)}</div>
          <div className={`text-xs ${daysInfo.color}`}>{daysInfo.label}</div>
        </td>

        {/* Status */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={getStatusBadgeClasses(goal.status)}>
            {getStatusIcon(goal.status)} {getStatusLabel(goal.status)}
          </span>
        </td>

        {/* Ações */}
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <div className="flex items-center justify-center gap-2">
            {goal.status === 'active' && onComplete && (
              <button
                onClick={() => onComplete(goal.id)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Marcar como concluída"
              >
                <CheckCircle size={16} />
              </button>
            )}
            <button
              onClick={() => onEdit(goal)}
              className="text-indigo-600 hover:text-indigo-900 p-1"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card */}
      <div className="md:hidden bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3">
        {/* Header: Nome + Ações */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{goal.name}</h3>
            {goal.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                {goal.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {goal.status === 'active' && onComplete && (
              <button
                onClick={() => onComplete(goal.id)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Marcar como concluída"
              >
                <CheckCircle size={16} />
              </button>
            )}
            <button
              onClick={() => onEdit(goal)}
              className="text-indigo-600 hover:text-indigo-900 p-1"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progresso</span>
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Valores */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Atual</span>
          <span className="text-sm font-medium text-gray-900">{formatCurrency(goal.current_amount)}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">Meta</span>
          <span className="text-sm font-medium text-gray-900">{formatCurrency(goal.target_amount)}</span>
        </div>

        {/* Data Alvo + Status */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div>
            <span className="text-xs text-gray-600">Data Alvo: {formatDate(goal.target_date)}</span>
            <p className={`text-xs ${daysInfo.color}`}>{daysInfo.label}</p>
          </div>
          <span className={getStatusBadgeClasses(goal.status)}>
            {getStatusIcon(goal.status)} {getStatusLabel(goal.status)}
          </span>
        </div>
      </div>
    </>
  )
})

GoalItem.displayName = 'GoalItem'

// Main component
const GoalsList = React.memo<GoalsListProps>(
  ({ goals, loading, onEdit, onDelete, onComplete }) => {
    // Loading state
    if (loading && goals.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Carregando metas...</p>
          </div>
        </div>
      )
    }

    // Empty state
    if (goals.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-2">Nenhuma meta cadastrada</p>
            <p className="text-sm text-gray-400">Comece criando sua primeira meta de economia</p>
          </div>
        </div>
      )
    }

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progresso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valores
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data Alvo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {goals.map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onComplete={onComplete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          ))}
        </div>
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.goals === nextProps.goals &&
      prevProps.loading === nextProps.loading &&
      prevProps.onEdit === nextProps.onEdit &&
      prevProps.onDelete === nextProps.onDelete &&
      prevProps.onComplete === nextProps.onComplete
    )
  }
)

GoalsList.displayName = 'GoalsList'

export default GoalsList
