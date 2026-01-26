import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRightLeft } from 'lucide-react'
import type { Account, CreateTransferDto } from '../../types'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTransferDto) => Promise<void>
  accounts: Account[]
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
}) => {
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)

  const activeAccounts = accounts.filter((a) => a.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromAccountId || !toAccountId || !amount || !date) return
    if (fromAccountId === toAccountId) return

    setSubmitting(true)
    try {
      await onSubmit({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        date,
      })
      // Reset form
      setFromAccountId('')
      setToAccountId('')
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const fromAccount = accounts.find((a) => a.id === fromAccountId)

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
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ArrowRightLeft
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Transferência entre Contas
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
            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                De (origem)
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                required
              >
                <option value="">Selecione a conta de origem</option>
                {activeAccounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                    disabled={account.id === toAccountId}
                  >
                    {account.icon} {account.name} ({formatCurrency(account.current_balance)})
                  </option>
                ))}
              </select>
              {fromAccount && (
                <p className="text-xs text-slate-500 mt-1">
                  Saldo disponível: {formatCurrency(fromAccount.current_balance)}
                </p>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ArrowRightLeft
                  size={18}
                  className="text-slate-500 rotate-90"
                />
              </div>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Para (destino)
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                required
              >
                <option value="">Selecione a conta de destino</option>
                {activeAccounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                    disabled={account.id === fromAccountId}
                  >
                    {account.icon} {account.name} ({formatCurrency(account.current_balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Transferência para poupança"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={
                  submitting ||
                  !fromAccountId ||
                  !toAccountId ||
                  !amount ||
                  fromAccountId === toAccountId
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Transferindo...' : 'Transferir'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
