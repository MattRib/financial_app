import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target } from 'lucide-react'
import { GoalProgressBar } from './GoalProgressBar'
import {
  GOAL_CATEGORY_CONFIG,
  GOAL_CATEGORY_OPTIONS,
  calculateProgress,
} from '../../constants/goals'
import type { Goal, GoalCategory, CreateGoalDto, UpdateGoalDto } from '../../types'

interface GoalModalProps {
  isOpen: boolean
  goal: Goal | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateGoalDto | UpdateGoalDto) => Promise<void>
}

interface FormErrors {
  name?: string
  targetAmount?: string
  currentAmount?: string
  targetDate?: string
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

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  goal,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!goal

  // Form state
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [category, setCategory] = useState<GoalCategory | ''>('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Track previous isOpen
  const prevIsOpenRef = React.useRef(isOpen)

  // Initialize form values when goal changes (using useMemo pattern)
  const initialValues = React.useMemo(() => {
    if (goal) {
      return {
        name: goal.name,
        targetAmount: goal.target_amount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currentAmount: goal.current_amount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        targetDate: goal.target_date.split('T')[0],
        category: goal.category || '' as GoalCategory | '',
        notes: goal.notes || '',
      }
    }
    return {
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: '' as GoalCategory | '',
      notes: '',
    }
  }, [goal])

  // Reset form when modal opens
  React.useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        setName(initialValues.name)
        setTargetAmount(initialValues.targetAmount)
        setCurrentAmount(initialValues.currentAmount)
        setTargetDate(initialValues.targetDate)
        setCategory(initialValues.category)
        setNotes(initialValues.notes)
        setErrors({})
      }, 0)
    }
  }, [isOpen, initialValues])

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

  // Calculate preview progress
  const previewProgress = useMemo(() => {
    const target = parseCurrencyInput(targetAmount)
    const current = parseCurrencyInput(currentAmount)
    return calculateProgress(current, target)
  }, [targetAmount, currentAmount])

  // Get selected category config
  const selectedCategoryConfig = category ? GOAL_CATEGORY_CONFIG[category] : null

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    } else if (name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    const targetValue = parseCurrencyInput(targetAmount)
    if (!targetAmount || targetValue <= 0) {
      newErrors.targetAmount = 'Valor alvo deve ser maior que zero'
    }

    const currentValue = parseCurrencyInput(currentAmount)
    if (currentValue < 0) {
      newErrors.currentAmount = 'Valor atual não pode ser negativo'
    }
    if (currentValue > targetValue) {
      newErrors.currentAmount = 'Valor atual não pode ser maior que o alvo'
    }

    if (!targetDate) {
      newErrors.targetDate = 'Data alvo é obrigatória'
    } else if (!isEditing) {
      const target = new Date(targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (target < today) {
        newErrors.targetDate = 'Data alvo deve ser futura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data: CreateGoalDto | UpdateGoalDto = {
      name: name.trim(),
      target_amount: parseCurrencyInput(targetAmount),
      current_amount: parseCurrencyInput(currentAmount),
      target_date: targetDate,
      ...(category && { category }),
      ...(notes.trim() && { notes: notes.trim() }),
    }

    await onSubmit(data)
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
              w-full max-w-md max-h-[90vh] overflow-y-auto
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {isEditing ? 'Editar Meta' : 'Nova Meta'}
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                {/* Preview card */}
                {(name || selectedCategoryConfig) && (
                  <div
                    className={`
                      p-4 rounded-xl border
                      bg-slate-50 dark:bg-slate-800/50
                      border-slate-200 dark:border-slate-700
                    `}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center text-lg
                          ${selectedCategoryConfig?.bgColor || 'bg-slate-200 dark:bg-slate-700'}
                        `}
                      >
                        {selectedCategoryConfig?.emoji || '🎯'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {name || 'Nome da meta'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedCategoryConfig?.label || 'Selecione uma categoria'}
                        </p>
                      </div>
                    </div>
                    <GoalProgressBar percentage={previewProgress} size="sm" showLabel />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome da meta *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Viagem para Europa"
                    maxLength={100}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-white dark:bg-slate-800
                      border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                      focus:border-transparent
                      transition-colors duration-200
                    `}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Target amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor alvo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      R$
                    </span>
                    <input
                      type="text"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(formatCurrencyInput(e.target.value))}
                      placeholder="0,00"
                      className={`
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                        bg-white dark:bg-slate-800
                        border ${errors.targetAmount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                        focus:border-transparent
                        transition-colors duration-200
                        tabular-nums
                      `}
                    />
                  </div>
                  {errors.targetAmount && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.targetAmount}
                    </p>
                  )}
                </div>

                {/* Current amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor atual
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      R$
                    </span>
                    <input
                      type="text"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(formatCurrencyInput(e.target.value))}
                      placeholder="0,00"
                      className={`
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                        bg-white dark:bg-slate-800
                        border ${errors.currentAmount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                        focus:border-transparent
                        transition-colors duration-200
                        tabular-nums
                      `}
                    />
                  </div>
                  {errors.currentAmount && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.currentAmount}
                    </p>
                  )}
                </div>

                {/* Target date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Data alvo *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-white dark:bg-slate-800
                      border ${errors.targetDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100
                      focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                      focus:border-transparent
                      transition-colors duration-200
                    `}
                  />
                  {errors.targetDate && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.targetDate}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory | '')}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100
                      focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                      focus:border-transparent
                      transition-colors duration-200
                    `}
                  >
                    <option value="">Selecione uma categoria</option>
                    {GOAL_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione notas sobre esta meta..."
                    rows={3}
                    maxLength={500}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm resize-none
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
                      focus:border-transparent
                      transition-colors duration-200
                    `}
                  />
                </div>
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
                  disabled={loading}
                  className={`
                    flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                    bg-slate-900 dark:bg-slate-700
                    hover:bg-slate-800 dark:hover:bg-slate-600
                    text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  `}
                >
                  {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar meta'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
