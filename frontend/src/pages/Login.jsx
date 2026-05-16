import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Zap, AlertTriangle, ArrowRight,
  ShieldCheck, CheckCircle, Eye, EyeOff, Users,
  Loader2, X, Check,
} from 'lucide-react'
import { login as loginApi, register as registerApi, checkEmail as checkEmailApi } from '../api/auth.api'
import useAuthStore from '../store/authStore'
import { LogoMark } from '../components/Logo'
import { toast } from 'sonner'

const inputCls =
  'w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400 dark:placeholder-gray-500'

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Mia', 'Jake', 'Zara', 'Leo', 'Nora', 'Sam', 'Aria', 'Max', 'Luna', 'Eli']
const AVATARS = AVATAR_SEEDS.map(
  seed => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`
)

const PASSWORD_RULES = [
  { id: 'len',     label: '8-15 characters',              test: p => p.length >= 8 && p.length <= 15 },
  { id: 'upper',   label: 'At least 2 uppercase letters', test: p => (p.match(/[A-Z]/g) || []).length >= 2 },
  { id: 'lower',   label: 'At least 1 lowercase letter',  test: p => /[a-z]/.test(p) },
  { id: 'digit',   label: 'At least 1 number (0-9)',      test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'At least 1 special character', test: p => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'nospace', label: 'No spaces allowed',            test: p => !/\s/.test(p) },
]

const STRENGTH_META = [
  { label: '',             barColor: '',               textColor: '' },
  { label: 'Very Weak',   barColor: 'bg-red-500',     textColor: 'text-red-500 dark:text-red-400' },
  { label: 'Weak',        barColor: 'bg-orange-500',  textColor: 'text-orange-500 dark:text-orange-400' },
  { label: 'Fair',        barColor: 'bg-yellow-500',  textColor: 'text-yellow-600 dark:text-yellow-400' },
  { label: 'Good',        barColor: 'bg-blue-500',    textColor: 'text-blue-500 dark:text-blue-400' },
  { label: 'Strong',      barColor: 'bg-teal-500',    textColor: 'text-teal-500 dark:text-teal-400' },
  { label: 'Very Strong', barColor: 'bg-green-500',   textColor: 'text-green-600 dark:text-green-400' },
]

function PasswordStrengthMeter({ password }) {
  if (!password) return null
  const score = PASSWORD_RULES.filter(r => r.test(password)).length
  const meta = STRENGTH_META[score] || STRENGTH_META[0]
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {PASSWORD_RULES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < score ? meta.barColor : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        {meta.label && (
          <span className={`text-xs font-semibold whitespace-nowrap ${meta.textColor}`}>
            {meta.label}
          </span>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
        {PASSWORD_RULES.map(rule => {
          const ok = rule.test(password)
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                  ok ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const ADMIN_PERKS = [
  { icon: ShieldCheck, label: 'Full admin control & RBAC' },
  { icon: CheckCircle, label: 'Manage users and permissions' },
  { icon: CheckCircle, label: 'Project & team oversight' },
]
const MEMBER_PERKS = [
  { icon: Users,       label: 'Collaborate with your team' },
  { icon: CheckCircle, label: 'Track your tasks in real-time' },
  { icon: CheckCircle, label: 'Stay on top of deadlines' },
]

export default function Login() {
  const [activeTab, setActiveTab] = useState('member')
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [emailStatus, setEmailStatus] = useState('idle') // 'idle'|'checking'|'available'|'taken'|'invalid'

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const expired = searchParams.get('expired') === '1'

  const loginForm = useForm()
  const signupForm = useForm()
  const passwordLive = signupForm.watch('password', '')

  const sName     = signupForm.watch('name', '')
  const sEmail    = signupForm.watch('email', '')
  const sPassword = signupForm.watch('password', '')
  const sConfirm  = signupForm.watch('confirmPassword', '')

  const isSignup = activeTab === 'member' && authMode === 'signup'
  const perks = activeTab === 'admin' ? ADMIN_PERKS : MEMBER_PERKS

  const nameValid      = sName.trim().length >= 2
  const allRulesPass   = PASSWORD_RULES.every(r => r.test(sPassword))
  const passwordsMatch = sPassword.length > 0 && sPassword === sConfirm
  const canSubmit      = nameValid && emailStatus === 'available' && allRulesPass && passwordsMatch && !loading

  // Debounced live email duplicate check
  useEffect(() => {
    if (!isSignup) return
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!sEmail) { setEmailStatus('idle'); return }
    if (!emailRegex.test(sEmail)) { setEmailStatus('invalid'); return }

    setEmailStatus('checking')
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await checkEmailApi(sEmail)
        if (!cancelled) setEmailStatus(res.data.available ? 'available' : 'taken')
      } catch {
        if (!cancelled) setEmailStatus('idle')
      }
    }, 500)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [sEmail, isSignup])

  const switchTab = (tab) => {
    setActiveTab(tab)
    setAuthMode('login')
    setShowPass(false)
    setShowConfirm(false)
    setSelectedAvatar(AVATARS[0])
    setEmailStatus('idle')
    loginForm.reset()
    signupForm.reset()
  }

  const switchMode = (mode) => {
    setAuthMode(mode)
    setShowPass(false)
    setShowConfirm(false)
    setSelectedAvatar(AVATARS[0])
    setEmailStatus('idle')
  }

  const onLogin = async (data) => {
    setLoading(true)
    try {
      const res = await loginApi(data)
      const { token, user } = res.data
      if (activeTab === 'admin' && user.role !== 'ADMIN') {
        toast.error('This account does not have admin privileges.')
        return
      }
      if (activeTab === 'member' && user.role === 'ADMIN') {
        toast.error('Admin accounts must use the Admin tab.')
        return
      }
      login(user, token)
      toast.success('Signed in successfully!')
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Invalid email or password.')
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSignup = async (data) => {
    setLoading(true)
    try {
      const res = await registerApi({
        name: data.name.trim(),
        email: data.email,
        password: data.password,
        avatar: selectedAvatar,
      })
      const { token, user } = res.data
      login(user, token)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const emailIndicator = () => {
    if (emailStatus === 'checking') return (
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        <span>Checking availability...</span>
      </div>
    )
    if (emailStatus === 'available') return (
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600 dark:text-green-400">
        <Check size={12} />
        <span>Email is available</span>
      </div>
    )
    if (emailStatus === 'taken') return (
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 dark:text-red-400">
        <X size={12} />
        <span>This email is already registered</span>
      </div>
    )
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <LogoMark size={36} className="shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">TaskVerse</span>
          </Link>

          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-7">
            {[
              { id: 'admin',  Icon: ShieldCheck, label: 'Admin' },
              { id: 'member', Icon: Users,        label: 'Member' },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${authMode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {activeTab === 'admin' ? 'Admin Sign In' : isSignup ? 'Create Member Account' : 'Member Sign In'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeTab === 'admin'
                  ? 'Access the admin panel with your credentials'
                  : isSignup
                    ? 'Join your team on TaskVerse today'
                    : 'Sign in to continue to your dashboard'}
              </p>
            </motion.div>
          </AnimatePresence>

          {expired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm rounded-xl px-4 py-3 mb-4"
            >
              <AlertTriangle size={15} className="flex-shrink-0" />
              Your session expired. Please sign in again.
            </motion.div>
          )}


          <AnimatePresence>
            {activeTab === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mb-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-900/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Zap size={11} className="text-white" />
                </div>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">Demo Credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-indigo-100 dark:border-indigo-800/40">
                  <p className="text-[10px] font-semibold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 break-all">admin@example.com</p>
                </div>
                <div className="bg-white dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-indigo-100 dark:border-indigo-800/40">
                  <p className="text-[10px] font-semibold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-0.5">Password</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">Admin@12345</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginForm.setValue('email', 'admin@example.com')
                  loginForm.setValue('password', 'Admin@12345')
                  loginForm.clearErrors()
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900/60 border border-indigo-200 dark:border-indigo-700/60 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all"
              >
                <ArrowRight size={11} />
                One-click fill
              </button>
            </motion.div>
          )}
          </AnimatePresence>

          <AnimatePresence>
            {activeTab === 'member' && !isSignup && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mb-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-900/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Zap size={11} className="text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">Demo Credentials</span>
                <span className="ml-auto text-[10px] text-emerald-500 dark:text-emerald-400">6 demo members · same password</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-emerald-100 dark:border-emerald-800/40">
                  <p className="text-[10px] font-semibold text-emerald-400 dark:text-emerald-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 break-all">sarah.chen@taskverse.app</p>
                </div>
                <div className="bg-white dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-emerald-100 dark:border-emerald-800/40">
                  <p className="text-[10px] font-semibold text-emerald-400 dark:text-emerald-500 uppercase tracking-wider mb-0.5">Password</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">TaskVerse@2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginForm.setValue('email', 'sarah.chen@taskverse.app')
                  loginForm.setValue('password', 'TaskVerse@2026')
                  loginForm.clearErrors()
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900/60 border border-emerald-200 dark:border-emerald-700/60 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all"
              >
                <ArrowRight size={11} />
                One-click fill
              </button>
            </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-black/40 p-8">
            <AnimatePresence mode="wait">
              {!isSignup ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.22 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="you@example.com"
                      {...loginForm.register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={`${inputCls} pr-11`}
                        placeholder="Enter your password"
                        {...loginForm.register('password', { required: 'Password is required' })}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-brand disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:opacity-90"
                  >
                    {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={15} /></>}
                  </motion.button>
                  {activeTab === 'member' && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-1">
                      No account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Sign up free
                      </button>
                    </p>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  onSubmit={signupForm.handleSubmit(onSignup)}
                  className="space-y-5"
                >
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose your avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATARS.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setSelectedAvatar(url)}
                          className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all duration-150 ${
                            selectedAvatar === url
                              ? 'border-indigo-500 ring-2 ring-indigo-400/50 scale-105'
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <img src={url} alt="avatar option" className="w-full h-full object-cover bg-indigo-50 dark:bg-indigo-900/30" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Jane Doe"
                      {...signupForm.register('name', {
                        required: 'Name is required',
                        validate: v => v.trim().length >= 2 || 'Min 2 characters',
                      })}
                    />
                    {signupForm.formState.errors.name && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {signupForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email with live availability check */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      className={`${inputCls} ${
                        emailStatus === 'available' ? 'border-green-400 dark:border-green-600 focus:ring-green-400' :
                        emailStatus === 'taken'     ? 'border-red-400 dark:border-red-600 focus:ring-red-400' : ''
                      }`}
                      placeholder="you@example.com"
                      {...signupForm.register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                    {signupForm.formState.errors.email ? (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {signupForm.formState.errors.email.message}
                      </p>
                    ) : emailIndicator()}
                  </div>

                  {/* Password with strength meter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={`${inputCls} pr-11`}
                        placeholder="Create a strong password"
                        {...signupForm.register('password', {
                          required: 'Password is required',
                          validate: p =>
                            PASSWORD_RULES.every(r => r.test(p)) ||
                            'Password does not meet all requirements',
                          onChange: () => {
                            if (sConfirm) signupForm.trigger('confirmPassword')
                          },
                        })}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={passwordLive} />
                    {signupForm.formState.errors.password && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password with live match indicator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={`${inputCls} pr-11`}
                        placeholder="Re-enter your password"
                        {...signupForm.register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: v =>
                            v === signupForm.getValues('password') || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {sConfirm && (
                      <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                        passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                    {signupForm.formState.errors.confirmPassword && !sConfirm && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {signupForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={canSubmit ? { scale: 1.01 } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full gradient-brand disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:opacity-90"
                  >
                    {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={15} /></>}
                  </motion.button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-14">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.25), transparent)' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-600/25 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow">
                {activeTab === 'admin'
                  ? <ShieldCheck size={36} className="text-white" />
                  : <Zap size={36} className="text-white" />}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                {activeTab === 'admin'
                  ? <>Powerful Admin<br />Controls</>
                  : <>Ship projects<br />faster than ever</>}
              </h2>
              <p className="text-white/60 text-base mb-10 leading-relaxed">
                {activeTab === 'admin'
                  ? 'Full visibility across all teams, projects, and user permissions.'
                  : 'Manage your team, track every task, and hit every deadline — all in one place.'}
              </p>
              <div className="space-y-3 text-left">
                {perks.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                    <Icon size={15} className="text-indigo-300 flex-shrink-0" />
                    <span className="text-white/75 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
