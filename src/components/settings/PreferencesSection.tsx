import { useState } from 'react'
import { Settings, Check } from 'lucide-react'
import { AnimatedCard } from '../ui/AnimatedCard'
import type { Profile, UpdateProfileDto } from '../../types'
import {
  CURRENCY_OPTIONS,
  LOCALE_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '../../constants/settings'

interface PreferencesSectionProps {
  profile: Profile | null
  onUpdate: (data: UpdateProfileDto) => Promise<void>
}

export function PreferencesSection({ profile, onUpdate }: PreferencesSectionProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const handleChange = async (field: keyof UpdateProfileDto, value: string) => {
    try {
      await onUpdate({ [field]: value })
      setSaveSuccess(field)
      setTimeout(() => setSaveSuccess(null), 2000)
    } catch (error) {
      console.error('Erro ao atualizar preferência:', error)
    }
  }

  const currentCurrency =
    CURRENCY_OPTIONS.find((opt) => opt.value === (profile?.currency || 'BRL')) ||
    CURRENCY_OPTIONS[0]
  // TODO: Use locale when locale selector is fully implemented
  const currentDateFormat =
    DATE_FORMAT_OPTIONS.find(
      (opt) => opt.value === (profile?.date_format || 'DD/MM/YYYY')
    ) || DATE_FORMAT_OPTIONS[0]

  return (
    <AnimatedCard delay={0.1}>
      <div className="p-6 cursor-pointer">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Settings
              size={20}
              className="text-slate-600 dark:text-slate-400"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Preferências
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Idioma, moeda e formato de data
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Moeda */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Moeda preferida
            </label>
            <select
              value={profile?.currency || 'BRL'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                transition-colors
                cursor-pointer
              "
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Exemplo: {currentCurrency.symbol} 1.234,56
            </p>
            {saveSuccess === 'currency' && (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} />
                Salvo!
              </p>
            )}
          </div>

          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Idioma da interface
            </label>
            <select
              value={profile?.locale || 'pt-BR'}
              onChange={(e) => handleChange('locale', e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                transition-colors
                cursor-pointer
              "
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {saveSuccess === 'locale' && (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} />
                Salvo!
              </p>
            )}
          </div>

          {/* Formato de data */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Formato de data
            </label>
            <select
              value={profile?.date_format || 'DD/MM/YYYY'}
              onChange={(e) => handleChange('date_format', e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
                transition-colors
                cursor-pointer
              "
            >
              {DATE_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Exemplo: {currentDateFormat.example}
            </p>
            {saveSuccess === 'date_format' && (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} />
                Salvo!
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
