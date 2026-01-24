import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import type { Investment, InvestmentType, CreateInvestmentDto, UpdateInvestmentDto } from '../../types'
import { INVESTMENT_TYPE_CONFIG } from '../../constants/investments'

interface InvestmentModalProps {
  isOpen: boolean
  investment: Investment | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateInvestmentDto | UpdateInvestmentDto) => Promise<void>
}

// Format currency input
const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const number = parseInt(digits, 10) / 100
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

// Format date for input
const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  investment,
  loading = false,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [formType, setFormType] = useState<InvestmentType>('renda_fixa')
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Type dropdown state
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const typeDropdownRef = useRef<HTMLDivElement>(null)

  // Track previous isOpen
  const prevIsOpenRef = useRef(isOpen)

  // Reset or populate form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        if (investment) {
          setFormType(investment.type)
          setFormName(investment.name)
          setFormAmount(formatCurrencyInput((investment.amount * 100).toString()))
          setFormDate(formatDateForInput(investment.date))
          setFormNotes(investment.notes || '')
        } else {
          setFormType('renda_fixa')
          setFormName('')
          setFormAmount('')
          setFormDate(new Date().toISOString().split('T')[0])
          setFormNotes('')
        }
        setFormErrors({})
        setSubmitError(null)
      }, 0)
    }
  }, [isOpen, investment])

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formName.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formName.trim().length < 2) {
      errors.name = 'Mínimo 2 caracteres'
    }
    
    const amount = parseCurrencyInput(formAmount)
    if (amount <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }
    
    if (!formDate) {
      errors.date = 'Data é obrigatória'
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
      const data: CreateInvestmentDto | UpdateInvestmentDto = {
        type: formType,
        name: formName.trim(),
        amount: parseCurrencyInput(formAmount),
        date: formDate,
        notes: formNotes.trim() || undefined,
      }
      await onSubmit(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  // Get current type config
  const currentTypeConfig = INVESTMENT_TYPE_CONFIG[formType]
  const CurrentTypeIcon = currentTypeConfig.icon

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
              w-full max-w-md max-h-[90vh] overflow-y-auto
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {investment ? 'Editar Investimento' : 'Novo Investimento'}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${currentTypeConfig.bgColor}`}>
                    <CurrentTypeIcon size={22} className={currentTypeConfig.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {formName || 'Nome do investimento'}
                    </p>
                    <span className={`text-xs font-medium ${currentTypeConfig.textColor}`}>
                      {currentTypeConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-5 pb-4 space-y-4">
                {/* Type Dropdown */}
                <div ref={typeDropdownRef} className="relative">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Tipo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="
                      w-full flex items-center justify-between gap-2 px-3 py-2.5
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      rounded-xl text-left
                      hover:bg-slate-100 dark:hover:bg-slate-700
                      transition-colors cursor-pointer
                    "
                  >
                    <div className="flex items-center gap-2">
                      <CurrentTypeIcon size={18} className={currentTypeConfig.iconColor} />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {currentTypeConfig.label}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showTypeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="
                          absolute z-10 left-0 right-0 mt-1
                          bg-white dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700
                          rounded-xl shadow-lg py-1
                        "
                      >
                        {(Object.keys(INVESTMENT_TYPE_CONFIG) as InvestmentType[]).map((type) => {
                          const config = INVESTMENT_TYPE_CONFIG[type]
                          const Icon = config.icon
                          const isSelected = formType === type
                          
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormType(type)
                                setShowTypeDropdown(false)
                              }}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 text-left
                                transition-colors
                                ${isSelected
                                  ? 'bg-slate-100 dark:bg-slate-700'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                }
                              `}
                            >
                              <Icon size={18} className={config.iconColor} />
                              <span className="text-sm text-slate-900 dark:text-slate-100">
                                {config.label}
                              </span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setFormName(e.target.value)
                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                      }
                    }}
                    placeholder="Ex: Tesouro Selic 2029"
                    className={`
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border ${formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100 text-sm
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    `}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Valor
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                      R$
                    </span>
                    <input
                      type="text"
                      value={formAmount}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value)
                        setFormAmount(formatted)
                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' })
                      }}
                      placeholder="0,00"
                      className={`
                        w-full pl-9 pr-3 py-2.5 rounded-xl
                        bg-slate-50 dark:bg-slate-800
                        border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                        text-slate-900 dark:text-slate-100 text-sm tabular-nums
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                        transition-colors
                      `}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.amount}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value)
                      if (formErrors.date) setFormErrors({ ...formErrors, date: '' })
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

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Notas <span className="text-slate-400">(opcional)</span>
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setFormNotes(e.target.value)
                      }
                    }}
                    placeholder="Observações sobre este investimento..."
                    rows={2}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors resize-none
                    "
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{formNotes.length}/200</p>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="mx-5 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 p-5 pt-0">
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
                  {loading ? 'Salvando...' : investment ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
