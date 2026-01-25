import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { useCategoriesStore } from '../../store/categoriesStore'
import { useToast } from '../../store/toastStore'
import { StatCard } from '../../components/dashboard/StatCard'
import { CategoryModal, CategoryFilters } from '../../components/categories'
import CategoriesList from './CategoriesList'
import type { Category, CategoryType } from '../../types'
import { Plus, AlertTriangle, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

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

  const toast = useToast()

  // Local state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | CategoryType>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

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

  // Category counts by type (including 'all')
  const categoryCounts = useMemo(() => ({
    all: categories.length,
    income: categories.filter((c) => c.type === 'income').length,
    expense: categories.filter((c) => c.type === 'expense').length,
    investment: categories.filter((c) => c.type === 'investment').length,
  }), [categories])

  // Handle new category
  const handleNewCategory = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  // Handle edit category
  const handleEditCategory = useCallback((category: Category) => {
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
        toast.success('Categoria deletada com sucesso!')
        setDeleteConfirm({ id: '', show: false })
        await fetchCategories()
      } catch {
        toast.error('Erro ao deletar categoria')
      }
    }
  }

  // Handle form submit from modal
  const handleFormSubmit = async (data: { name: string; type: CategoryType; color: string; icon: string }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data)
      toast.success('Categoria atualizada com sucesso!')
    } else {
      await createCategory(data)
      toast.success('Categoria criada com sucesso!')
    }
    setShowModal(false)
    setEditingCategory(null)
    await fetchCategories()
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  // Handle creating default categories
  const handleCreateDefaults = async () => {
    try {
      await createDefaultCategories()
      toast.success('Categorias padrão criadas com sucesso!')
      await fetchCategories()
    } catch {
      toast.error('Erro ao criar categorias padrão')
    }
  }

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Categorias
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Organize suas categorias de transações
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewCategory}
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
              text-white font-medium text-sm
              rounded-xl
              transition-colors duration-200
              cursor-pointer
            "
          >
            <Plus size={18} />
            Nova Categoria
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="cursor-pointer">
            <StatCard
              title="Receitas"
              value={categoryCounts.income.toString()}
              icon={<TrendingUp size={24} />}
              loading={loading}
              index={0}
            />
          </div>

          <div className="cursor-pointer">
            <StatCard
              title="Despesas"
              value={categoryCounts.expense.toString()}
              icon={<TrendingDown size={24} />}
              loading={loading}
              index={1}
            />
          </div>

          <div className="cursor-pointer">
            <StatCard
              title="Investimentos"
              value={categoryCounts.investment.toString()}
              icon={<PiggyBank size={24} />}
              loading={loading}
              index={2}
            />
          </div>
        </motion.div>

        {/* Tabs/Filters */}
        <CategoryFilters
          selectedTab={selectedTab}
          categoryCounts={categoryCounts}
          onTabChange={setSelectedTab}
        />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
        >
          <CategoriesList
            categories={filteredCategories}
            loading={loading}
            onEdit={handleEditCategory}
            onDelete={handleDeleteClick}
            onCreateFirst={handleNewCategory}
            onCreateDefaults={handleCreateDefaults}
          />
        </motion.div>

        {/* Category Modal */}
        <CategoryModal
          isOpen={showModal}
          category={editingCategory}
          loading={loading}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setDeleteConfirm({ id: '', show: false })}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="
                  relative bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-800
                  rounded-2xl shadow-2xl
                  max-w-md w-full p-6
                "
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Confirmar exclusão
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Tem certeza que deseja excluir esta categoria?
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Esta ação não pode ser desfeita.
                    </p>
                    {(() => {
                      const category = categories.find((c) => c.id === deleteConfirm.id)
                      return category ? (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <span style={{ color: category.color }}>{category.icon}</span>
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {category.name}
                          </span>
                        </div>
                      ) : null
                    })()}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeleteConfirm({ id: '', show: false })}
                        className="
                          flex-1 px-4 py-2.5 rounded-xl
                          border border-slate-200 dark:border-slate-700
                          text-slate-700 dark:text-slate-300
                          bg-white dark:bg-slate-800
                          hover:bg-slate-50 dark:hover:bg-slate-700
                          font-medium text-sm
                          transition-colors duration-200
                          cursor-pointer
                        "
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteConfirm}
                        className="
                          flex-1 px-4 py-2.5 rounded-xl
                          bg-red-600 hover:bg-red-700
                          text-white font-medium text-sm
                          transition-colors duration-200
                          cursor-pointer
                        "
                      >
                        Excluir
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  )
}

export default CategoriesPage

