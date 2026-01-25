import { useState, useEffect } from 'react'
import { User, Save, Loader2 } from 'lucide-react'
import { AnimatedCard } from '../ui/AnimatedCard'
import { useToast } from '../../store/toastStore'
import type { Profile, UpdateProfileDto } from '../../types'

interface ProfileSectionProps {
  profile: Profile | null
  onUpdate: (data: UpdateProfileDto) => Promise<void>
}

export function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const toast = useToast()

  const [formName, setFormName] = useState('')
  const [formAvatar, setFormAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormName(profile.full_name || '')
      setFormAvatar(profile.avatar_url || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return

    const hasChanges =
      formName !== (profile.full_name || '') ||
      formAvatar !== (profile.avatar_url || '')

    if (!hasChanges) return

    setIsSaving(true)

    try {
      await onUpdate({
        full_name: formName || undefined,
        avatar_url: formAvatar || undefined,
      })
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatedCard>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <User size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Perfil
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Informações básicas do usuário
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Nome completo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Seu nome"
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                transition-colors
              "
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Avatar URL
            </label>
            <input
              type="url"
              value={formAvatar}
              onChange={(e) => setFormAvatar(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                transition-colors
              "
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-slate-50 dark:bg-slate-800/50
                  border border-slate-200 dark:border-slate-700
                  text-slate-500 dark:text-slate-400
                  cursor-not-allowed
                "
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Não editável
              </span>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="
                w-full sm:w-auto
                px-6 py-2.5 rounded-lg
                bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                text-white text-sm font-medium
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                flex items-center justify-center gap-2
              "
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
