import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, TrendingUp } from 'lucide-react'
import { GoalProgressBar } from './GoalProgressBar'
import {
  GOAL_CATEGORY_CONFIG,
  calculateProgress,
  formatGoalCurrency,
} from '../../constants/goals'
import type { Goal } from '../../types'

interface AddProgressModalProps {
  isOpen: boolean
  goal: Goal | null
  loading?: boolean
  onClose: () => void
  onSubmit: (amount: number) => Promise<void>
}

// Currency formatting helpers
const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''
  const cents = parseInt(numbers, 10)
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const parseCurrencyInput = (value: string): number => {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return 0
  return parseInt(numbers, 10) / 100
}

export const AddProgressModal: React.FC<AddProgressModalProps> = ({
  isOpen,
  goal,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  // Track previous isOpen
  const prevIsOpenRef = useRef(isOpen)

  // Reset form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        setAmount('')
        setError('')
      }, 0)
    }
  }, [isOpen])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Calculate new values
  const calculations = useMemo(() => {
    if (!goal) return null

    const addAmount = parseCurrencyInput(amount)
    const newCurrent = goal.current_amount + addAmount
    const currentProgress = calculateProgress(goal.current_amount, goal.target_amount)
    const newProgress = calculateProgress(newCurrent, goal.target_amount)
    const remaining = Math.max(0, goal.target_amount - newCurrent)

    return {
      addAmount,
      newCurrent,
      currentProgress,
      newProgress,
      remaining,
      willComplete: newCurrent >= goal.target_amount,
    }
  }, [goal, amount])

  // Get category config
  const categoryConfig = goal?.category
    ? GOAL_CATEGORY_CONFIG[goal.category]
    : GOAL_CATEGORY_CONFIG.other

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!calculations) return

    if (calculations.addAmount <= 0) {
      setError('O valor deve ser maior que zero')
      return
    }

    setError('')
    await onSubmit(calculations.addAmount)
  }

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!goal) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`
              relative bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl shadow-2xl
              w-full max-w-sm
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Adicionar Progresso
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-colors
                  text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-800
                `}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                {/* Goal info */}
                <div
                  className={`
                    p-4 rounded-xl
                    bg-slate-50 dark:bg-slate-800/50
                    border border-slate-200 dark:border-slate-700
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-lg
                        ${categoryConfig.bgColor}
                      `}
                    >
                      {categoryConfig.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {goal.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatGoalCurrency(goal.current_amount)} de{' '}
                        {formatGoalCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>
                  <GoalProgressBar
                    percentage={calculations?.currentProgress || 0}
                    size="sm"
                    showLabel
                  />
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor a adicionar *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      R$
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                      placeholder="0,00"
                      autoFocus
                      className={`
                        w-full pl-10 pr-3 py-3 rounded-lg text-lg font-medium
                        bg-white dark:bg-slate-800
                        border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600
                        focus:border-transparent
                        transition-colors duration-200
                        tabular-nums
                      `}
                    />
                  </div>
                  {error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>

                {/* Preview */}
                {calculations && calculations.addAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      p-4 rounded-xl
                      ${calculations.willComplete
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp
                        size={16}
                        className={
                          calculations.willComplete
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          calculations.willComplete
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {calculations.willComplete ? '🎉 Meta será concluída!' : 'Após adicionar'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Novo total:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatGoalCurrency(calculations.newCurrent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Progresso:</span>
                        <span
                          className={`font-medium tabular-nums ${
                            calculations.willComplete
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {calculations.currentProgress}% → {calculations.newProgress}%
                        </span>
                      </div>
                      {!calculations.willComplete && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Restante:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatGoalCurrency(calculations.remaining)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className={`
                    flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                    border border-slate-200 dark:border-slate-700
                    text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  `}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !calculations || calculations.addAmount <= 0}
                  className={`
                    flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                    bg-emerald-600 hover:bg-emerald-700
                    dark:bg-emerald-600 dark:hover:bg-emerald-700
                    text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  `}
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
