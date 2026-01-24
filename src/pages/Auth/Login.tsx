import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, DollarSign, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

// Premium Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Premium easing
    },
  },
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 16,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2 }
  },
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'signin') {
      await signIn(email, password)
    } else {
      await signUp(email, password)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Left Side - Premium Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 dark:bg-slate-900">
        {/* Decorative elements - subtle, no gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-slate-900/50 dark:bg-slate-800/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-800/30 dark:bg-slate-700/30 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 text-white">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">Financial</span>
            </div>
            <p className="text-slate-400 text-sm font-light">Gestão Financeira Premium</p>
          </motion.div>

          {/* Center Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-semibold tracking-tight leading-tight">
              Controle total
              <br />
              sobre suas
              <br />
              <span className="text-slate-400">finanças</span>
            </h1>
            <p className="text-slate-400 text-lg font-light max-w-md leading-relaxed">
              Planeje, acompanhe e alcance suas metas financeiras com elegância e precisão.
            </p>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-3 gap-8"
          >
            <div>
              <div className="text-3xl font-semibold mb-1">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">256-bit</div>
              <div className="text-slate-400 text-sm">Segurança</div>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">24/7</div>
              <div className="text-slate-400 text-sm">Suporte</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div
            className="lg:hidden flex items-center gap-3 mb-8"
            variants={logoVariants}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Financial
            </span>
          </motion.div>

          {/* Header */}
          <motion.div className="mb-10" variants={itemVariants}>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
              {mode === 'signin' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-light">
              {mode === 'signin'
                ? 'Entre com suas credenciais para continuar'
                : 'Comece sua jornada financeira hoje'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={itemVariants}
          >
            {/* Email Input */}
            <div className="group">
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors"
              >
                Endereço de email
              </label>
              <div className="relative">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`
                    w-full px-4 py-3.5
                    bg-slate-50/50 dark:bg-slate-900/50
                    border-2 rounded-xl
                    text-slate-900 dark:text-white text-base
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all duration-300
                    ${focusedField === 'email'
                      ? 'border-slate-900 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                    focus:outline-none focus:border-slate-900 dark:focus:border-slate-600
                  `}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  className={`
                    w-full px-4 py-3.5 pr-12
                    bg-slate-50/50 dark:bg-slate-900/50
                    border-2 rounded-xl
                    text-slate-900 dark:text-white text-base
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all duration-300
                    ${focusedField === 'password'
                      ? 'border-slate-900 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                    focus:outline-none focus:border-slate-900 dark:focus:border-slate-600
                  `}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-start gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className={`
                group relative w-full py-4 px-6
                bg-slate-900 dark:bg-white
                hover:bg-slate-800 dark:hover:bg-slate-100
                text-white dark:text-slate-900
                text-base font-semibold rounded-xl
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-slate-900/10 dark:shadow-white/10
                hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/20
                flex items-center justify-center gap-2
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            className="relative my-8"
            variants={itemVariants}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-slate-950 text-sm text-slate-500 dark:text-slate-400 font-light">
                ou
              </span>
            </div>
          </motion.div>

          {/* Toggle Mode */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <p className="text-slate-600 dark:text-slate-400 font-light">
              {mode === 'signin' ? (
                <>
                  Ainda não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-slate-900 dark:text-white font-semibold hover:underline underline-offset-4 transition-all"
                  >
                    Cadastre-se gratuitamente
                  </button>
                </>
              ) : (
                <>
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-slate-900 dark:text-white font-semibold hover:underline underline-offset-4 transition-all"
                  >
                    Fazer login
                  </button>
                </>
              )}
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-slate-500 dark:text-slate-500 mt-12 font-light"
            variants={itemVariants}
          >
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
