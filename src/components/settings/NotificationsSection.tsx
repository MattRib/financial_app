import { useState } from 'react'
import { Bell } from 'lucide-react'
import { AnimatedCard } from '../ui/AnimatedCard'
import type { Profile, UpdateProfileDto } from '../../types'

interface NotificationsSectionProps {
  profile: Profile | null
  onUpdate: (data: UpdateProfileDto) => Promise<void>
}

export function NotificationsSection({
  profile,
  onUpdate,
}: NotificationsSectionProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleToggle = async (field: keyof UpdateProfileDto, value: boolean) => {
    setUpdating(field)
    try {
      await onUpdate({ [field]: value })
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error)
    } finally {
      setTimeout(() => setUpdating(null), 500)
    }
  }

  return (
    <AnimatedCard delay={0.2}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bell size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Notificações
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gerenciar alertas e notificações
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Notificações por email
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receber alertas e lembretes por email
              </p>
            </div>
            <button
              onClick={() =>
                handleToggle(
                  'email_notifications',
                  !profile?.email_notifications
                )
              }
              disabled={updating === 'email_notifications'}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  profile?.email_notifications
                    ? 'bg-emerald-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${profile?.email_notifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Push notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Notificações push
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receber notificações no navegador
              </p>
            </div>
            <button
              onClick={() =>
                handleToggle(
                  'push_notifications',
                  !profile?.push_notifications
                )
              }
              disabled={updating === 'push_notifications'}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  profile?.push_notifications
                    ? 'bg-emerald-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${profile?.push_notifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
