import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  EyeOff,
} from 'lucide-react'
import { AccountTypeLabels } from '../../types'
import type { Account } from '../../types'

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isPositive = account.current_balance >= 0

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-5 rounded-xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${!account.is_active ? 'opacity-60' : ''}
      `}
    >
      {/* Colored top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: account.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pt-1">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${account.color}20` }}
          >
            {account.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {account.name}
              </h3>
              {!account.is_active && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  Inativa
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              {AccountTypeLabels[account.type]}
              {!account.include_in_total && (
                <>
                  <span>•</span>
                  <EyeOff size={12} />
                  <span>Oculta do total</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[140px]"
              >
                <button
                  onClick={() => {
                    onEdit(account)
                    setShowActions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Pencil size={14} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(account)
                    setShowActions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          Saldo atual
        </p>
        <div className="flex items-center gap-2">
          <p
            className={`text-2xl font-bold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(account.current_balance)}
          </p>
          {isPositive ? (
            <TrendingUp
              size={18}
              className="text-emerald-500 dark:text-emerald-400"
            />
          ) : (
            <TrendingDown size={18} className="text-red-500 dark:text-red-400" />
          )}
        </div>

        {account.initial_balance !== 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Saldo inicial: {formatCurrency(account.initial_balance)}
          </p>
        )}
      </div>

      {/* Notes */}
      {account.notes && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {account.notes}
        </p>
      )}
    </motion.div>
  )
}

// Skeleton loader
export const AccountCardSkeleton: React.FC = () => {
  return (
    <div className="relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex items-start gap-3 pt-1">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-36" />
      </div>
    </div>
  )
}
