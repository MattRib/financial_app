import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, FileText, DollarSign } from 'lucide-react'
import type { Debt, CreateDebtDto, UpdateDebtDto, DebtStatus } from '../../types'

interface DebtModalProps {
  isOpen: boolean
  debt: Debt | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateDebtDto | UpdateDebtDto) => Promise<void>
}

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

// Status options for editing
const STATUS_OPTIONS: { id: DebtStatus; label: string; colorClass: string }[] = [
  { id: 'pending', label: 'Pendente', colorClass: 'text-amber-600 dark:text-amber-400' },
  { id: 'paid', label: 'Paga', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'overdue', label: 'Vencida', colorClass: 'text-red-600 dark:text-red-400' },
]

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  debt,
  loading = false,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [formName, setFormName] = useState<string>('')
  const [formAmount, setFormAmount] = useState<string>('')
  const [formDueDate, setFormDueDate] = useState<string>('')
  const [formCreditor, setFormCreditor] = useState<string>('')
  const [formNotes, setFormNotes] = useState<string>('')
  const [formAmountPaid, setFormAmountPaid] = useState<string>('')
  const [formStatus, setFormStatus] = useState<DebtStatus>('pending')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track previous isOpen to detect when modal opens
  const prevIsOpenRef = useRef(isOpen)
  const isEditing = !!debt

  // Reset or populate form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        if (debt) {
          setFormName(debt.name)
          setFormAmount(formatCurrency(debt.amount))
          setFormDueDate(debt.due_date)
          setFormCreditor(debt.creditor || '')
          setFormNotes(debt.notes || '')
          setFormAmountPaid(formatCurrency(debt.amount_paid))
          setFormStatus(debt.status)
        } else {
          // Default date to 30 days from now for new debts
          const defaultDate = new Date()
          defaultDate.setDate(defaultDate.getDate() + 30)
          
          setFormName('')
          setFormAmount('')
          setFormDueDate(defaultDate.toISOString().split('T')[0])
          setFormCreditor('')
          setFormNotes('')
          setFormAmountPaid('')
          setFormStatus('pending')
        }
        setFormErrors({})
        setSubmitError(null)
      }, 0)
    }
  }, [isOpen, debt])

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
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, errorKey: string) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')

    if (numericValue) {
      const numberValue = Number(numericValue) / 100
      const formatted = formatCurrency(numberValue)
      setter(formatted)
    } else {
      setter('')
    }

    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formName.trim()) {
      errors.name = 'Nome é obrigatório'
    }

    const amountValue = parseCurrency(formAmount)
    if (!formAmount || amountValue <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }

    if (!formDueDate) {
      errors.dueDate = 'Data de vencimento é obrigatória'
    }

    // Validate amount_paid doesn't exceed amount
    if (isEditing) {
      const paidValue = parseCurrency(formAmountPaid)
      if (paidValue > amountValue) {
        errors.amountPaid = 'Valor pago não pode exceder o valor total'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const data: CreateDebtDto | UpdateDebtDto = {
        name: formName.trim(),
        amount: parseCurrency(formAmount),
        due_date: formDueDate,
        creditor: formCreditor.trim() || undefined,
        notes: formNotes.trim() || undefined,
      }

      // Include additional fields for editing
      if (isEditing) {
        (data as UpdateDebtDto).amount_paid = parseCurrency(formAmountPaid)
        ;(data as UpdateDebtDto).status = formStatus
      }

      await onSubmit(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar dívida')
    } finally {
      setIsSubmitting(false)
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
              w-full max-w-md max-h-[90vh] overflow-y-auto
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {isEditing ? 'Editar Dívida' : 'Nova Dívida'}
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
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <FileText size={14} />
                    Nome da dívida *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cartão de crédito, Empréstimo..."
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    className={`
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border ${formErrors.name ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                    `}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <DollarSign size={14} />
                    Valor total *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={formAmount}
                    onChange={(e) => handleAmountChange(e, setFormAmount, 'amount')}
                    className={`
                      w-full px-4 py-3 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border-2 ${formErrors.amount ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100 text-2xl font-bold
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                      placeholder:text-slate-300 dark:placeholder:text-slate-600
                    `}
                  />
                  {formErrors.amount && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.amount}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <Calendar size={14} />
                    Data de vencimento *
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => {
                      setFormDueDate(e.target.value)
                      if (formErrors.dueDate) setFormErrors((prev) => ({ ...prev, dueDate: '' }))
                    }}
                    className={`
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border ${formErrors.dueDate ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors cursor-pointer
                    `}
                  />
                  {formErrors.dueDate && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.dueDate}</p>
                  )}
                </div>

                {/* Creditor (optional) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <User size={14} />
                    Credor (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Banco XYZ, João..."
                    value={formCreditor}
                    onChange={(e) => setFormCreditor(e.target.value)}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                    "
                  />
                </div>

                {/* Edit-only fields */}
                {isEditing && (
                  <>
                    {/* Amount Paid */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <DollarSign size={14} />
                        Valor pago
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        value={formAmountPaid}
                        onChange={(e) => handleAmountChange(e, setFormAmountPaid, 'amountPaid')}
                        className={`
                          w-full px-3 py-2.5 rounded-xl
                          bg-slate-50 dark:bg-slate-800
                          border ${formErrors.amountPaid ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}
                          text-slate-900 dark:text-slate-100 text-sm
                          focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                          transition-colors
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                        `}
                      />
                      {formErrors.amountPaid && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.amountPaid}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                        Status
                      </label>
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <motion.button
                            key={option.id}
                            type="button"
                            onClick={() => setFormStatus(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                              border-2 cursor-pointer
                              ${formStatus === option.id
                                ? `border-slate-900 dark:border-slate-100 ${option.colorClass} bg-slate-100 dark:bg-slate-800`
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                              }
                            `}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Notes (optional) */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                    Observações (opcional)
                  </label>
                  <textarea
                    placeholder="Adicione notas sobre esta dívida..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={3}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors resize-none
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                    "
                  />
                </div>

                {/* Submit Error */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    border border-slate-200 dark:border-slate-700
                    text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    text-sm font-medium transition-colors cursor-pointer
                  "
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  disabled={loading || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    bg-slate-900 dark:bg-slate-100
                    text-white dark:text-slate-900
                    hover:bg-slate-800 dark:hover:bg-slate-200
                    text-sm font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer
                  "
                >
                  {loading || isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Dívida'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
