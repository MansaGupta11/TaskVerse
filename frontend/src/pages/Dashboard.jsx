import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { FolderKanban, CheckSquare, Clock, AlertTriangle, CheckCircle2, Users, ArrowRight, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { getDashboardStats } from '../api/dashboard.api'
import { updateTaskStatus } from '../api/tasks.api'
import { StatusBadge, PriorityBadge } from '../components/Badge'
import Spinner from '../components/Spinner'
import { formatDate } from '../utils/formatDate'
import { isOverdue } from '../utils/isOverdue'
import useAuthStore from '../store/authStore'
import Avatar from '../components/Avatar'
import { toast } from 'sonner'

const tabs = ['All', 'In Progress', 'Overdue']

const statusSelectClasses = {
  TODO: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  DONE: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const CARD_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-violet-500 to-purple-700',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
]

function ProjectCard3D({ project, index }) {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12])
  const [hovered, setHovered] = useState(false)

  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setHovered(false)
  }

  return (
    <motion.div variants={fadeUp}>
      <div
        ref={cardRef}
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer h-56"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', height: '100%' }}
          className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg dark:shadow-black/30"
        >
          {/* Gradient header bar */}
          <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${grad}`} />

          {/* Shine layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

          {/* Static card content */}
          <div className="relative z-20 p-5 h-full flex flex-col">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                <FolderKanban size={20} className="text-white" />
              </div>
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg border border-white/10">
                {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-auto">
              <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{project.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Users size={12} className="text-gray-400 dark:text-gray-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 3D hover overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`absolute inset-0 z-30 bg-gradient-to-br ${grad} flex flex-col justify-between p-5`}
              >
                <div>
                  <h3 className="font-bold text-white text-base mb-1.5">{project.name}</h3>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {(project.members || []).length > 0 && (
                    <>
                      <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-2">Team</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(project.members || []).slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5"
                          >
                            <div className="w-4 h-4 bg-white/40 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                              {m.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-white/90 text-xs truncate max-w-[80px]">{m.name}</span>
                          </div>
                        ))}
                        {(project.members || []).length > 4 && (
                          <div className="bg-white/10 border border-white/15 rounded-full px-2 py-0.5 text-white/60 text-xs">
                            +{project.members.length - 4} more
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">
                      {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Open <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

function AdminAnalytics({ stats }) {
  const statusDist = stats?.statusDistribution || {}
  const priorityDist = stats?.priorityDistribution || {}

  const statusTotal = (statusDist.TODO || 0) + (statusDist.IN_PROGRESS || 0) + (statusDist.DONE || 0)
  const priorityTotal = (priorityDist.LOW || 0) + (priorityDist.MEDIUM || 0) + (priorityDist.HIGH || 0)

  const pct = (val, total) => (total === 0 ? 0 : Math.round((val / total) * 100))

  const r = 54
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * r

  const statusSegments = [
    { key: 'TODO', label: 'To Do', value: statusDist.TODO || 0, stroke: '#9ca3af' },
    { key: 'IN_PROGRESS', label: 'In Progress', value: statusDist.IN_PROGRESS || 0, stroke: '#3b82f6' },
    { key: 'DONE', label: 'Done', value: statusDist.DONE || 0, stroke: '#10b981' },
  ]

  const priorityBars = [
    { key: 'LOW', label: 'Low', value: priorityDist.LOW || 0, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'MEDIUM', label: 'Medium', value: priorityDist.MEDIUM || 0, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { key: 'HIGH', label: 'High', value: priorityDist.HIGH || 0, color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  ]

  let cumulativeAngle = -90
  const donutSegments = statusSegments.map((seg) => {
    const segAngle = statusTotal === 0 ? 0 : (seg.value / statusTotal) * 360
    const rotation = cumulativeAngle
    cumulativeAngle += segAngle
    return { ...seg, dash: (seg.value / (statusTotal || 1)) * circumference, rotation }
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Analytics</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution — Donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Task Status Distribution</p>
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0 w-[140px] h-[140px]">
              <svg width="140" height="140" viewBox="0 0 140 140">
                {statusTotal === 0 ? (
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="18" />
                ) : (
                  donutSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={seg.stroke}
                      strokeWidth="18"
                      strokeDasharray={`${seg.dash} ${circumference}`}
                      style={{ transform: `rotate(${seg.rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}
                    />
                  ))
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{statusTotal}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">tasks</span>
              </div>
            </div>
            <div className="flex flex-col gap-3.5 flex-1">
              {statusSegments.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.stroke }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{seg.value}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">{pct(seg.value, statusTotal)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution — Horizontal bars */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Task Priority Distribution</p>
          <div className="flex flex-col gap-6">
            {priorityBars.map((bar) => (
              <div key={bar.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${bar.text}`}>{bar.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bar.value}
                    <span className="text-gray-400 dark:text-gray-500 ml-1">({pct(bar.value, priorityTotal)}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${bar.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct(bar.value, priorityTotal)}%` }}
                    transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
            {priorityTotal === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No tasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function ProjectTracking({ breakdown }) {
  const projects = breakdown || []

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Project Tracking</h2>
      </div>
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-10 text-center">
          <Activity size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">No projects found.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={fadeUp}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                    <FolderKanban size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {project.total ?? 0} task{(project.total ?? 0) !== 1 ? 's' : ''} total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{project.todo ?? 0} to do</span>
                  <span className="text-blue-600 dark:text-blue-400">{project.inProgress ?? 0} in progress</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{project.done ?? 0} done</span>
                  {(project.overdue ?? 0) > 0 && (
                    <span className="text-red-600 dark:text-red-400">{project.overdue} overdue</span>
                  )}
                </div>
              </div>

              {(() => {
                const _total = project.total ?? 0
                const _done = project.done ?? 0
                const _pct = _total === 0 ? 0 : Math.round((_done / _total) * 100)
                return (
                  <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Completion</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{_pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${_pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })()}
              {(project.members || []).length === 0 && !project.unassigned ? (
                <div className="px-6 py-8 text-center">
                  <Users size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">No members assigned.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-6 py-2.5 font-medium text-gray-400 dark:text-gray-500">Member</th>
                        <th className="text-center px-4 py-2.5 font-medium text-gray-400 dark:text-gray-500">Total</th>
                        <th className="text-center px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">To Do</th>
                        <th className="text-center px-4 py-2.5 font-medium text-blue-500 dark:text-blue-400">In Progress</th>
                        <th className="text-center px-4 py-2.5 font-medium text-emerald-500 dark:text-emerald-400">Done</th>
                        <th className="text-center px-4 py-2.5 font-medium text-red-500 dark:text-red-400">Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.members || []).map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={member.avatar} name={member.name} size="sm" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                                <p className="text-gray-400 dark:text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{member.total ?? 0}</td>
                          <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{member.todo ?? 0}</td>
                          <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">{member.inProgress ?? 0}</td>
                          <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">{member.done ?? 0}</td>
                          <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">{member.overdue ?? 0}</td>
                        </tr>
                      ))}
                      {project.unassigned && (
                        <tr className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                                <Users size={12} className="text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="font-medium text-gray-500 dark:text-gray-400 italic">Unassigned</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">{project.unassigned.total ?? 0}</td>
                          <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{project.unassigned.todo ?? 0}</td>
                          <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">{project.unassigned.inProgress ?? 0}</td>
                          <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">{project.unassigned.done ?? 0}</td>
                          <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">{project.unassigned.overdue ?? 0}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatusChange = async (taskId, status) => {
    setUpdatingId(taskId)
    try {
      await updateTaskStatus(taskId, status)
      const res = await getDashboardStats()
      setStats(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update task status.')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const myTasks = stats?.myTasks || []
  const recentProjects = stats?.recentProjects || []

  const filteredTasks = myTasks.filter((t) => {
    if (activeTab === 'In Progress') return t.status === 'IN_PROGRESS'
    if (activeTab === 'Overdue') return isOverdue(t)
    return true
  })

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: <FolderKanban size={20} className="text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks ?? 0,
      icon: <CheckSquare size={20} className="text-violet-600 dark:text-violet-400" />,
      bg: 'bg-violet-50 dark:bg-violet-900/30',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks ?? 0,
      icon: <Clock size={20} className="text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks ?? 0,
      icon: <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />,
      bg: 'bg-red-50 dark:bg-red-900/30',
      danger: (stats?.overdueTasks ?? 0) > 0,
    },
    {
      label: 'Done',
      value: stats?.doneTasks ?? 0,
      icon: <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
  ]

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={user?.name} size="xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here&apos;s what&apos;s happening.</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-5 cursor-default ${
              s.danger
                ? 'border-red-200 dark:border-red-800'
                : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-bold ${s.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 3D Project Cards */}
      {recentProjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Projects</h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {recentProjects.map((p, i) => (
              <ProjectCard3D key={p.id} project={p} index={i} />
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Admin: Analytics */}
      {isAdmin && <AdminAnalytics stats={stats} />}

      {/* Admin: Project Tracking */}
      {isAdmin && <ProjectTracking breakdown={stats?.projectBreakdown} />}

      {/* Member: My Tasks */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">My Tasks</h2>
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    activeTab === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">No tasks found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-6 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium">Project</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Priority</th>
                    <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                        isOverdue(task) ? 'bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-3">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {task.project?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <StatusBadge status={task.status} />
                        ) : (
                          <select
                            value={task.status}
                            disabled={updatingId === task.id}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 ${statusSelectClasses[task.status] || statusSelectClasses.TODO}`}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
