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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitError, setSubmitError] = useState<string | null>(null)

  // Installment state
  const [showInstallments, setShowInstallments] = useState<boolean>(false)
  const [formInstallments, setFormInstallments] = useState<number | null>(null)

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
        setShowInstallments(false)
        setFormInstallments(null)
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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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
        tags: formTags.length ? formTags : undefined,
        total_installments: formInstallments || undefined,
      } as any)
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
              w-full max-w-md
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {transaction ? 'Editar Transação' : 'Nova Transação'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-5 py-4 space-y-4">
                {/* Date & Type Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Date - Takes 1 column */}
                  <div className="col-span-1">
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
                        border ${formErrors.date ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100 text-sm
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                        transition-colors cursor-pointer
                      `}
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.date}</p>
                    )}
                  </div>

                  {/* Type Toggle - Takes 2 columns for prominence */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                      Tipo
                    </label>
                    <div className="flex gap-2">
                      {TRANSACTION_TYPES.map((type) => {
                        const Icon = type.icon
                        const isSelected = formType === type.id
                        return (
                          <motion.button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setFormType(type.id)
                              setFormCategoryId('') // Reset category when type changes
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                              flex items-center justify-center gap-2
                              border-2 cursor-pointer
                              ${isSelected
                                ? `${type.selectedBg} ${type.textColor} ${type.borderColor}`
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                              }
                            `}
                          >
                            <Icon size={16} />
                            {type.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="text-base">💰</span>
                    Valor
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={formAmount}
                      onChange={handleAmountChange}
                      className={`
                        w-full px-4 py-3.5 rounded-xl
                        bg-slate-50 dark:bg-slate-800
                        border-2 ${formErrors.amount ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight
                        focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent
                        transition-all cursor-text
                        placeholder:text-slate-300 dark:placeholder:text-slate-600
                      `}
                    />
                  </div>
                  {formErrors.amount && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 mt-1.5 flex items-center gap-1"
                    >
                      <span>⚠️</span>
                      {formErrors.amount}
                    </motion.p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} />
                      Categoria
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {filteredCategories.length} disponíveis
                    </span>
                  </label>
                  {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {/* "None" option */}
                      <motion.button
                        type="button"
                        onClick={() => setFormCategoryId('')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          px-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                          flex items-center justify-center gap-1.5
                          ${!formCategoryId
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 ring-2 ring-slate-900 dark:ring-slate-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        <span className="text-sm">📋</span>
                        <span className="text-xs">Nenhuma</span>
                      </motion.button>
                      {filteredCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormCategoryId(cat.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            px-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                            flex items-center justify-center gap-1.5
                            ${formCategoryId === cat.id
                              ? 'ring-2 ring-slate-900 dark:ring-slate-100'
                              : ''
                            }
                          `}
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate text-xs">{cat.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                        Nenhuma categoria disponível para {formType === 'income' ? 'entradas' : 'saídas'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Descrição (opcional)
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
                      w-full px-3 py-2 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors cursor-text
                    "
                  />
                </div>

                {/* Installments - Only for expenses */}
                {formType === 'expense' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Parcelar compra?
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInstallments(!showInstallments)
                          if (showInstallments) setFormInstallments(null)
                        }}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                          ${showInstallments
                            ? 'bg-slate-900 dark:bg-slate-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }
                        `}
                      >
                        {showInstallments ? 'Sim' : 'Não'}
                      </button>
                    </div>

                    {showInstallments && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Número de parcelas
                        </label>

                        {/* Grid de botões rápidos */}
                        <div className="grid grid-cols-5 gap-2">
                          {[2, 3, 4, 5, 6, 10, 12, 15, 18, 24].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setFormInstallments(num)}
                              className={`
                                py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                ${formInstallments === num
                                  ? 'bg-slate-900 dark:bg-slate-700 text-white ring-2 ring-slate-900 dark:ring-slate-100'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }
                              `}
                            >
                              {num}x
                            </button>
                          ))}
                        </div>

                        {/* Input manual */}
                        <input
                          type="number"
                          min="2"
                          max="60"
                          placeholder="Ou digite (2-60)"
                          value={formInstallments || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (val >= 2 && val <= 60) {
                              setFormInstallments(val)
                            } else if (e.target.value === '') {
                              setFormInstallments(null)
                            }
                          }}
                          className="
                            w-full px-3 py-2 rounded-lg
                            bg-slate-50 dark:bg-slate-800
                            border border-slate-200 dark:border-slate-700
                            text-slate-900 dark:text-slate-100 text-sm
                            placeholder-slate-400 dark:placeholder-slate-500
                            focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                            transition-colors cursor-text
                          "
                        />

                        {/* Preview do parcelamento */}
                        {formInstallments && formInstallments > 1 && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formInstallments}x de{' '}
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(parseCurrency(formAmount) / formInstallments)}
                              </span>
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Total: {formAmount || 'R$ 0,00'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Error */}
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
              <div className="flex gap-3 px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-400
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    text-sm font-medium transition-colors cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
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
                    text-white text-sm font-medium transition-colors cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {loading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  )}
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
