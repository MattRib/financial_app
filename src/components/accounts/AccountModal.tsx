import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AccountTypeLabels, AccountTypeIcons } from '../../types'
import type { Account, CreateAccountDto, UpdateAccountDto, AccountType } from '../../types'

const ACCOUNT_TYPES: AccountType[] = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
  'other',
]

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#64748b', // slate
]

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>
  account?: Account | null
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  account,
}) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [creditLimit, setCreditLimit] = useState('')
  const [closingDay, setClosingDay] = useState(10)
  const [dueDay, setDueDay] = useState(15)
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState('🏦')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEditing = !!account

  // Reset form when modal opens/closes or account changes
  useEffect(() => {
    if (isOpen && account) {
      setName(account.name)
      setType(account.type)
      setCreditLimit(String(account.credit_limit ?? ''))
      setClosingDay(account.closing_day || 10)
      setDueDay(account.due_day || 15)
      setColor(account.color)
      setIcon(account.icon)
      setIsActive(account.is_active)
      setNotes(account.notes || '')
    } else if (isOpen) {
      setName('')
      setType('checking')
      setCreditLimit('')
      setClosingDay(10)
      setDueDay(15)
      setColor(COLORS[0])
      setIcon('🏦')
      setIsActive(true)
      setNotes('')
    }
  }, [isOpen, account])

  // Update icon when type changes
  useEffect(() => {
    if (!isEditing) {
      setIcon(AccountTypeIcons[type])
    }
  }, [type, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const data: CreateAccountDto | UpdateAccountDto = {
        name: name.trim(),
        type,
        credit_limit:
          type === 'credit_card' && creditLimit
            ? parseFloat(creditLimit)
            : undefined,
        closing_day: type === 'credit_card' ? closingDay : undefined,
        due_day: type === 'credit_card' ? dueDay : undefined,
        color,
        icon,
        notes: notes.trim() || undefined,
      }

      if (isEditing) {
        ;(data as UpdateAccountDto).is_active = isActive
      }

      await onSubmit(data)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isEditing ? 'Editar Conta' : 'Nova Conta'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nome da conta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Itaú, Carteira..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`
                      px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer
                      flex items-center justify-center gap-1.5
                      ${
                        type === t
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{AccountTypeIcons[t]}</span>
                    <span className="truncate text-xs">{AccountTypeLabels[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credit Card Settings */}
            {type === 'credit_card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Limite do cartão
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      R$
                    </span>
                    <input
                      type="text"
                      value={creditLimit}
                      onChange={(e) =>
                        setCreditLimit(e.target.value.replace(/[^\d.-]/g, ''))
                      }
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Dia de fechamento
                    </label>
                    <select
                      value={closingDay}
                      onChange={(e) => setClosingDay(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Dia de vencimento
                    </label>
                    <select
                      value={dueDay}
                      onChange={(e) => setDueDay(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Compras entram na fatura conforme o dia de fechamento.
                </p>
              </div>
            )}

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`
                      w-8 h-8 rounded-lg transition-all cursor-pointer
                      ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                    `}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Options */}
            {isEditing && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Conta ativa
                  </span>
                </label>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione notas sobre esta conta..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
