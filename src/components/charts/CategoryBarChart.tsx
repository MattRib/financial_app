import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/formatters'

interface CategoryData {
  name: string
  value: number
  color: string
}

interface CategoryBarChartProps {
  data: CategoryData[]
  height?: number
}


export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data,
  height = 280,
}) => {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg"
        style={{ height }}
      >
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          Nenhum dado disponivel
        </p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 6)

  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      {sortedData.map((item, index) => {
        const percentage = (item.value / maxValue) * 100

        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="group"
          >
            {/* Label row */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[60%]">
                {item.name}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(item.value)}
              </span>
            </div>

            {/* Bar container */}
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default CategoryBarChart
