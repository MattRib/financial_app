import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { useToast } from '../../store/toastStore'
import type { ChangePasswordDto } from '../../types'
import { PASSWORD_REQUIREMENTS } from '../../constants/settings'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ChangePasswordDto) => Promise<void>
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const toast = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const prevIsOpenRef = useRef(isOpen)

  // Reset form when modal opens
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      setTimeout(() => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setIsSubmitting(false)
      }, 0)
    }
  }, [isOpen])

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

  // Check password requirements
  const passwordChecks = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    valid: req.regex.test(newPassword),
  }))

  const isPasswordValid = passwordChecks.every((check) => check.valid)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ''

  const canSubmit =
    currentPassword !== '' &&
    isPasswordValid &&
    passwordsMatch &&
    !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      await onSubmit({ currentPassword, newPassword })
      toast.success('Senha alterada com sucesso!')
      onClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao trocar senha'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
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
              {/* Header */}
              <div className="p-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Trocar senha
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Senha atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      autoFocus
                      className="
                        w-full px-4 py-2.5 pr-10 rounded-lg
                        bg-white dark:bg-slate-900
                        border border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                        transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="
                        w-full px-4 py-2.5 pr-10 rounded-lg
                        bg-white dark:bg-slate-900
                        border border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                        transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      {passwordChecks.map((check, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Check
                            size={14}
                            className={
                              check.valid
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }
                          />
                          <span
                            className={
                              check.valid
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }
                          >
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite novamente sua nova senha"
                      className={`
                        w-full px-4 py-2.5 pr-10 rounded-lg
                        bg-white dark:bg-slate-900
                        border ${
                          confirmPassword && !passwordsMatch
                            ? 'border-red-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }
                        text-slate-900 dark:text-slate-100
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                        transition-colors
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <p
                      className={`mt-1.5 text-xs ${
                        passwordsMatch
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-5 pt-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="
                      flex-1 px-4 py-2.5 rounded-xl
                      border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-400
                      hover:bg-slate-50 dark:hover:bg-slate-800
                      text-sm font-medium transition-colors
                      disabled:opacity-50
                      cursor-pointer
                    "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                    className="
                      flex-1 px-4 py-2.5 rounded-xl
                      bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                      text-white text-sm font-medium transition-colors
                      cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    'Alterar senha'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
