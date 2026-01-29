import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { OfxDropzone } from './OfxDropzone'
import { OfxPreviewTable } from './OfxPreviewTable'
import { transactionsService } from '../../services/transactions'
import { useToast } from '../../store/toastStore'
import type { Account, Category, ParsedOfxTransaction, OfxPreview } from '../../types'

interface OfxImportModalProps {
  isOpen: boolean
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onComplete: () => void
}

const ImportStep = {
  UPLOAD: 'upload',
  PREVIEW: 'preview',
  PROCESSING: 'processing',
} as const

type ImportStep = typeof ImportStep[keyof typeof ImportStep]

export const OfxImportModal: React.FC<OfxImportModalProps> = ({
  isOpen,
  accounts,
  categories,
  onClose,
  onComplete,
}) => {
  const toast = useToast()

  // State
  const [step, setStep] = useState<ImportStep>(ImportStep.UPLOAD)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<OfxPreview | null>(null)
  const [editedTransactions, setEditedTransactions] = useState<ParsedOfxTransaction[]>([])
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(ImportStep.UPLOAD)
      setSelectedAccount('')
      setUploadedFile(null)
      setPreview(null)
      setEditedTransactions([])
      setSelectedIndices(new Set())
      setLoading(false)
      setError(null)
    }
  }, [isOpen])

  // Auto-select all transactions when preview loads
  useEffect(() => {
    if (preview) {
      setSelectedIndices(new Set(Array.from({ length: preview.transactions.length }, (_, i) => i)))
    }
  }, [preview])

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setError(null)
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setError(null)
  }

  const handleProcessFile = async () => {
    if (!uploadedFile || !selectedAccount) {
      setError('Por favor, selecione um arquivo e uma conta')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const previewData = await transactionsService.previewOfxImport(uploadedFile, selectedAccount)
      setPreview(previewData)
      setEditedTransactions([...previewData.transactions])
      setStep(ImportStep.PREVIEW)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo OFX'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedIndices(newSelected)
  }

  const handleToggleAll = () => {
    if (selectedIndices.size === editedTransactions.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(Array.from({ length: editedTransactions.length }, (_, i) => i)))
    }
  }

  const handleCategoryChange = (index: number, categoryId: string) => {
    const updated = [...editedTransactions]
    updated[index] = {
      ...updated[index],
      suggested_category_id: categoryId || undefined,
    }
    setEditedTransactions(updated)
  }

  const handleRemove = (index: number) => {
    const updated = editedTransactions.filter((_, i) => i !== index)
    setEditedTransactions(updated)

    // Update selected indices
    const newSelected = new Set<number>()
    selectedIndices.forEach((idx) => {
      if (idx < index) {
        newSelected.add(idx)
      } else if (idx > index) {
        newSelected.add(idx - 1)
      }
    })
    setSelectedIndices(newSelected)

    // Update preview duplicates
    if (preview) {
      const newDuplicates = preview.duplicates
        .filter((idx) => idx !== index)
        .map((idx) => (idx > index ? idx - 1 : idx))
      setPreview({
        ...preview,
        transactions: updated,
        total_transactions: updated.length,
        duplicates: newDuplicates,
      })
    }
  }

  const handleConfirmImport = async () => {
    if (selectedIndices.size === 0) {
      toast.error('Selecione ao menos uma transação para importar')
      return
    }

    setLoading(true)
    setStep(ImportStep.PROCESSING)

    try {
      const transactionsToImport = Array.from(selectedIndices)
        .map((index) => {
          const tx = editedTransactions[index]
          return {
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            type: tx.type,
            category_id: tx.suggested_category_id,
            account_id: selectedAccount,
          }
        })

      await transactionsService.confirmOfxImport({ transactions: transactionsToImport })

      toast.success(`${transactionsToImport.length} transação(ões) importada(s) com sucesso!`)
      onComplete()
    } catch (err) {
      setStep(ImportStep.PREVIEW)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar transações'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Importar Extrato OFX
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {step === ImportStep.UPLOAD && 'Selecione um arquivo OFX e uma conta'}
                {step === ImportStep.PREVIEW && 'Revise e edite as transações antes de importar'}
                {step === ImportStep.PROCESSING && 'Importando transações...'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === ImportStep.UPLOAD && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Conta <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.type === 'checking' ? 'Conta Corrente' : account.type === 'savings' ? 'Poupança' : 'Investimento'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Arquivo OFX <span className="text-red-600">*</span>
                  </label>
                  <OfxDropzone
                    onFileSelect={handleFileSelect}
                    selectedFile={uploadedFile}
                    onClear={handleClearFile}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === ImportStep.PREVIEW && preview && (
              <OfxPreviewTable
                transactions={editedTransactions}
                categories={categories}
                duplicates={preview.duplicates}
                selectedIndices={selectedIndices}
                onToggleSelection={handleToggleSelection}
                onToggleAll={handleToggleAll}
                onCategoryChange={handleCategoryChange}
                onRemove={handleRemove}
              />
            )}

            {step === ImportStep.PROCESSING && (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full"
                />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-4">
                  Importando transações...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Por favor, aguarde
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== ImportStep.PROCESSING && (
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>

              {step === ImportStep.UPLOAD && (
                <button
                  onClick={handleProcessFile}
                  disabled={loading || !uploadedFile || !selectedAccount}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {loading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  )}
                  {loading ? 'Processando...' : 'Processar Arquivo'}
                </button>
              )}

              {step === ImportStep.PREVIEW && (
                <button
                  onClick={handleConfirmImport}
                  disabled={loading || selectedIndices.size === 0}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Importar {selectedIndices.size} Transação(ões)
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
