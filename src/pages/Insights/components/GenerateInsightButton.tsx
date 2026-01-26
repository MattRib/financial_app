import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

interface GenerateInsightButtonProps {
  loading: boolean
  onClick: () => void
  disabled?: boolean
}

export const GenerateInsightButton: React.FC<GenerateInsightButtonProps> = ({
  loading,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-xl
        font-medium text-white transition-all
        ${
          disabled || loading
            ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
            : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer'
        }
      `}
    >
      {loading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Gerando insights...
        </>
      ) : (
        <>
          <Sparkles size={20} />
          Gerar Insights
        </>
      )}
    </motion.button>
  )
}
