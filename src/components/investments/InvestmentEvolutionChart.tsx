import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../hooks/useTransaction'

interface MonthlyEvolution {
  month: number
  year: number
  total: number
}

interface InvestmentEvolutionChartProps {
  data: MonthlyEvolution[]
  height?: number
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const InvestmentEvolutionChart: React.FC<InvestmentEvolutionChartProps> = ({
  data,
  height = 200,
}) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.total), 1)
  
  // Calculate total for the year
  const yearTotal = data.reduce((acc, d) => acc + d.total, 0)

  // Get bar height percentage
  const getBarHeight = (value: number) => (value / maxValue) * 100

  return (
    <div className="space-y-4">
      {/* Year total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Total no ano
        </span>
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(yearTotal)}
        </span>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end gap-1 sm:gap-2">
          {data.map((item, index) => {
            const barHeight = getBarHeight(item.total)
            const hasValue = item.total > 0

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {/* Bar container */}
                <div
                  className="w-full relative flex items-end justify-center"
                  style={{ height: height - 24 }}
                >
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className={`
                      w-full max-w-[40px] rounded-t-md
                      ${hasValue
                        ? 'bg-emerald-500 dark:bg-emerald-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                      }
                      group relative cursor-pointer
                      hover:opacity-80 transition-opacity
                    `}
                    style={{ minHeight: hasValue ? 4 : 2 }}
                  >
                    {/* Tooltip */}
                    {hasValue && (
                      <div
                        className="
                          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                          bg-slate-900 dark:bg-slate-700
                          text-white text-xs font-medium
                          px-2 py-1 rounded
                          opacity-0 group-hover:opacity-100
                          transition-opacity pointer-events-none
                          whitespace-nowrap z-10
                        "
                      >
                        {formatCurrency(item.total)}
                        <div
                          className="
                            absolute top-full left-1/2 -translate-x-1/2
                            border-4 border-transparent
                            border-t-slate-900 dark:border-t-slate-700
                          "
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Month label */}
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {MONTH_LABELS[item.month - 1]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
          <span>Investido</span>
        </div>
      </div>
    </div>
  )
}

// Skeleton for loading state
export const InvestmentEvolutionChartSkeleton: React.FC<{ height?: number }> = ({
  height = 200,
}) => {
  // Pre-computed heights for skeleton bars (deterministic)
  const skeletonHeights = [45, 62, 38, 71, 55, 48, 67, 42, 58, 73, 51, 64]

  return (
    <div className="space-y-4 animate-pulse">
      {/* Year total skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="w-28 h-6 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Chart skeleton */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end gap-1 sm:gap-2">
          {skeletonHeights.map((barHeight, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full flex items-end justify-center"
                style={{ height: height - 24 }}
              >
                <div
                  className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-md"
                  style={{ height: `${barHeight}%` }}
                />
              </div>
              <div className="w-6 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex items-center justify-center gap-4">
        <div className="w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  )
}
