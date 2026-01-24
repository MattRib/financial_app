import React from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import type { Category } from '../../types'
import { CATEGORY_TYPE_CONFIG } from '../../constants/categories'

interface CategoryCardProps {
  category: Category
  index?: number
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  index = 0,
  onEdit,
  onDelete,
}) => {
  const typeConfig = CATEGORY_TYPE_CONFIG[category.type]
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-6
        transition-colors duration-200
      "
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${category.color}20`,
          }}
        >
          <span style={{ color: category.color }}>{category.icon || '📁'}</span>
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
          {category.name}
        </h3>

        {/* Type Badge */}
        <span
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
            ${typeConfig.bgColor} ${typeConfig.textColor}
          `}
        >
          <TypeIcon size={14} />
          {typeConfig.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 w-full justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(category)}
            className="
              p-2 rounded-lg
              text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors duration-200
            "
            title="Editar categoria"
          >
            <Edit2 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(category.id)}
            className="
              p-2 rounded-lg
              text-slate-500 dark:text-slate-400
              hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors duration-200
            "
            title="Excluir categoria"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton for loading state
export const CategoryCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-xl p-6
    "
  >
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Icon skeleton */}
      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      {/* Name skeleton */}
      <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      {/* Badge skeleton */}
      <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
      {/* Actions skeleton */}
      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 w-full justify-center">
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
    </div>
  </motion.div>
)
