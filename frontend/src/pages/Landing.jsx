import { Link, Navigate } from 'react-router-dom'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  ArrowRight, ShieldCheck, ClipboardList, Users,
  BarChart3, Bell, Lock, CheckCircle, Star,
  Layers, Globe, Target, Activity, TrendingUp,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'
import { LogoMark } from '../components/Logo'

// ─── animation variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

// ─── data ──────────────────────────────────────────────────────────────────
const marqueeItems = [
  { icon: CheckCircle, label: 'Task Tracking' },
  { icon: Users,       label: 'Team Collaboration' },
  { icon: ShieldCheck, label: 'Role-Based Access' },
  { icon: BarChart3,   label: 'Live Dashboards' },
  { icon: Bell,        label: 'Smart Notifications' },
  { icon: Lock,        label: 'Secure by Default' },
  { icon: Globe,       label: 'Works Everywhere' },
  { icon: TrendingUp,  label: 'Boost Velocity' },
]

const stats = [
  { end: 10,  suffix: 'x',  label: 'Faster Delivery' },
  { end: 99,  suffix: '%',  label: 'Uptime SLA' },
  { end: 500, suffix: '+',  label: 'Teams Onboarded' },
  { end: 3,   suffix: 'min',label: 'To First Project' },
]

const features = [
  {
    icon: ClipboardList,
    title: 'Task Management',
    description: 'Create, prioritize, and assign tasks with due dates. Track progress with real-time status updates across the board.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Admins and members get tailored views. Keep sensitive projects locked to the right people.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Team Workspaces',
    description: 'Invite your whole team in seconds. Shared project spaces with full history.',
    color: 'from-sky-500 to-indigo-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visual breakdowns of velocity, completion rates, and member contributions.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss a deadline. Get notified on task assignment, updates, and approaching due dates.',
    color: 'from-orange-500 to-rose-500',
  },
  {
    icon: Activity,
    title: 'Live Activity Feed',
    description: 'See every action as it happens. Full audit trail across all projects.',
    color: 'from-pink-500 to-rose-500',
  },
]

const steps = [
  { num: '01', icon: Layers,  title: 'Create a Project', desc: 'Set up your workspace and define project scope in under a minute.' },
  { num: '02', icon: Users,   title: 'Invite Your Team', desc: 'Add team members and assign admin or member roles instantly.' },
  { num: '03', icon: Target,  title: 'Track & Ship', desc: 'Assign tasks, set deadlines, and watch your team hit every goal.' },
]

// ─── CountUp component ─────────────────────────────────────────────────────
function CountUp({ end, suffix, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <p className="text-4xl sm:text-5xl font-extrabold text-gradient mb-2">
        {display}{suffix}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    </motion.div>
  )
}

// ─── SpotlightCard ─────────────────────────────────────────────────────────
function SpotlightCard({ feature, index }) {
  const cardRef = useRef(null)
  const Icon = feature.icon

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--x', `${x}px`)
    cardRef.current.style.setProperty('--y', `${y}px`)
  }

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      onMouseMove={handleMouseMove}
      className="spotlight-hover relative group h-full rounded-2xl p-6 glass-card shadow-sm
        hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300"
    >
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={32} className="shadow-md shadow-indigo-500/30" />
          <span className={`text-lg font-bold transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            TaskVerse
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              scrolled
                ? 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/30"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col overflow-x-hidden">
      <Navbar scrolled={scrolled} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden aurora-bg">
        {/* animated grid overlay */}
        <div className="absolute inset-0 grid-overlay animate-grid-fade pointer-events-none" />

        {/* radial vignette */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%)' }}
        />

        {/* floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
          >
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            Team Productivity Platform — Now in 2026
          </motion.div>

          {/* headline — staggered */}
          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white"
            >
              Manage Projects.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white"
            >
              Assign Tasks.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight shimmer-text"
            >
              Ship Faster.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            One platform for teams to create projects, assign work, track every task,
            and ship with confidence — backed by role-based access and real-time dashboards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-16"
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition text-sm shadow-2xl shadow-black/30"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white/90 font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition text-sm backdrop-blur-sm"
            >
              Sign In
            </Link>
          </motion.div>

          {/* floating product mock card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-2xl mx-auto animate-float"
            style={{ animationDelay: '2s', animationDuration: '8s' }}
          >
            <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/40 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-white/50 font-mono">TaskVerse Dashboard</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Q3 Product Launch', status: 'In Progress', color: 'bg-indigo-500', pct: 68 },
                  { label: 'API Integration',   status: 'Review',      color: 'bg-violet-500', pct: 90 },
                  { label: 'Design System',     status: 'Done',        color: 'bg-emerald-500', pct: 100 },
                ].map((task) => (
                  <div key={task.label} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <div className={`w-2 h-2 rounded-full ${task.color} flex-shrink-0`} />
                    <span className="text-sm text-white/80 flex-1">{task.label}</span>
                    <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{task.status}</span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${task.color} rounded-full`} style={{ width: `${task.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <section className="bg-gray-900 dark:bg-gray-950 border-y border-gray-800 py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...marqueeItems, ...marqueeItems].map((item, i) => {
            const Icon = item.icon
            return (
              <span key={i} className="inline-flex items-center gap-2.5 text-gray-400 text-sm font-medium mr-12 flex-shrink-0">
                <Icon size={15} className="text-indigo-400" />
                {item.label}
                <span className="ml-10 text-gray-700">·</span>
              </span>
            )
          })}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white dark:bg-gray-950 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((s) => (
            <CountUp key={s.label} end={s.end} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── Features Bento ── */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything your team needs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for speed, clarity, and collaboration — from solo founders to enterprise teams.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {features.map((f, i) => (
              <SpotlightCard key={f.title} feature={f} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="bg-white dark:bg-gray-950 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Three steps to transform how your team works.</p>
          </motion.div>

          <div className="relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.75rem)] right-[calc(16.67%+1.75rem)] h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent" />

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10"
            >
              {steps.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div key={s.num} variants={fadeUp} className="text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mx-auto animate-glow">
                        <Icon size={28} className="text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-90" />
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.3), transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <span className="inline-block text-xs font-semibold text-indigo-200 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
            Start Today
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to ship<br />
            <span className="shimmer-text">faster than ever?</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Join hundreds of teams already managing projects and smashing deadlines with TaskVerse.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition text-sm shadow-2xl shadow-black/30"
            >
              Start for Free <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition text-sm backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 pt-14 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <LogoMark size={32} className="shadow-md shadow-indigo-500/30" />
                <span className="text-white font-bold text-lg">TaskVerse</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                The modern team task manager. Built for speed and clarity.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/signup" className="hover:text-indigo-400 transition">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
                <li><span className="text-gray-600">Features</span></li>
                <li><span className="text-gray-600">Pricing</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Use Cases</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-gray-600">Project Management</span></li>
                <li><span className="text-gray-600">Agile Teams</span></li>
                <li><span className="text-gray-600">Remote Work</span></li>
                <li><span className="text-gray-600">Enterprise</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Tech Stack</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-gray-600">React 18</span></li>
                <li><span className="text-gray-600">Node.js</span></li>
                <li><span className="text-gray-600">MongoDB</span></li>
                <li><span className="text-gray-600">TailwindCSS</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>© 2026 TaskVerse. All rights reserved.</span>
            <span>Built with React &amp; Node.js</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
