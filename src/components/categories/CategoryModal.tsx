import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import type { Category, CategoryType } from '../../types'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TYPE_CONFIG } from '../../constants/categories'

// Reduced sets for minimal UI
const COMPACT_COLORS = CATEGORY_COLORS.slice(0, 12)
const COMPACT_ICONS = CATEGORY_ICONS.slice(0, 15)

interface CategoryModalProps {
  isOpen: boolean
  category: Category | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { name: string; type: CategoryType; color: string; icon: string }) => Promise<void>
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  category,
  loading = false,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<CategoryType>('expense')
  const [formColor, setFormColor] = useState<string>(COMPACT_COLORS[0])
  const [formIcon, setFormIcon] = useState<string>(COMPACT_ICONS[0])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Track previous isOpen to detect when modal opens
  const prevIsOpenRef = useRef(isOpen)

  // Reset or populate form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        if (category) {
          setFormName(category.name)
          setFormType(category.type)
          setFormColor(category.color)
          setFormIcon(category.icon || COMPACT_ICONS[0])
        } else {
          setFormName('')
          setFormType('expense')
          setFormColor(COMPACT_COLORS[0])
          setFormIcon(COMPACT_ICONS[0])
        }
        setFormErrors({})
        setSubmitError(null)
      }, 0)
    }
  }, [isOpen, category])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formName.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formName.trim().length < 2) {
      errors.name = 'Mínimo 2 caracteres'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    try {
      await onSubmit({
        name: formName.trim(),
        type: formType,
        color: formColor,
        icon: formIcon,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="
              relative bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-800
              rounded-2xl shadow-2xl
              w-full max-w-md
            "
          >
            <form onSubmit={handleSubmit}>
              {/* Header with Preview */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {category ? 'Editar' : 'Nova Categoria'}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Inline Preview + Name Input */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors"
                    style={{ backgroundColor: `${formColor}18` }}
                  >
                    <span style={{ color: formColor }}>{formIcon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => {
                        if (e.target.value.length <= 30) {
                          setFormName(e.target.value)
                          if (formErrors.name) setFormErrors({})
                        }
                      }}
                      placeholder="Nome da categoria"
                      autoFocus
                      className={`
                        w-full px-0 py-1 bg-transparent
                        text-slate-900 dark:text-slate-100 font-medium
                        placeholder-slate-400 dark:placeholder-slate-500
                        border-b-2 ${formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500'}
                        focus:outline-none transition-colors
                      `}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Type Selection */}
              <div className="px-5 pb-4">
                <div className="flex gap-2">
                  {(['expense', 'income', 'investment'] as CategoryType[]).map((type) => {
                    const config = CATEGORY_TYPE_CONFIG[type]
                    const Icon = config.icon
                    const isSelected = formType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        className={`
                          flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all
                          flex items-center justify-center gap-1.5
                          ${isSelected
                            ? `${config.bgColor} ${config.textColor}`
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        <Icon size={14} />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color + Icon Selection */}
              <div className="px-5 pb-4 space-y-4">
                {/* Colors */}
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Cor</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {COMPACT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`
                          w-7 h-7 rounded-full transition-all flex items-center justify-center
                          ${formColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 dark:ring-offset-slate-900' : 'hover:scale-110'}
                        `}
                        style={{ backgroundColor: color }}
                      >
                        {formColor === color && <Check size={14} className="text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icons */}
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Ícone</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {COMPACT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormIcon(icon)}
                        className={`
                          w-9 h-9 rounded-lg text-base flex items-center justify-center transition-all
                          ${formIcon === icon
                            ? 'bg-slate-200 dark:bg-slate-700 ring-2 ring-slate-900 dark:ring-slate-100'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="mx-5 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 p-5 pt-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-400
                    hover:bg-slate-50 dark:hover:bg-slate-800
                    text-sm font-medium transition-colors
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl
                    bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                    text-white text-sm font-medium transition-colors
                    disabled:opacity-50
                  "
                >
                  {loading ? 'Salvando...' : category ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
