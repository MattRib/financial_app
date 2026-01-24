import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  loading?: boolean
  index?: number
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  loading,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-5
        transition-colors duration-200
      "
    >
      <div className="flex items-center justify-between gap-4">
        {/* Icon - subtle, left side */}
        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse ml-auto" />
          ) : (
            <motion.p
              className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              {value}
            </motion.p>
          )}
          {trend && !loading && (
            <div
              className={`
              text-xs mt-1 flex items-center justify-end gap-1
              ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}
            `}
            >
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
