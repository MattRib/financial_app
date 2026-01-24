
import { Shield, Key } from 'lucide-react'
import { AnimatedCard } from '../ui/AnimatedCard'

interface SecuritySectionProps {
  onChangePassword: () => void
}

export function SecuritySection({ onChangePassword }: SecuritySectionProps) {
  return (
    <AnimatedCard delay={0.3}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Segurança
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gerenciar senha e autenticação
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Change password button */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key size={16} />
                  Senha
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Altere sua senha regularmente para manter sua conta segura
                </p>
              </div>
              <button
                onClick={onChangePassword}
                className="
                  shrink-0 px-4 py-2 rounded-lg
                  bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
                  text-white text-sm font-medium
                  transition-colors
                  cursor-pointer
                "
              >
                Alterar senha
              </button>
            </div>
          </div>

          {/* Info message */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong className="font-medium text-slate-900 dark:text-slate-100">
                Dica de segurança:
              </strong>{' '}
              Use uma senha forte com pelo menos 8 caracteres, incluindo
              letras maiúsculas, números e caracteres especiais.
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
