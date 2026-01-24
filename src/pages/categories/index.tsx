import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useCategoriesStore } from '../../store/categoriesStore'
import CategoriesList from '../categories/CategoriesList'
import type { Category, CategoryType } from '../../types'
import { Plus, X, TrendingUp, TrendingDown, PiggyBank, List } from 'lucide-react'

// Predefined colors
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b',
]

// Predefined icons
const ICONS = [
  '💰', '💵', '💳', '🏦', '📈', '📊', '🏠', '🚗', '🚌', '✈️',
  '🍔', '🍽️', '🍕', '☕', '🏥', '💊', '💪', '📚', '✏️', '💻',
  '📱', '🎮', '🎬', '🎵', '⚽', '👕', '🛍️', '🎁', '👨‍👩‍👧‍👦', '🐶',
]

const CategoriesPage: React.FC = () => {
  // Store
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories,
  } = useCategoriesStore()

  // Local state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | CategoryType>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<CategoryType>('expense')
  const [formColor, setFormColor] = useState('#ef4444')
  const [formIcon, setFormIcon] = useState('💰')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showModal || deleteConfirm.show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal, deleteConfirm.show])

  // Filter categories by selected tab
  const filteredCategories = useMemo(() => {
    if (selectedTab === 'all') {
      return categories
    }
    return categories.filter((cat) => cat.type === selectedTab)
  }, [categories, selectedTab])

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormType('expense')
    setFormColor('#ef4444')
    setFormIcon('💰')
    setFormErrors({})
    setSubmitError(null)
  }

  // Handle new category
  const handleNewCategory = () => {
    resetForm()
    setEditingCategory(null)
    setShowModal(true)
  }

  // Handle edit category
  const handleEditCategory = useCallback((category: Category) => {
    setFormName(category.name)
    setFormType(category.type)
    setFormColor(category.color)
    setFormIcon(category.icon || '💰')
    setFormErrors({})
    setSubmitError(null)
    setEditingCategory(category)
    setShowModal(true)
  }, [])

  // Handle delete category
  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ id, show: true })
  }, [])

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteCategory(deleteConfirm.id)
        setNotification({ type: 'success', message: 'Categoria deletada com sucesso!' })
        setDeleteConfirm({ id: '', show: false })
        await fetchCategories()
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar categoria' })
      }
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formName.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formName.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres'
    } else if (formName.length > 50) {
      errors.name = 'Nome deve ter no máximo 50 caracteres'
    }

    if (!formType) {
      errors.type = 'Tipo é obrigatório'
    }

    if (!formColor) {
      errors.color = 'Cor é obrigatória'
    }

    if (!formIcon) {
      errors.icon = 'Ícone é obrigatório'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    try {
      const data = {
        name: formName.trim(),
        type: formType,
        color: formColor,
        icon: formIcon,
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
        setNotification({ type: 'success', message: 'Categoria atualizada com sucesso!' })
      } else {
        await createCategory(data)
        setNotification({ type: 'success', message: 'Categoria criada com sucesso!' })
      }
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      await fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar categoria'
      setSubmitError(errorMessage)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false)
    setEditingCategory(null)
    resetForm()
  }

  // Handle creating default categories
  const handleCreateDefaults = async () => {
    try {
      await createDefaultCategories()
      setNotification({ type: 'success', message: 'Categorias padrão criadas com sucesso!' })
      await fetchCategories()
    } catch {
      setNotification({ type: 'error', message: 'Erro ao criar categorias padrão' })
    }
  }

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Get type info helper
  const getTypeInfo = (type: CategoryType) => {
    switch (type) {
      case 'income':
        return { label: 'Entrada', icon: <TrendingUp size={18} />, bgColor: 'bg-green-100', textColor: 'text-green-700' }
      case 'expense':
        return { label: 'Saída', icon: <TrendingDown size={18} />, bgColor: 'bg-red-100', textColor: 'text-red-700' }
      case 'investment':
        return { label: 'Investimento', icon: <PiggyBank size={18} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
      default:
        return { label: type, icon: null, bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    }
  }

  // Tab configuration
  const tabs = [
    { id: 'all' as const, label: 'Todos', icon: List },
    { id: 'income' as const, label: 'Receitas', icon: TrendingUp },
    { id: 'expense' as const, label: 'Despesas', icon: TrendingDown },
    { id: 'investment' as const, label: 'Investimentos', icon: PiggyBank },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-500">Organize suas categorias de transações</p>
          </div>
          <button
            onClick={handleNewCategory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
        </div>

        {/* Tabs/Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = selectedTab === tab.id
                const count = tab.id === 'all' 
                  ? categories.length 
                  : categories.filter((cat) => cat.type === tab.id).length

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                      ${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {tab.label}
                    <span
                      className={`
                        ml-1 px-2 py-0.5 rounded-full text-xs
                        ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-md ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            <p className="text-sm">{notification.message}</p>
          </div>
        )}

        {/* Categories List */}
        <CategoriesList
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEditCategory}
          onDelete={handleDeleteClick}
          onCreateFirst={handleNewCategory}
          onCreateDefaults={handleCreateDefaults}
        />

        {/* Modal - Create/Edit Category */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            {/* Background overlay with blur */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
              onClick={handleModalClose}
            />

            {/* Modal panel */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden px-6 py-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <button
                      onClick={handleModalClose}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Categoria <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => {
                          if (e.target.value.length <= 50) {
                            setFormName(e.target.value)
                            if (formErrors.name) {
                              setFormErrors((prev) => ({ ...prev, name: '' }))
                            }
                          }
                        }}
                        placeholder="Ex: Alimentação, Salário, Investimentos..."
                        maxLength={50}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-600' : 'border-gray-300'
                        }`}
                      />
                      <div className="mt-1 flex justify-between items-center">
                        {formErrors.name ? (
                          <p className="text-sm text-red-600">{formErrors.name}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Escolha um nome descritivo</p>
                        )}
                        <p className={`text-xs ${formName.length >= 45 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {formName.length}/50
                        </p>
                      </div>
                    </div>

                    {/* Type Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Transação <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['expense', 'income', 'investment'] as CategoryType[]).map((type) => {
                          const info = getTypeInfo(type)
                          const isSelected = formType === type
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormType(type)
                                if (formErrors.type) {
                                  setFormErrors((prev) => ({ ...prev, type: '' }))
                                }
                              }}
                              className={`px-3 py-3 rounded-md border transition-colors ${
                                isSelected
                                  ? `${info.bgColor} border-current ${info.textColor}`
                                  : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1.5">
                                {info.icon}
                                <span className="text-xs font-medium">{info.label}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      {formErrors.type && <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>}
                    </div>

                    {/* Preview */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{
                            backgroundColor: `${formColor}20`,
                            color: formColor,
                          }}
                        >
                          {formIcon || '📁'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formName || 'Nome da categoria'}
                          </p>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getTypeInfo(formType).bgColor} ${getTypeInfo(formType).textColor}`}>
                            {getTypeInfo(formType).icon}
                            {getTypeInfo(formType).label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setFormColor(color)
                              if (formErrors.color) {
                                setFormErrors((prev) => ({ ...prev, color: '' }))
                              }
                            }}
                            className={`relative w-full aspect-square rounded-md border transition-all ${
                              formColor === color
                                ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {formColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      {formErrors.color && <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>}
                    </div>

                    {/* Icon Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ícone <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                        {ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              setFormIcon(icon)
                              if (formErrors.icon) {
                                setFormErrors((prev) => ({ ...prev, icon: '' }))
                              }
                            }}
                            className={`relative w-full aspect-square rounded-md border transition-all flex items-center justify-center text-xl ${
                              formIcon === icon
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 ring-offset-1'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      {formErrors.icon && <p className="mt-1 text-sm text-red-600">{formErrors.icon}</p>}
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{submitError}</p>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleModalClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
                onClick={() => setDeleteConfirm({ id: '', show: false })}
              />
              <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                    {(() => {
                      const category = categories.find((c) => c.id === deleteConfirm.id)
                      return category ? (
                        <span className="block mt-2 font-medium text-gray-900">
                          Categoria: {category.name}
                        </span>
                      ) : null
                    })()}
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirm({ id: '', show: false })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default CategoriesPage

