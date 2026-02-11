import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccountsStore } from '../store/accountsStore'
import { useToast } from '../store/toastStore'
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  AccountType,
} from '../types'

export function useAccount() {
  const {
    accounts,
    summary,
    loading,
    error,
    fetch,
    fetchSummary,
    create,
    update,
    delete: remove,
  } = useAccountsStore()

  const toast = useToast()

  // UI State
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    account: Account | null
    show: boolean
  }>({
    account: null,
    show: false,
  })

  // Filters
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all')
  const [showInactive, setShowInactive] = useState(false)

  // Initial fetch
  useEffect(() => {
    fetch()
    fetchSummary()
  }, [fetch, fetchSummary])

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (!showInactive && !account.is_active) return false
      if (selectedType !== 'all' && account.type !== selectedType) return false
      return true
    })
  }, [accounts, selectedType, showInactive])

  // Handlers
  const handleNew = useCallback(() => {
    setEditingAccount(null)
    setShowModal(true)
  }, [])

  const handleEdit = useCallback((account: Account) => {
    setEditingAccount(account)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingAccount(null)
  }, [])

  const handleSubmit = useCallback(
    async (data: CreateAccountDto | UpdateAccountDto) => {
      try {
        if (editingAccount) {
          await update(editingAccount.id, data as UpdateAccountDto)
          toast.success('Conta atualizada com sucesso!')
        } else {
          await create(data as CreateAccountDto)
          toast.success('Conta criada com sucesso!')
        }
        handleCloseModal()
      } catch {
        toast.error('Erro ao salvar conta. Tente novamente.')
      }
    },
    [editingAccount, create, update, toast, handleCloseModal]
  )

  const handleDeleteClick = useCallback((account: Account) => {
    setDeleteConfirm({ account, show: true })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.account) return
    try {
      await remove(deleteConfirm.account.id)
      toast.success('Conta removida com sucesso!')
    } catch {
      toast.error('Erro ao remover conta.')
    }
    setDeleteConfirm({ account: null, show: false })
  }, [deleteConfirm.account, remove, toast])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ account: null, show: false })
  }, [])

  return {
    // Data
    accounts: filteredAccounts,
    allAccounts: accounts,
    summary,
    loading,
    error,

    // Filters
    selectedType,
    setSelectedType,
    showInactive,
    setShowInactive,

    // Modal state
    showModal,
    editingAccount,

    // Delete confirmation
    deleteConfirm,

    // Handlers
    handleNew,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
