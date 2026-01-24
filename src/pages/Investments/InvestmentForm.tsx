import React, { useState, useEffect } from 'react'
import type {
  Investment,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentType,
} from '../../types'

interface InvestmentFormProps {
  initialData?: Investment
  onSubmit: (data: CreateInvestmentDto | UpdateInvestmentDto) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditMode = !!initialData

  const [date, setDate] = useState<string>(() => {
    if (initialData?.date) {
      return new Date(initialData.date).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [type, setType] = useState<InvestmentType>(initialData?.type || 'renda_fixa')
  const [name, setName] = useState<string>(initialData?.name || '')
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? formatCurrency(String(Math.round(initialData.amount * 100))) : ''
  )
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

  const getTypeLabel = (typeValue: InvestmentType): string => {
    switch (typeValue) {
      case 'renda_fixa':
        return 'Renda Fixa'
      case 'renda_variavel':
        return 'Renda Variável'
      case 'cripto':
        return 'Criptomoedas'
      case 'outros':
        return 'Outros'
      default:
        return typeValue
    }
  }

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')

    if (numericValue) {
      const formatted = formatCurrency(numericValue)
      setAmount(formatted)
    } else {
      setAmount('')
    }

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }))
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

    // Date
    if (!date) {
      newErrors.date = 'Data é obrigatória'
    } else {
      const selectedDate = new Date(date)
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Data inválida'
      }
    }

    // Name
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Amount
    const amountValue = parseCurrency(amount)
    if (!amount || amountValue <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
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
      const amountValue = parseCurrency(amount)
      const formData: CreateInvestmentDto | UpdateInvestmentDto = {
        date,
        type,
        name: name.trim(),
        amount: amountValue,
        ...(notes.trim() && { notes: notes.trim() }),
      }

      await onSubmit(formData)

      if (!isEditMode) {
        setDate(new Date().toISOString().split('T')[0])
        setType('renda_fixa')
        setName('')
        setAmount('')
        setNotes('')
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar investimento')
    }
  }

  // Clear specific errors on change
  useEffect(() => {
    if (errors.date && date) {
      setErrors((prev) => ({ ...prev, date: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Data <span className="text-red-600">*</span>
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            if (errors.date) {
              setErrors((prev) => ({ ...prev, date: '' }))
            }
          }}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.date ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      {/* Type Field */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo <span className="text-red-600">*</span>
        </label>
        <select
          id="type"
          required
          value={type}
          onChange={(e) => setType(e.target.value as InvestmentType)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="renda_fixa">Renda Fixa</option>
          <option value="renda_variavel">Renda Variável</option>
          <option value="cripto">Criptomoedas</option>
          <option value="outros">Outros</option>
        </select>

        {/* Visual indicator for type */}
        {type && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg">
              {type === 'renda_fixa' && '🏦'}
              {type === 'renda_variavel' && '📈'}
              {type === 'cripto' && '₿'}
              {type === 'outros' && '💼'}
            </span>
            <span className="px-2 py-1 rounded text-sm bg-indigo-50 text-indigo-700">
              {getTypeLabel(type)}
            </span>
          </div>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Investimento <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Tesouro Selic 2027"
          value={name}
          onChange={handleNameChange}
          maxLength={100}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.name ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          <p className="text-sm text-gray-500 ml-auto">{name.length}/100 caracteres</p>
        </div>
      </div>

      {/* Amount Field */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor <span className="text-red-600">*</span>
        </label>
        <input
          id="amount"
          type="text"
          placeholder="0,00"
          required
          value={amount}
          onChange={handleAmountChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.amount ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      {/* Notes Field */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          id="notes"
          placeholder="Observações sobre o investimento (opcional)"
          rows={4}
          value={notes}
          onChange={handleNotesChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.notes ? 'border-red-600' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
          <p className="text-sm text-gray-500 ml-auto">{notes.length}/500 caracteres</p>
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

export default InvestmentForm
