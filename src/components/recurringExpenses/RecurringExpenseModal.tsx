import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, DollarSign, Tag, Building2, Hash } from 'lucide-react'
import type {
  Category,
  Account,
  CreateRecurringExpenseDto,
} from '../../types'

interface RecurringExpenseModalProps {
  isOpen: boolean
  categories: Category[]
  accounts: Account[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: CreateRecurringExpenseDto) => Promise<void>
  formatCurrency: (value: number) => string
}

export const RecurringExpenseModal: React.FC<RecurringExpenseModalProps> = ({
  isOpen,
  categories,
  accounts,
  loading,
  onClose,
  onSubmit,
  formatCurrency,
}) => {
  const [formData, setFormData] = useState<CreateRecurringExpenseDto>({
    amount: 0,
    type: 'expense',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    account_id: '',
    total_recurrences: 12, // Default 12 months
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens (deferred to avoid synchronous setState in effect)
      const id = window.setTimeout(() => {
        setFormData({
          amount: 0,
          type: 'expense',
          description: '',
          start_date: new Date().toISOString().split('T')[0],
          account_id: accounts[0]?.id || '',
          total_recurrences: 12,
        })
      }, 0)
      return () => clearTimeout(id)
    }
  }, [isOpen, accounts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-2xl shadow-2xl
                w-full max-w-lg max-h-[90vh]
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Nova Despesa Fixa Recorrente
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    p-2 rounded-lg
                    text-slate-400 hover:text-slate-600
                    dark:text-slate-500 dark:hover:text-slate-300
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    transition-colors
                  "
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
              >
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Ex: Aluguel, Faculdade, Internet..."
                    required
                    className="
                      w-full px-3 py-2.5 rounded-lg
                      bg-white dark:bg-slate-800
                      border border-slate-300 dark:border-slate-700
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                      focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                      focus:border-transparent
                      transition-all
                    "
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor Mensal *
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      required
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                        focus:border-transparent
                        transition-all
                      "
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Este valor será cobrado todos os meses
                  </p>
                </div>

                {/* Recurrences */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Quantidade de Meses *
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={formData.total_recurrences}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_recurrences: parseInt(e.target.value) || 2,
                        })
                      }
                      required
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                        focus:border-transparent
                        transition-all
                      "
                    />
                  </div>
                  {formData.amount > 0 && formData.total_recurrences > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Total:{' '}
                      {formatCurrency(
                        formData.amount * formData.total_recurrences,
                      )}
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Data de Início *
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                        focus:border-transparent
                        transition-all
                      "
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoria
                  </label>
                  <div className="relative">
                    <Tag
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value || undefined,
                        })
                      }
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                        focus:border-transparent
                        transition-all
                      "
                    >
                      <option value="">Sem categoria</option>
                      {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Conta *
                  </label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <select
                      value={formData.account_id}
                      onChange={(e) =>
                        setFormData({ ...formData, account_id: e.target.value })
                      }
                      required
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400
                        focus:border-transparent
                        transition-all
                      "
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.icon} {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  type="button"
                  disabled={loading}
                  className="
                    px-4 py-2.5 rounded-xl
                    border border-slate-300 dark:border-slate-700
                    text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    transition-colors font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  type="submit"
                  disabled={loading}
                  className="
                    px-4 py-2.5 rounded-xl
                    bg-slate-900 dark:bg-slate-100
                    text-white dark:text-slate-900
                    hover:bg-slate-800 dark:hover:bg-slate-200
                    transition-colors font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  {loading ? 'Criando...' : 'Criar Despesa Recorrente'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
