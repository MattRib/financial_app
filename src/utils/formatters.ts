export function formatPercentage(value: number, maximumFractionDigits = 0): string {
  const v = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits,
  }).format(v) + '%'
}

export const formatCurrency = (value: number) => {
  const v = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}
