import React, { useState, useEffect, useMemo } from 'react'
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, Category, TransactionType } from '../../types'

interface TransactionFormProps {
  initialData?: Transaction
  categories: Category[]
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditMode = !!initialData

  // Form state
  const [date, setDate] = useState(() => {
    if (initialData?.date) {
      return new Date(initialData.date).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense')
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [description, setDescription] = useState<string>(initialData?.description || '')
  const [amount, setAmount] = useState<string>(initialData?.amount ? initialData.amount.toString() : '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Filter categories by selected type
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === type)
  }, [categories, type])

  // Format amount to Brazilian currency
  const formatCurrency = (value: string): string => {
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
    
    // Clear amount error
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }))
    }
  }

  // Handle description change with character limit
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 255) {
      setDescription(value)
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: '' }))
      }
    }
  }

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmedTag = tagInput.trim()
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag])
        setTagInput('')
      }
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate date
    if (!date) {
      newErrors.date = 'Data é obrigatória'
    } else {
      const selectedDate = new Date(date)
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Data inválida'
      }
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
      const formData: CreateTransactionDto | UpdateTransactionDto = {
        date,
        type,
        amount: amountValue,
        ...(categoryId && { category_id: categoryId }),
        ...(description && { description: description.trim() }),
        ...(tags.length > 0 && { tags }),
      }

      await onSubmit(formData)
      
      // Reset form only if not in edit mode
      if (!isEditMode) {
        setDate(new Date().toISOString().split('T')[0])
        setType('expense')
        setCategoryId('')
        setDescription('')
        setAmount('')
        setTags([])
        setTagInput('')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar transação')
    }
  }

  // Reset category when type changes
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find((cat) => cat.id === categoryId)
      if (selectedCategory && selectedCategory.type !== type) {
        setCategoryId('')
      }
    }
  }, [type, categoryId, categories])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Data <span className="text-red-500">*</span>
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
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      {/* Type Field */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          required
          value={type}
          onChange={(e) => {
            setType(e.target.value as TransactionType)
            setCategoryId('')
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            type === 'income'
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
          }`}
        >
          <option value="expense">Saída</option>
          <option value="income">Entrada</option>
        </select>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {type === 'income' ? (
            <>
              <span className="text-green-600">💰</span>
              <span className="text-green-600">Entrada de dinheiro</span>
            </>
          ) : (
            <>
              <span className="text-red-600">💸</span>
              <span className="text-red-600">Saída de dinheiro</span>
            </>
          )}
        </div>
      </div>

      {/* Category Field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
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

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <input
          id="description"
          type="text"
          placeholder="Ex: Compras no supermercado"
          value={description}
          onChange={handleDescriptionChange}
          maxLength={255}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {description.length}/255 caracteres
          </p>
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

      {/* Tags Field */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          placeholder="Digite uma tag e pressione Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleTagKeyPress}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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

export default TransactionForm

