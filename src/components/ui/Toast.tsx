import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { Toast as ToastType } from '../../store/toastStore'
import { useToastStore } from '../../store/toastStore'

interface ToastProps {
  toast: ToastType
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast)
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        flex items-center gap-3 p-4 rounded-xl border shadow-sm
        ${config.bgColor} ${config.borderColor}
        min-w-[300px] max-w-[500px]
      `}
    >
      <Icon size={20} className={`flex-shrink-0 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className={`
          flex-shrink-0 p-1 rounded-md
          hover:bg-slate-900/10 dark:hover:bg-white/10
          transition-colors cursor-pointer
          ${config.iconColor}
        `}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}
