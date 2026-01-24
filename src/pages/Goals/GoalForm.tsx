import React, { useState, useEffect, useMemo } from 'react'
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
} from '../../types'

interface GoalFormProps {
  initialData?: Goal
  onSubmit: (data: CreateGoalDto | UpdateGoalDto) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditMode = !!initialData

  const [name, setName] = useState<string>(initialData?.name || '')
  const [targetAmount, setTargetAmount] = useState<string>(
    initialData?.target_amount ? formatCurrency(String(Math.round(initialData.target_amount * 100))) : ''
  )
  const [currentAmount, setCurrentAmount] = useState<string>(
    initialData?.current_amount ? formatCurrency(String(Math.round(initialData.current_amount * 100))) : 'R$ 0,00'
  )
  const [targetDate, setTargetDate] = useState<string>(
    initialData?.target_date ? new Date(initialData.target_date).toISOString().split('T')[0] : ''
  )
  const [category, setCategory] = useState<string>(initialData?.category || '')
  const [notes, setNotes] = useState<string>(initialData?.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Format amount to Brazilian currency
  function formatCurrency(value: string): string {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''

    // Convert to number and divide by 100 to get decimal value
    const numberValue = Number(numericValue) / 100

    // Format as Brazilian currency
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue)
  }

  // Parse currency string to number
  function parseCurrency(value: string): number {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return 0
    return Number(numericValue) / 100
  }

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    if (!targetDate) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isPast = diffDays < 0
    const absDays = Math.abs(diffDays)

    let label = ''
    if (isPast) {
      label = absDays === 1 ? 'Meta vencida há 1 dia' : `Meta vencida há ${absDays} dias`
    } else if (diffDays === 0) {
      label = 'Meta vence hoje'
    } else if (diffDays === 1) {
      label = 'Falta 1 dia'
    } else if (diffDays < 30) {
      label = `Faltam ${diffDays} dias`
    } else if (diffDays < 60) {
      label = 'Falta 1 mês'
    } else {
      const months = Math.floor(diffDays / 30)
      label = `Faltam ${months} meses`
    }

    return { days: diffDays, isPast, label }
  }, [targetDate])

  // Calculate progress percentage
  const progress = useMemo(() => {
    const target = parseCurrency(targetAmount)
    const current = parseCurrency(currentAmount)
    if (target === 0) return 0
    return Math.min(100, Math.round((current / target) * 100))
  }, [targetAmount, currentAmount])

  // Get progress bar color
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-600'
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  // Handle amount input change
  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>, errorKey: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')

    if (numericValue) {
      const formatted = formatCurrency(numericValue)
      setter(formatted)
    } else {
      setter('')
    }

    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  // Handle name change with character limit
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 100) {
      setName(value)
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: '' }))
      }
    }
  }

  // Handle category change with character limit
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 50) {
      setCategory(value)
    }
  }

  // Handle notes change with character limit
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 500) {
      setNotes(value)
    }
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Name
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Target Amount
    const targetValue = parseCurrency(targetAmount)
    if (!targetAmount || targetValue <= 0) {
      newErrors.targetAmount = 'Valor alvo deve ser maior que zero'
    }

    // Current Amount
    const currentValue = parseCurrency(currentAmount)
    if (currentValue < 0) {
      newErrors.currentAmount = 'Valor atual não pode ser negativo'
    } else if (targetValue > 0 && currentValue > targetValue) {
      newErrors.currentAmount = 'Valor atual não pode ser maior que o valor alvo'
    }

    // Target Date
    if (!targetDate) {
      newErrors.targetDate = 'Data alvo é obrigatória'
    } else {
      const selected = new Date(targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selected.setHours(0, 0, 0, 0)

      if (isNaN(selected.getTime())) {
        newErrors.targetDate = 'Data inválida'
      } else if (selected < today && !isEditMode) {
        newErrors.targetDate = 'Data alvo deve ser futura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    try {
      const targetValue = parseCurrency(targetAmount)
      const currentValue = parseCurrency(currentAmount)

      const formData: CreateGoalDto | UpdateGoalDto = {
        name: name.trim(),
        target_amount: targetValue,
        current_amount: currentValue,
        target_date: targetDate,
        ...(category.trim() && { category: category.trim() }),
        ...(notes.trim() && { notes: notes.trim() }),
      }

      await onSubmit(formData)

      if (!isEditMode) {
        setName('')
        setTargetAmount('')
        setCurrentAmount('R$ 0,00')
        setTargetDate('')
        setCategory('')
        setNotes('')
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar meta')
    }
  }

  // Clear specific errors on change
  useEffect(() => {
    if (errors.targetDate && targetDate) {
      setErrors((prev) => ({ ...prev, targetDate: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Meta <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Viagem para Europa"
          value={name}
          onChange={handleNameChange}
          maxLength={100}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
            errors.name ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          <p className="text-sm text-gray-500 ml-auto">{name.length}/100 caracteres</p>
        </div>
      </div>

      {/* Target Amount Field */}
      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor Alvo <span className="text-red-600">*</span>
        </label>
        <input
          id="targetAmount"
          type="text"
          placeholder="0,00"
          required
          value={targetAmount}
          onChange={handleAmountChange(setTargetAmount, 'targetAmount')}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
            errors.targetAmount ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        {errors.targetAmount && <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>}
      </div>

      {/* Current Amount Field */}
      <div>
        <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor Atual
        </label>
        <input
          id="currentAmount"
          type="text"
          placeholder="0,00"
          value={currentAmount}
          onChange={handleAmountChange(setCurrentAmount, 'currentAmount')}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
            errors.currentAmount ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        {errors.currentAmount && <p className="mt-1 text-sm text-red-600">{errors.currentAmount}</p>}

        {/* Progress Bar */}
        {targetAmount && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className="text-sm font-medium text-gray-900">{progress}% atingido</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Target Date Field */}
      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
          Data Alvo <span className="text-red-600">*</span>
        </label>
        <input
          id="targetDate"
          type="date"
          required
          value={targetDate}
          onChange={(e) => {
            setTargetDate(e.target.value)
            if (errors.targetDate) {
              setErrors((prev) => ({ ...prev, targetDate: '' }))
            }
          }}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
            errors.targetDate ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        {errors.targetDate && <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>}

        {/* Days Remaining */}
        {daysRemaining && (
          <p
            className={`mt-1 text-sm ${
              daysRemaining.isPast ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {daysRemaining.label}
          </p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <input
          id="category"
          type="text"
          placeholder="Ex: Viagem, Eletrônicos, Casa"
          value={category}
          onChange={handleCategoryChange}
          maxLength={50}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Notes Field */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          id="notes"
          placeholder="Observações sobre esta meta (opcional)"
          rows={4}
          value={notes}
          onChange={handleNotesChange}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
        />
        <div className="mt-1 flex justify-end">
          <p className="text-sm text-gray-500">{notes.length}/500 caracteres</p>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}

export default GoalForm
