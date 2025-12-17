import React from 'react'
import type { Category } from '../../types'
import { Edit2, Trash2, TrendingUp, TrendingDown, PiggyBank, Plus } from 'lucide-react'

interface CategoriesListProps {
  categories: Category[]
  loading: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onCreateFirst?: () => void
}

// Memoized category card component
const CategoryCard = React.memo<{
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  getTypeIcon: (type: Category['type']) => React.ReactNode
  getTypeLabel: (type: Category['type']) => string
  getTypeBadgeClasses: (type: Category['type']) => string
}>(({ category, onEdit, onDelete, getTypeIcon, getTypeLabel, getTypeBadgeClasses }) => (
  <div
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
        style={{
          backgroundColor: `${category.color}20`,
          color: category.color,
        }}
      >
        {category.icon || '📁'}
      </div>

      {/* Name */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
      </div>

      {/* Type Badge */}
      <div className="flex items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeClasses(
            category.type
          )}`}
        >
          {getTypeIcon(category.type)}
          {getTypeLabel(category.type)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 w-full justify-center">
        <button
          onClick={() => onEdit(category)}
          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors duration-200"
          title="Editar categoria"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors duration-200"
          title="Deletar categoria"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  </div>
))

CategoryCard.displayName = 'CategoryCard'

const CategoriesList = React.memo<CategoriesListProps>(({
  categories,
  loading,
  onEdit,
  onDelete,
  onCreateFirst,
}) => {
  // Get icon component based on category type
  const getTypeIcon = (type: Category['type']) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} />
      case 'expense':
        return <TrendingDown size={16} />
      case 'investment':
        return <PiggyBank size={16} />
      default:
        return null
    }
  }

  // Get type label in Portuguese
  const getTypeLabel = (type: Category['type']) => {
    switch (type) {
      case 'income':
        return 'Entrada'
      case 'expense':
        return 'Saída'
      case 'investment':
        return 'Investimento'
      default:
        return type
    }
  }

  // Get type badge color classes
  const getTypeBadgeClasses = (type: Category['type']) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800'
      case 'expense':
        return 'bg-red-100 text-red-800'
      case 'investment':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon skeleton */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f3f4f6' }}
              >
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              {/* Name skeleton */}
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              {/* Badge skeleton */}
              <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
              {/* Buttons skeleton */}
              <div className="flex gap-2 mt-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Comece criando sua primeira categoria para organizar suas transações
          </p>
          {onCreateFirst && (
            <button
              onClick={onCreateFirst}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus size={20} />
              Criar primeira categoria
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          getTypeIcon={getTypeIcon}
          getTypeLabel={getTypeLabel}
          getTypeBadgeClasses={getTypeBadgeClasses}
        />
      ))}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to avoid unnecessary re-renders
  return (
    prevProps.categories === nextProps.categories &&
    prevProps.loading === nextProps.loading &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onCreateFirst === nextProps.onCreateFirst
  )
})

CategoriesList.displayName = 'CategoriesList'

export default CategoriesList

