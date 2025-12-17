import React, { useState, useMemo } from 'react'
import type { Budget, CreateBudgetDto, UpdateBudgetDto, Category } from '../../types'

interface BudgetFormProps {
  initialData?: Budget
  categories: Category[]
  onSubmit: (data: CreateBudgetDto | UpdateBudgetDto) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

// Months in Portuguese
const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

const BudgetForm: React.FC<BudgetFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditMode = !!initialData

  // Get current month and year
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Form state
  const [budgetType, setBudgetType] = useState<'general' | 'category'>(
    initialData?.category_id ? 'category' : 'general'
  )
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [month, setMonth] = useState<number>(initialData?.month || currentMonth)
  const [year, setYear] = useState<number>(initialData?.year || currentYear)
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Filter categories by expense type
  const expenseCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === 'expense')
  }, [categories])

  // Format amount to Brazilian currency
  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''

    const numberValue = Number(numericValue) / 100

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue)
  }

  // Parse currency string to number
  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return 0
    return Number(numericValue) / 100
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

  // Generate year options (current year ± 2 years)
  const yearOptions = useMemo(() => {
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i)
    }
    return years
  }, [currentYear])

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate budget type
    if (budgetType === 'category' && !categoryId) {
      newErrors.category_id = 'Categoria é obrigatória quando selecionar "Por Categoria"'
    }

    // Validate month
    if (!month || month < 1 || month > 12) {
      newErrors.month = 'Mês inválido'
    }

    // Validate year
    if (!year || year < 2000 || year > 2100) {
      newErrors.year = 'Ano inválido'
    }

    // Validate amount
    const amountValue = parseCurrency(amount)
    if (!amount || amountValue <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    try {
      const amountValue = parseCurrency(amount)
      const formData: CreateBudgetDto | UpdateBudgetDto = {
        amount: amountValue,
        month,
        year,
        ...(budgetType === 'category' && categoryId
          ? { category_id: categoryId }
          : { category_id: undefined }),
      }

      await onSubmit(formData)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar orçamento')
    }
  }

  // Handle budget type change
  const handleBudgetTypeChange = (type: 'general' | 'category') => {
    setBudgetType(type)
    if (type === 'general') {
      setCategoryId('')
      if (errors.category_id) {
        setErrors((prev) => ({ ...prev, category_id: '' }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Budget Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Orçamento <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleBudgetTypeChange('general')}
            className={`px-4 py-3 rounded-md border-2 transition-all ${
              budgetType === 'general'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm">Orçamento Geral</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleBudgetTypeChange('category')}
            className={`px-4 py-3 rounded-md border-2 transition-all ${
              budgetType === 'category'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">🏷️</div>
              <div className="text-sm">Por Categoria</div>
            </div>
          </button>
        </div>
      </div>

      {/* Category Field (only if "Por Categoria") */}
      {budgetType === 'category' && (
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            required={budgetType === 'category'}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              if (errors.category_id) {
                setErrors((prev) => ({ ...prev, category_id: '' }))
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.category_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione uma categoria</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
          {categoryId && (
            <div className="mt-2 flex items-center gap-2">
              {(() => {
                const selectedCategory = categories.find((cat) => cat.id === categoryId)
                if (selectedCategory) {
                  return (
                    <>
                      <span style={{ color: selectedCategory.color }}>
                        {selectedCategory.icon}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: `${selectedCategory.color}20`,
                          color: selectedCategory.color,
                        }}
                      >
                        {selectedCategory.name}
                      </span>
                    </>
                  )
                }
                return null
              })()}
            </div>
          )}
        </div>
      )}

      {/* Month and Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
            Mês <span className="text-red-500">*</span>
          </label>
          <select
            id="month"
            required
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value))
              if (errors.month) {
                setErrors((prev) => ({ ...prev, month: '' }))
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.month ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {MONTHS.map((monthOption) => (
              <option key={monthOption.value} value={monthOption.value}>
                {monthOption.label}
              </option>
            ))}
          </select>
          {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Ano <span className="text-red-500">*</span>
          </label>
          <select
            id="year"
            required
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value))
              if (errors.year) {
                setErrors((prev) => ({ ...prev, year: '' }))
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
        </div>
      </div>

      {/* Amount Field */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="text"
          placeholder="0,00"
          required
          value={amount}
          onChange={handleAmountChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
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

export default BudgetForm

