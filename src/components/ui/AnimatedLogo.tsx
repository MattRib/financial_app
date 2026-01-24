import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'

export const AnimatedLogo = () => {
  return (
    <motion.div
      className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-700 mb-4"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <DollarSign className="w-6 h-6 text-white" />
    </motion.div>
  )
}
