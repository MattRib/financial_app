import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useCategoriesStore } from '../../store/categoriesStore'
import CategoriesList from '../categories/CategoriesList'
import CategoryForm from './CategoryForm'
import type { Category, CategoryType, CreateCategoryDto, UpdateCategoryDto } from '../../types'
import { Plus, X, TrendingUp, TrendingDown, PiggyBank, List } from 'lucide-react'

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
  } = useCategoriesStore()

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | CategoryType>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Filter categories by selected tab
  const filteredCategories = useMemo(() => {
    if (selectedTab === 'all') {
      return categories
    }
    return categories.filter((cat) => cat.type === selectedTab)
  }, [categories, selectedTab])

  // Handle new category
  const handleNewCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  // Handle edit category
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
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
        // Refetch categories
        await fetchCategories()
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar categoria' })
      }
    }
  }

  // Handle form submit
  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data as UpdateCategoryDto)
        setNotification({ type: 'success', message: 'Categoria atualizada com sucesso!' })
      } else {
        await createCategory(data as CreateCategoryDto)
        setNotification({ type: 'success', message: 'Categoria criada com sucesso!' })
      }
      setShowForm(false)
      setEditingCategory(null)
      // Refetch categories
      await fetchCategories()
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao salvar categoria' })
      throw err
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

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
        />

        {/* Modal - Category Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleFormCancel}
              />

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <button
                      onClick={handleFormCancel}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <CategoryForm
                    initialData={editingCategory || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isLoading={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setDeleteConfirm({ id: '', show: false })}
              />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

