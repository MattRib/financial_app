export const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'Real (R$)', symbol: 'R$' },
  { value: 'USD', label: 'Dólar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'Libra (£)', symbol: '£' },
  { value: 'JPY', label: 'Iene (¥)', symbol: '¥' },
]

export const LOCALE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
]

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA', example: '24/01/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA', example: '01/24/2026' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD', example: '2026-01-24' },
]

export const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
  { label: 'Pelo menos 1 letra maiúscula', regex: /[A-Z]/ },
  { label: 'Pelo menos 1 número', regex: /\d/ },
  {
    label: 'Pelo menos 1 caractere especial (@$!%*?&#)',
    regex: /[@$!%*?&#]/,
  },
]
