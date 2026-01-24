import React from 'react'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
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
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = React.useState(false)
  const typeConfig = CATEGORY_TYPE_CONFIG[category.type]
  const TypeIcon = typeConfig.icon

  return (
    <div
      className="
        flex items-center gap-4 p-4
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-2xl
        hover:border-slate-300 dark:hover:border-slate-700
        transition-colors duration-150
      "
    >
      {/* Left: Icon with color accent */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{
          backgroundColor: `${category.color}15`,
        }}
      >
        <span style={{ color: category.color }}>{category.icon || '📁'}</span>
      </div>

      {/* Center: Name + Type */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {category.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <TypeIcon size={12} className={typeConfig.iconColor} />
          <span className={`text-xs font-medium ${typeConfig.textColor}`}>
            {typeConfig.label}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          onBlur={() => setTimeout(() => setShowActions(false), 150)}
          className="
            p-2 rounded-lg
            text-slate-400 dark:text-slate-500
            hover:text-slate-600 dark:hover:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors cursor-pointer
          "
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Dropdown Menu */}
        {showActions && (
          <div
            className="
              absolute right-0 top-full mt-1 z-10
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              rounded-xl shadow-lg
              py-1 min-w-[140px]
              animate-in fade-in zoom-in-95 duration-150
            "
          >
            <button
              onClick={() => {
                setShowActions(false)
                onEdit(category)
              }}
              className="
                w-full flex items-center gap-2.5 px-3 py-2
                text-sm text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                transition-colors cursor-pointer
              "
            >
              <Edit2 size={15} />
              Editar
            </button>
            <button
              onClick={() => {
                setShowActions(false)
                onDelete(category.id)
              }}
              className="
                w-full flex items-center gap-2.5 px-3 py-2
                text-sm text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors cursor-pointer
              "
            >
              <Trash2 size={15} />
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton for loading state
export const CategoryCardSkeleton: React.FC<{ index?: number }> = () => (
  <div
    className="
      flex items-center gap-4 p-4
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-2xl
    "
  >
    {/* Icon skeleton */}
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
    {/* Content skeleton */}
    <div className="flex-1 space-y-2">
      <div className="w-28 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
    </div>
    {/* Action skeleton */}
    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
  </div>
)
