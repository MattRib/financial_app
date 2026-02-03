import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export interface DeleteInstallmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mode: 'single' | 'future' | 'all') => void | Promise<void>
  transactionDescription?: string
  installmentNumber?: number
  totalInstallments?: number
  isInstallment: boolean
}

export function DeleteInstallmentModal({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
  installmentNumber,
  totalInstallments,
  isInstallment,
}: DeleteInstallmentModalProps) {
  if (!isOpen) return null

  const handleConfirm = (mode: 'single' | 'future' | 'all') => {
    onConfirm(mode)
    onClose()
  }

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="
                relative w-full max-w-md
                bg-white dark:bg-slate-800
                rounded-2xl shadow-2xl
                border border-slate-200 dark:border-slate-700
              "
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Excluir Transação
                    </h3>
                    {transactionDescription && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {transactionDescription}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="
                    flex-shrink-0 p-1 rounded-lg
                    hover:bg-slate-100 dark:hover:bg-slate-700
                    transition-colors
                  "
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {isInstallment ? (
                  // Installment Options
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      Esta é a parcela {installmentNumber} de {totalInstallments}. Escolha como deseja
                      excluir:
                    </p>

                    {/* Option 1: Single */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleConfirm('single')}
                      className="
                        w-full p-4 rounded-xl text-left
                        bg-slate-50 dark:bg-slate-750
                        border-2 border-slate-200 dark:border-slate-700
                        hover:border-blue-500 dark:hover:border-blue-400
                        hover:bg-blue-50 dark:hover:bg-blue-900/10
                        transition-all duration-200
                        group
                      "
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                        Apenas esta parcela
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Exclui somente a parcela {installmentNumber}, mantendo as demais
                      </div>
                    </motion.button>

                    {/* Option 2: Future */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleConfirm('future')}
                      className="
                        w-full p-4 rounded-xl text-left
                        bg-slate-50 dark:bg-slate-750
                        border-2 border-slate-200 dark:border-slate-700
                        hover:border-amber-500 dark:hover:border-amber-400
                        hover:bg-amber-50 dark:hover:bg-amber-900/10
                        transition-all duration-200
                        group
                      "
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                        Esta e as próximas parcelas
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Exclui da parcela {installmentNumber} até a {totalInstallments} (
                        {(totalInstallments || 0) - (installmentNumber || 0) + 1} parcelas)
                      </div>
                    </motion.button>

                    {/* Option 3: All */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleConfirm('all')}
                      className="
                        w-full p-4 rounded-xl text-left
                        bg-slate-50 dark:bg-slate-750
                        border-2 border-slate-200 dark:border-slate-700
                        hover:border-red-500 dark:hover:border-red-400
                        hover:bg-red-50 dark:hover:bg-red-900/10
                        transition-all duration-200
                        group
                      "
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                        Todas as {totalInstallments} parcelas
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Exclui todo o parcelamento permanentemente
                      </div>
                    </motion.button>
                  </div>
                ) : (
                  // Simple Transaction
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                      Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="
                          flex-1 px-4 py-2.5 rounded-lg
                          bg-slate-100 dark:bg-slate-700
                          text-slate-700 dark:text-slate-300
                          font-medium
                          hover:bg-slate-200 dark:hover:bg-slate-600
                          transition-colors
                        "
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleConfirm('single')}
                        className="
                          flex-1 px-4 py-2.5 rounded-lg
                          bg-red-600 hover:bg-red-700
                          text-white font-medium
                          transition-colors
                        "
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
