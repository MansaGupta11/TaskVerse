import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff, Users, CheckCircle, TrendingUp } from 'lucide-react'
import { register as registerApi } from '../api/auth.api'
import useAuthStore from '../store/authStore'
import { LogoMark } from '../components/Logo'
import { toast } from 'sonner'

const inputCls =
  'w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400 dark:placeholder-gray-500'

const perks = [
  { icon: Users,       label: 'Invite your whole team instantly' },
  { icon: CheckCircle, label: 'Assign roles — admin or member' },
  { icon: TrendingUp,  label: 'Track velocity & hit deadlines' },
]

const PASSWORD_RULES = [
  { id: 'len',     label: '8–15 characters',              test: p => p.length >= 8 && p.length <= 15 },
  { id: 'upper',   label: 'At least 2 uppercase letters', test: p => (p.match(/[A-Z]/g) || []).length >= 2 },
  { id: 'lower',   label: 'At least 1 lowercase letter',  test: p => /[a-z]/.test(p) },
  { id: 'digit',   label: 'At least 1 number (0–9)',      test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'At least 1 special character', test: p => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'nospace', label: 'No spaces allowed',            test: p => !/\s/.test(p) },
]

const STRENGTH_META = [
  { label: '',            barColor: '',              textColor: '' },
  { label: 'Very Weak',  barColor: 'bg-red-500',    textColor: 'text-red-500 dark:text-red-400' },
  { label: 'Weak',       barColor: 'bg-orange-500', textColor: 'text-orange-500 dark:text-orange-400' },
  { label: 'Fair',       barColor: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
  { label: 'Good',       barColor: 'bg-blue-500',   textColor: 'text-blue-500 dark:text-blue-400' },
  { label: 'Strong',     barColor: 'bg-teal-500',   textColor: 'text-teal-500 dark:text-teal-400' },
  { label: 'Very Strong',barColor: 'bg-green-500',  textColor: 'text-green-600 dark:text-green-400' },
]

function PasswordStrengthMeter({ password }) {
  if (!password) return null
  const score = PASSWORD_RULES.filter(r => r.test(password)).length
  const meta = STRENGTH_META[score] ?? STRENGTH_META[0]

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

export default function Signup() {
  const [loading, setLoading]       = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm()
  const passwordLive = watch('password', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await registerApi({ name: data.name, email: data.email, password: data.password })
      const { token, user } = res.data
      login(user, token)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-14">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.25), transparent)' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-indigo-600/25 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3.5s' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow">
            <Users size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Built for<br />modern teams
          </h2>
          <p className="text-white/60 text-base mb-10 leading-relaxed">
            Invite your team, assign tasks with roles, and start shipping projects in minutes.
          </p>
          <div className="space-y-3 text-left">
            {perks.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <Icon size={15} className="text-violet-300 flex-shrink-0" />
                <span className="text-white/75 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form panel */}
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

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
            Join your team on TaskVerse today
          </p>


          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-black/40 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  className={inputCls}
                  placeholder="Jane Doe"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Min 2 characters' },
                  })}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`${inputCls} pr-11`}
                    placeholder="Create a strong password"
                    {...register('password', {
                      required: 'Password is required',
                      validate: p =>
                        PASSWORD_RULES.every(r => r.test(p)) ||
                        'Password does not meet all requirements above',
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`${inputCls} pr-11`}
                    placeholder="Re-enter your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: v => v === getValues('password') || 'Passwords do not match',
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
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full gradient-brand disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:opacity-90"
              >
                {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight size={15} /></>}
              </motion.button>
            </form>
          </div>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
