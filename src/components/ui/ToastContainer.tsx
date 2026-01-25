import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'
import { Toast } from './Toast'

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-40 flex flex-col gap-2 mb-20 sm:mb-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
