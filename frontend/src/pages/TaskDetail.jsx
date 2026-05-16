import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getTask, updateTask, deleteTask, updateTaskStatus } from '../api/tasks.api'
import { getProject } from '../api/projects.api'
import useAuthStore from '../store/authStore'
import { StatusBadge, PriorityBadge } from '../components/Badge'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import Spinner from '../components/Spinner'
import { formatDate } from '../utils/formatDate'
import Avatar from '../components/Avatar'
import { toast } from 'sonner'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [task, setTask] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const load = () => {
    setLoading(true)
    getTask(id)
      .then(async (res) => {
        const t = res.data
        setTask(t)
        if (t.projectId) {
          const proj = await getProject(t.projectId).catch(() => null)
          setMembers(proj?.data?.members || [])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  if (loading) return <Spinner />
  if (!task) return <p className="p-8 text-gray-500 dark:text-gray-400">Task not found.</p>

  const isAssignee = task.assignees?.some(a => a.id === user?.id) ?? false

  const handleEdit = async (data) => {
    setSaving(true)
    try {
      await updateTask(id, { ...data, projectId: task.projectId })
      setEditModal(false)
      toast.success('Task updated successfully!')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(id)
      toast.success('Task deleted.')
      navigate(task.projectId ? `/projects/${task.projectId}` : '/projects')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete task.')
    }
  }

  const handleStatusChange = async (status) => {
    setStatusUpdating(true)
    try {
      await updateTaskStatus(id, status)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const defaultValues = {
    title: task.title,
    description: task.description || '',
    assigneeIds: task.assignees?.map(a => a.id) || [],
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="max-w-3xl">
        <Link
          to={task.projectId ? `/projects/${task.projectId}` : '/projects'}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6"
        >
          <ArrowLeft size={15} /> Back to Project
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{task.title}</h1>
            {isAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Assignees</p>
              {task.assignees?.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {task.assignees.map(a => (
                    <div key={a.id} className="flex items-center gap-2">
                      <Avatar src={a.avatar} name={a.name} size="sm" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{a.name || a.email}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(task.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Project</p>
              {task.project ? (
                <Link to={`/projects/${task.projectId}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  {task.project.name}
                </Link>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>
          </div>

          {!isAdmin && isAssignee && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status</p>
              <select
                value={task.status}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-60"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          )}
        </motion.div>
      </div>

      {editModal && (
        <Modal title="Edit Task" onClose={() => setEditModal(false)}>
          <TaskForm defaultValues={defaultValues} members={members} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Task" onClose={() => setDeleteConfirm(false)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{task.title}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
