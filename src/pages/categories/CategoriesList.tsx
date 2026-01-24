import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus } from 'lucide-react'
import type { Category } from '../../types'
import { CategoryCard, CategoryCardSkeleton } from '../../components/categories'
import { PremiumEmptyState } from '../../components/common'

interface CategoriesListProps {
  categories: Category[]
  loading: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onCreateFirst?: () => void
  onCreateDefaults?: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  onCreateFirst,
  onCreateDefaults,
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CategoryCardSkeleton key={index} index={index} />
        ))}
      </div>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <PremiumEmptyState
          icon={FolderOpen}
          title="Nenhuma categoria encontrada"
          description="Comece criando suas categorias para organizar suas transações"
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onCreateDefaults && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateDefaults}
              className="
                inline-flex items-center justify-center gap-2 px-5 py-2.5
                bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                text-white font-medium text-sm
                rounded-xl
                transition-colors duration-200
              "
            >
              <Plus size={18} />
              Criar categorias padrão
            </motion.button>
          )}
          {onCreateFirst && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateFirst}
              className="
                inline-flex items-center justify-center gap-2 px-5 py-2.5
                bg-white dark:bg-slate-800
                text-slate-700 dark:text-slate-300
                border border-slate-200 dark:border-slate-700
                font-medium text-sm
                rounded-xl
                hover:bg-slate-50 dark:hover:bg-slate-800/80
                transition-colors duration-200
              "
            >
              <Plus size={18} />
              Criar manualmente
            </motion.button>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
    >
      <AnimatePresence mode="popLayout">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <CategoryCard
              category={category}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default CategoriesList

