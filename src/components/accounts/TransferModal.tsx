// Componente deprecado - funcionalidade de transferência foi removida
// Mantido apenas para compatibilidade com imports existentes

import React from 'react'

interface TransferModalProps {
  isOpen?: boolean
  onClose?: () => void
  onSubmit?: (data: any) => Promise<void>
  accounts?: any[]
}

export const TransferModal: React.FC<TransferModalProps> = () => {
  return null
}
