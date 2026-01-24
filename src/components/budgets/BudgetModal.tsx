import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Wallet, Tag } from 'lucide-react'
import type { Budget, Category, CreateBudgetDto, UpdateBudgetDto } from '../../types'
import { MONTHS } from '../../constants'
import { BudgetProgressBar } from './BudgetProgressBar'

interface BudgetModalProps {
  isOpen: boolean
  budget: Budget | null
  categories: Category[]
  loading?: boolean
  currentMonth: number
  currentYear: number
  onClose: () => void
  onSubmit: (data: CreateBudgetDto | UpdateBudgetDto) => Promise<void>
}

// Generate year options (current year - 5 to current year + 1)
const generateYears = () => {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y)
  }
  return years
}

// Format currency input
const formatCurrencyInput = (value: string): string => {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  
  // Convert to number (cents)
  const number = parseInt(digits, 10) / 100
  
  // Format as BRL
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Parse formatted currency to number
const parseCurrencyInput = (value: string): number => {
  if (!value) return 0
  const digits = value.replace(/\D/g, '')
  return parseInt(digits, 10) / 100
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  budget,
  categories,
  loading = false,
  currentMonth,
  currentYear,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [budgetType, setBudgetType] = useState<'general' | 'category'>('category')
  const [categoryId, setCategoryId] = useState<string>('')
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [amountDisplay, setAmountDisplay] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  // Refs for dropdowns
  const categoryRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)

  // Track previous isOpen
  const prevIsOpenRef = useRef(isOpen)

  // Filter expense categories only
  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === 'expense'),
    [categories]
  )

  // Years list
  const years = useMemo(() => generateYears(), [])

  // Selected category object
  const selectedCategory = useMemo(
    () => expenseCategories.find((cat) => cat.id === categoryId),
    [expenseCategories, categoryId]
  )

  // Reset form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        if (budget) {
          // Edit mode
          setBudgetType(budget.category_id ? 'category' : 'general')
          setCategoryId(budget.category_id ?? '')
          setMonth(budget.month)
          setYear(budget.year)
          setAmountDisplay(formatCurrencyInput((budget.amount * 100).toString()))
        } else {
          // Create mode
          setBudgetType('category')
          setCategoryId(expenseCategories[0]?.id ?? '')
          setMonth(currentMonth)
          setYear(currentYear)
          setAmountDisplay('')
        }
        setFormErrors({})
        setSubmitError(null)
      }, 0)
    }
  }, [isOpen, budget, currentMonth, currentYear, expenseCategories])

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false)
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setAmountDisplay(formatted)
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (budgetType === 'category' && !categoryId) {
      errors.category = 'Selecione uma categoria'
    }
    
    const amount = parseCurrencyInput(amountDisplay)
    if (amount <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validateForm()) return

    const amount = parseCurrencyInput(amountDisplay)
    const data: CreateBudgetDto = {
      category_id: budgetType === 'category' ? categoryId : undefined,
      amount,
      month,
      year,
    }

    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar orçamento')
    }
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
              max-h-[90vh] overflow-y-auto
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Budget Type Toggle */}
                <div className="mb-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Tipo
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBudgetType('general')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        budgetType === 'general'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Wallet size={16} />
                      Geral
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('category')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        budgetType === 'category'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Tag size={16} />
                      Por Categoria
                    </button>
                  </div>
                </div>

                {/* Category Select (only if type is category) */}
                {budgetType === 'category' && (
                  <div className="mb-4" ref={categoryRef}>
                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                      Categoria
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className={`
                          w-full px-4 py-3 rounded-xl text-left
                          bg-slate-50 dark:bg-slate-800
                          border ${formErrors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                          text-slate-900 dark:text-slate-100
                          flex items-center justify-between
                          transition-colors cursor-pointer
                        `}
                      >
                        {selectedCategory ? (
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${selectedCategory.color}20` }}
                            >
                              {selectedCategory.icon}
                            </span>
                            <span>{selectedCategory.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Selecione uma categoria</span>
                        )}
                        <ChevronDown size={18} className="text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {showCategoryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="
                              absolute z-10 w-full mt-1
                              bg-white dark:bg-slate-800
                              border border-slate-200 dark:border-slate-700
                              rounded-xl shadow-lg
                              max-h-48 overflow-y-auto
                            "
                          >
                            {expenseCategories.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                Nenhuma categoria de despesa encontrada
                              </div>
                            ) : (
                              expenseCategories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setCategoryId(cat.id)
                                    setShowCategoryDropdown(false)
                                  }}
                                  className={`
                                    w-full px-4 py-2.5 flex items-center gap-3 text-left
                                    hover:bg-slate-50 dark:hover:bg-slate-700
                                    transition-colors cursor-pointer
                                    ${categoryId === cat.id ? 'bg-slate-50 dark:bg-slate-700' : ''}
                                  `}
                                >
                                  <span
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                    style={{ backgroundColor: `${cat.color}20` }}
                                  >
                                    {cat.icon}
                                  </span>
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {cat.name}
                                  </span>
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {formErrors.category && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                )}

                {/* Period Selects */}
                <div className="flex gap-3 mb-4">
                  {/* Month Select */}
                  <div className="flex-1" ref={monthRef}>
                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                      Mês
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className="
                          w-full px-4 py-3 rounded-xl text-left
                          bg-slate-50 dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700
                          text-slate-900 dark:text-slate-100
                          flex items-center justify-between
                          transition-colors cursor-pointer
                        "
                      >
                        <span>{MONTHS.find((m) => m.value === month)?.label}</span>
                        <ChevronDown size={18} className="text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {showMonthDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="
                              absolute z-10 w-full mt-1
                              bg-white dark:bg-slate-800
                              border border-slate-200 dark:border-slate-700
                              rounded-xl shadow-lg
                              max-h-48 overflow-y-auto
                            "
                          >
                            {MONTHS.map((m) => (
                              <button
                                key={m.value}
                                type="button"
                                onClick={() => {
                                  setMonth(m.value)
                                  setShowMonthDropdown(false)
                                }}
                                className={`
                                  w-full px-4 py-2.5 text-left text-sm
                                  hover:bg-slate-50 dark:hover:bg-slate-700
                                  transition-colors cursor-pointer
                                  ${month === m.value ? 'bg-slate-50 dark:bg-slate-700 font-medium' : ''}
                                  text-slate-700 dark:text-slate-300
                                `}
                              >
                                {m.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Year Select */}
                  <div className="w-28" ref={yearRef}>
                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                      Ano
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowYearDropdown(!showYearDropdown)}
                        className="
                          w-full px-4 py-3 rounded-xl text-left
                          bg-slate-50 dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700
                          text-slate-900 dark:text-slate-100
                          flex items-center justify-between
                          transition-colors cursor-pointer
                        "
                      >
                        <span>{year}</span>
                        <ChevronDown size={18} className="text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {showYearDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="
                              absolute z-10 w-full mt-1
                              bg-white dark:bg-slate-800
                              border border-slate-200 dark:border-slate-700
                              rounded-xl shadow-lg
                              max-h-48 overflow-y-auto
                            "
                          >
                            {years.map((y) => (
                              <button
                                key={y}
                                type="button"
                                onClick={() => {
                                  setYear(y)
                                  setShowYearDropdown(false)
                                }}
                                className={`
                                  w-full px-4 py-2.5 text-left text-sm
                                  hover:bg-slate-50 dark:hover:bg-slate-700
                                  transition-colors cursor-pointer
                                  ${year === y ? 'bg-slate-50 dark:bg-slate-700 font-medium' : ''}
                                  text-slate-700 dark:text-slate-300
                                `}
                              >
                                {y}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Valor do Orçamento
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      R$
                    </span>
                    <input
                      type="text"
                      value={amountDisplay}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      className={`
                        w-full pl-12 pr-4 py-3 rounded-xl
                        bg-slate-50 dark:bg-slate-800
                        border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100
                        text-lg font-semibold tabular-nums
                        placeholder:text-slate-400 placeholder:font-normal
                        focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400
                        transition-colors
                      `}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {parseCurrencyInput(amountDisplay) > 0 && (
                  <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      {budgetType === 'category' && selectedCategory ? (
                        <>
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${selectedCategory.color}20` }}
                          >
                            {selectedCategory.icon}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {selectedCategory.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-slate-200 dark:bg-slate-700">
                            💰
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            Orçamento Geral
                          </span>
                        </>
                      )}
                    </div>
                    <BudgetProgressBar
                      percentage={0}
                      spent={0}
                      total={parseCurrencyInput(amountDisplay)}
                      showValues
                      size="md"
                    />
                  </div>
                )}

                {/* Submit Error */}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {submitError}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-5">
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
                    disabled:opacity-50 cursor-pointer
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    bg-slate-900 hover:bg-slate-800
                    dark:bg-slate-700 dark:hover:bg-slate-600
                    text-white text-sm font-medium
                    transition-colors disabled:opacity-50 cursor-pointer
                  "
                >
                  {loading ? 'Salvando...' : budget ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
