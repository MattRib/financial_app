import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Loader2, Receipt, X } from 'lucide-react'
import { accountsService } from '../../services/accounts'
import { useToast } from '../../store/toastStore'
import type { Account, CreditCardInvoice } from '../../types'

interface CreditCardInvoiceModalProps {
  isOpen: boolean
  account: Account | null
  onClose: () => void
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (value: string) =>
  new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

export const CreditCardInvoiceModal: React.FC<CreditCardInvoiceModalProps> = ({
  isOpen,
  account,
  onClose,
}) => {
  const toast = useToast()
  const [invoice, setInvoice] = useState<CreditCardInvoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const periodLabel = useMemo(() => {
    if (!invoice) return ''
    return `${formatDate(invoice.period_start)} • ${formatDate(invoice.period_end)}`
  }, [invoice])

  const fetchInvoice = useCallback(async () => {
    if (!account) return
    setLoading(true)
    setError(null)
    try {
      const current = await accountsService.getCurrentInvoice(account.id)
      setInvoice(current)
    } catch {
      setError('Não foi possível carregar a fatura')
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    if (isOpen && account) {
      fetchInvoice()
    }
  }, [isOpen, account, fetchInvoice])

  const handleMarkPaid = async () => {
    if (!account || !invoice) return
    setMarking(true)
    try {
      await accountsService.markInvoicePaid(
        account.id,
        invoice.period_start,
        invoice.period_end
      )
      await fetchInvoice()
      toast.success('Fatura marcada como paga')
    } catch {
      toast.error('Erro ao marcar fatura como paga')
    } finally {
      setMarking(false)
    }
  }

  if (!isOpen || !account) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${account.color}20` }}
              >
                {account.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Fatura atual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {account.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={22} />
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {!loading && invoice && (
              <>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Período
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {periodLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Receipt size={14} />
                    Fecha dia {invoice.closing_day} • Vence dia {invoice.due_day || '-'}
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {invoice.transactions?.length ? (
                    invoice.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                            style={{
                              backgroundColor: tx.category?.color
                                ? `${tx.category.color}20`
                                : 'rgb(241 245 249)',
                              color: tx.category?.color || 'rgb(148 163 184)',
                            }}
                          >
                            {tx.category?.icon || '🧾'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {tx.description || tx.category?.name || 'Compra'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(tx.date)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          -{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                      Nenhuma compra nesta fatura
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {invoice.is_paid ? (
                      <>
                        <CheckCircle size={14} className="text-emerald-500" />
                        Fatura paga
                      </>
                    ) : (
                      <>Fatura em aberto</>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkPaid}
                    disabled={invoice.is_paid || marking}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {marking && <Loader2 className="animate-spin" size={14} />}
                    {invoice.is_paid ? 'Pago' : 'Marcar como paga'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
