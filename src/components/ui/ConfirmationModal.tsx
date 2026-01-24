import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'info'
  icon?: LucideIcon
  children?: React.ReactNode
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

const variantConfig = {
  danger: {
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700',
  },
  info: {
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    confirmBg: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600',
  },
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  variant = 'danger',
  icon: Icon = AlertTriangle,
  children,
  onConfirm,
  onCancel,
}) => {
  const config = variantConfig[variant]

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleConfirm = async () => {
    await onConfirm()
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
            onClick={onCancel}
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
              overflow-hidden
            "
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onCancel}
              className="
                absolute top-4 right-4 p-1.5 rounded-lg
                text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-colors z-10 cursor-pointer
              "
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                <Icon size={24} className={config.iconColor} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {description}
              </p>

              {/* Optional content (e.g., transaction preview) */}
              {children && (
                <div className="mb-4">
                  {children}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="
                  flex-1 px-4 py-2.5 rounded-xl
                  border border-slate-200 dark:border-slate-700
                  text-slate-600 dark:text-slate-400
                  hover:bg-slate-50 dark:hover:bg-slate-800
                  text-sm font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  flex-1 px-4 py-2.5 rounded-xl
                  ${config.confirmBg}
                  text-white text-sm font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                `}
              >
                {loading ? 'Aguarde...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
