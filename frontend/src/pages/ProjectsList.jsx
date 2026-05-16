import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  FolderKanban,
  Search,
  Users,
  CheckSquare,
  Trash2,
  Calendar,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProjects, createProject, deleteProject } from '../api/projects.api'
import useAuthStore from '../store/authStore'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import Avatar from '../components/Avatar'
import { toast } from 'sonner'

const PROJECT_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-indigo-600',
]

function colorFor(id) {
  const n = (id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return PROJECT_GRADIENTS[n % PROJECT_GRADIENTS.length]
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-20" />
          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
}

export default function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const load = () => {
    setLoading(true)
    getProjects()
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (data) => {
    setSaving(true)
    try {
      await createProject(data)
      setShowModal(false)
      toast.success('Project created successfully!')
      load()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      toast.success('Project deleted.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete project.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.owner?.name || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace`}
          </p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            New Project
          </motion.button>
        )}
      </motion.div>

      {/* Search */}
      {!loading && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-gray-400"
          />
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban size={28} className="text-indigo-400 dark:text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {search ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
            {search
              ? 'Try a different search term.'
              : isAdmin
              ? 'Create your first project to get started.'
              : "You haven't been added to any projects yet."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => {
              const gradient = colorFor(p.id)
              const initials = (p.name || '??').slice(0, 2).toUpperCase()
              const createdAt = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : null

              return (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  layout
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-gray-950/60 transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Top accent bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} flex-shrink-0`} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Card header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
                      >
                        <span className="text-white text-xs font-bold tracking-wide">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
                          {p.name}
                        </h3>
                        {p.owner && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Avatar name={p.owner.name || p.owner.email} size="sm" className="!w-4 !h-4 !text-[9px]" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {p.owner.name || p.owner.email}
                            </span>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition disabled:opacity-30"
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    {p.description ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {p.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300 dark:text-gray-600 italic mb-4">No description</p>
                    )}

                    {/* Stats chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg px-2 py-1">
                        <Users size={11} className="text-gray-400" />
                        {p.memberCount ?? 0} member{(p.memberCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg px-2 py-1">
                        <CheckSquare size={11} className="text-gray-400" />
                        {p.taskCount ?? 0} task{(p.taskCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                      {createdAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          <Calendar size={10} />
                          {createdAt}
                        </span>
                      )}
                    </div>

                    {/* Footer link */}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                      <Link
                        to={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition group/link"
                      >
                        Open Project
                        <span className="inline-block translate-x-0 group-hover/link:translate-x-0.5 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <ProjectForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
