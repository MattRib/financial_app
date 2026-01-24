import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react'
import type { Transaction, TransactionType, Category } from '../../types'

interface TransactionModalProps {
  isOpen: boolean
  transaction: Transaction | null
  categories: Category[]
  loading?: boolean
  onClose: () => void
  onSubmit: (data: {
    date: string
    type: TransactionType
    category_id?: string
    amount: number
    description?: string
    tags?: string[]
  }) => Promise<void>
}

// Transaction type configuration
const TRANSACTION_TYPES = [
  {
    id: 'income' as const,
    label: 'Entrada',
    icon: TrendingUp,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500',
    selectedBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'expense' as const,
    label: 'Saída',
    icon: TrendingDown,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-500',
    selectedBg: 'bg-red-100 dark:bg-red-900/30',
  },
]

// Format currency to Brazilian Real
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Parse currency input to number
const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/\D/g, '')
  if (!numericValue) return 0
  return Number(numericValue) / 100
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  transaction,
  categories,
  loading = false,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [formType, setFormType] = useState<TransactionType>('expense')
  const [formCategoryId, setFormCategoryId] = useState<string>('')
  const [formAmount, setFormAmount] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [formTagInput, setFormTagInput] = useState<string>('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Track previous isOpen to detect when modal opens
  const prevIsOpenRef = useRef(isOpen)

  // Filter categories by form type
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === formType)
  }, [categories, formType])

  // Get selected category for preview
  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === formCategoryId)
  }, [categories, formCategoryId])

  // Reset or populate form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        if (transaction) {
          setFormDate(transaction.date)
          setFormType(transaction.type)
          setFormCategoryId(transaction.category_id || '')
          setFormAmount(formatCurrency(transaction.amount))
          setFormDescription(transaction.description || '')
          setFormTags(transaction.tags || [])
        } else {
          setFormDate(new Date().toISOString().split('T')[0])
          setFormType('expense')
          setFormCategoryId('')
          setFormAmount('')
          setFormDescription('')
          setFormTags([])
        }
        setFormTagInput('')
        setFormErrors({})
        setSubmitError(null)
      }, 0)
    }
  }, [isOpen, transaction])

  // Lock body scroll when modal is open
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

  // Handle amount change with currency mask
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')

    if (numericValue) {
      const numberValue = Number(numericValue) / 100
      const formatted = formatCurrency(numberValue)
      setFormAmount(formatted)
    } else {
      setFormAmount('')
    }

    if (formErrors.amount) {
      setFormErrors((prev) => ({ ...prev, amount: '' }))
    }
  }

  // Handle tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = formTagInput.trim().toLowerCase()
      if (tag && !formTags.includes(tag) && formTags.length < 10) {
        setFormTags([...formTags, tag])
        setFormTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((tag) => tag !== tagToRemove))
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formDate) {
      errors.date = 'Data é obrigatória'
    }

    const amountValue = parseCurrency(formAmount)
    if (!formAmount || amountValue <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) return

    try {
      await onSubmit({
        date: formDate,
        type: formType,
        category_id: formCategoryId || undefined,
        amount: parseCurrency(formAmount),
        description: formDescription.trim() || undefined,
        tags: formTags.length > 0 ? formTags : undefined,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar transação')
    }
  }

  // Get type config for preview
  const getTypeConfig = (type: TransactionType) => {
    return TRANSACTION_TYPES.find((t) => t.id === type) || TRANSACTION_TYPES[1]
  }

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
            className="
              relative bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl shadow-2xl
              w-full max-w-lg max-h-[90vh] overflow-y-auto
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {transaction ? 'Editar Transação' : 'Nova Transação'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-5">
                {/* Date & Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      <Calendar size={14} />
                      Data
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => {
                        setFormDate(e.target.value)
                        if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: '' }))
                      }}
                      className={`
                        w-full px-3 py-2.5 rounded-xl
                        bg-slate-50 dark:bg-slate-800
                        border ${formErrors.date ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100 text-sm
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                        transition-colors
                      `}
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>
                    )}
                  </div>

                  {/* Type Toggle */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                      Tipo
                    </label>
                    <div className="flex gap-2">
                      {TRANSACTION_TYPES.map((type) => {
                        const Icon = type.icon
                        const isSelected = formType === type.id
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setFormType(type.id)
                              setFormCategoryId('') // Reset category when type changes
                            }}
                            className={`
                              flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                              flex items-center justify-center gap-1.5
                              border-2
                              ${isSelected
                                ? `${type.selectedBg} ${type.textColor} ${type.borderColor}`
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                              }
                            `}
                          >
                            <Icon size={14} />
                            {type.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                    Valor
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={formAmount}
                    onChange={handleAmountChange}
                    className={`
                      w-full px-4 py-3 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100 text-xl font-semibold
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    `}
                  />
                  {formErrors.amount && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.amount}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                    Categoria
                  </label>
                  {filteredCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {/* "None" option */}
                      <button
                        type="button"
                        onClick={() => setFormCategoryId('')}
                        className={`
                          px-3 py-2 rounded-xl text-sm font-medium transition-all
                          ${!formCategoryId
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 ring-2 ring-slate-900 dark:ring-slate-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        Nenhuma
                      </button>
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormCategoryId(cat.id)}
                          className={`
                            px-3 py-2 rounded-xl text-sm font-medium transition-all
                            flex items-center gap-1.5
                            ${formCategoryId === cat.id
                              ? 'ring-2 ring-slate-900 dark:ring-slate-100'
                              : 'hover:scale-105'
                            }
                          `}
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                      Nenhuma categoria disponível para {formType === 'income' ? 'entradas' : 'saídas'}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                    Descrição
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Compras no supermercado"
                    value={formDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 255) {
                        setFormDescription(e.target.value)
                      }
                    }}
                    maxLength={255}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    "
                  />
                  <div className="mt-1 flex justify-end">
                    <p className={`text-xs ${formDescription.length >= 240 ? 'text-amber-600' : 'text-slate-400 dark:text-slate-500'}`}>
                      {formDescription.length}/255
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <Tag size={14} />
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Digite e pressione Enter"
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    "
                  />
                  {formTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {formTags.map((tag) => (
                        <span
                          key={tag}
                          className="
                            inline-flex items-center gap-1 px-2 py-1
                            bg-slate-100 dark:bg-slate-800
                            text-slate-700 dark:text-slate-300
                            rounded-lg text-xs font-medium
                          "
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Máximo de 10 tags ({formTags.length}/10)
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-3">Preview</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: selectedCategory ? `${selectedCategory.color}20` : 'rgb(241 245 249)',
                          color: selectedCategory?.color || 'rgb(148 163 184)',
                        }}
                      >
                        {selectedCategory?.icon || '📋'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {formDescription || 'Descrição da transação'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formDate ? new Date(formDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${formType === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                        {formType === 'income' ? '+' : '-'} {formAmount || 'R$ 0,00'}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getTypeConfig(formType).bgColor} ${getTypeConfig(formType).textColor}`}>
                        {formType === 'income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {getTypeConfig(formType).label}
                      </span>
                    </div>
                  </div>
                  {formTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {formTags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-400
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    text-sm font-medium transition-colors
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                    text-white text-sm font-medium transition-colors
                    disabled:opacity-50
                  "
                >
                  {loading ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
