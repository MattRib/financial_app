import React, { useState } from 'react'
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '../../types'

interface CategoryFormProps {
  initialData?: Category
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

// Predefined colors (12 colors)
const PREDEFINED_COLORS = [
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#64748b' },
]

// Predefined icons (20 common icons as emojis)
const PREDEFINED_ICONS = [
  { name: 'Carteira', value: '💼' },
  { name: 'Carrinho', value: '🛒' },
  { name: 'Casa', value: '🏠' },
  { name: 'Carro', value: '🚗' },
  { name: 'Comida', value: '🍔' },
  { name: 'Saúde', value: '🏥' },
  { name: 'Educação', value: '📚' },
  { name: 'Lazer', value: '🎮' },
  { name: 'Viagem', value: '✈️' },
  { name: 'Roupas', value: '👕' },
  { name: 'Salário', value: '💰' },
  { name: 'Investimento', value: '📈' },
  { name: 'Presente', value: '🎁' },
  { name: 'Restaurante', value: '🍽️' },
  { name: 'Transporte', value: '🚌' },
  { name: 'Supermercado', value: '🛍️' },
  { name: 'Contas', value: '💳' },
  { name: 'Família', value: '👨‍👩‍👧‍👦' },
  { name: 'Esporte', value: '⚽' },
  { name: 'Tecnologia', value: '💻' },
]

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditMode = !!initialData

  // Form state
  const [name, setName] = useState<string>(initialData?.name || '')
  const [type, setType] = useState<CategoryType>(initialData?.type || 'expense')
  const [color, setColor] = useState<string>(initialData?.color || PREDEFINED_COLORS[0].value)
  const [icon, setIcon] = useState<string>(initialData?.icon || PREDEFINED_ICONS[0].value)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Handle name change with character limit
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 50) {
      setName(value)
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: '' }))
      }
    }
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    } else if (name.length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres'
    }

    // Validate type
    if (!type) {
      newErrors.type = 'Tipo é obrigatório'
    }

    // Validate color
    if (!color) {
      newErrors.color = 'Cor é obrigatória'
    }

    // Validate icon
    if (!icon) {
      newErrors.icon = 'Ícone é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    try {
      const formData: CreateCategoryDto | UpdateCategoryDto = {
        name: name.trim(),
        type,
        color,
        icon,
      }

      await onSubmit(formData)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar categoria')
    }
  }

  // Get type label in Portuguese
  const getTypeLabel = (typeValue: CategoryType) => {
    switch (typeValue) {
      case 'income':
        return 'Entrada'
      case 'expense':
        return 'Saída'
      case 'investment':
        return 'Investimento'
      default:
        return typeValue
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {icon || '📁'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {name || 'Nome da categoria'}
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              {getTypeLabel(type)}
            </span>
          </div>
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          placeholder="Ex: Alimentação"
          maxLength={50}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {name.length}/50 caracteres
          </p>
        </div>
      </div>

      {/* Type Field */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          required
          value={type}
          onChange={(e) => {
            setType(e.target.value as CategoryType)
            if (errors.type) {
              setErrors((prev) => ({ ...prev, type: '' }))
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="expense">Saída</option>
          <option value="income">Entrada</option>
          <option value="investment">Investimento</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* Color Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {PREDEFINED_COLORS.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => {
                setColor(colorOption.value)
                if (errors.color) {
                  setErrors((prev) => ({ ...prev, color: '' }))
                }
              }}
              className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                color === colorOption.value
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.name}
            >
              {color === colorOption.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
        <p className="mt-2 text-xs text-gray-500">
          Cor selecionada: <span style={{ color: color }}>{color}</span>
        </p>
      </div>

      {/* Icon Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ícone <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {PREDEFINED_ICONS.map((iconOption) => (
            <button
              key={iconOption.value}
              type="button"
              onClick={() => {
                setIcon(iconOption.value)
                if (errors.icon) {
                  setErrors((prev) => ({ ...prev, icon: '' }))
                }
              }}
              className={`relative w-full aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-2xl ${
                icon === iconOption.value
                  ? 'border-indigo-600 bg-indigo-50 scale-110'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              title={iconOption.name}
            >
              {iconOption.value}
              {icon === iconOption.value && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm

