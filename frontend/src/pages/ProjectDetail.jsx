import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Trash2, Pencil, UserPlus, UserMinus } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../api/projects.api'
import { createTask, updateTask, deleteTask, updateTaskStatus } from '../api/tasks.api'
import { getUsers } from '../api/users.api'
import useAuthStore from '../store/authStore'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import ProjectForm from '../components/ProjectForm'
import { StatusBadge, PriorityBadge } from '../components/Badge'
import Spinner from '../components/Spinner'
import { formatDate } from '../utils/formatDate'
import Avatar from '../components/Avatar'
import { isOverdue } from '../utils/isOverdue'
import { toast } from 'sonner'

const STATUS_OPTIONS = ['All', 'TODO', 'IN_PROGRESS', 'DONE']
const PRIORITY_OPTIONS = ['All', 'LOW', 'MEDIUM', 'HIGH']

const selectCls = 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Tasks')

  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')

  const [taskModal, setTaskModal] = useState(null)
  const [editProjectModal, setEditProjectModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [taskDeleteId, setTaskDeleteId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [adding, setAdding] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getProject(id)
      .then((res) => setProject(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (isAdmin) {
      getUsers().then((res) => setAllUsers(res.data)).catch(console.error)
    }
  }, [id])

  if (loading) return <Spinner />
  if (!project) return <p className="p-8 text-gray-500 dark:text-gray-400">Project not found.</p>

  const members = project.members || []
  const tasks = project.tasks || []

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false
    if (assigneeFilter !== 'All' && !t.assignees?.some(a => a.id === assigneeFilter)) return false
    return true
  })

  const handleTaskSubmit = async (data) => {
    setSaving(true)
    const isCreate = taskModal === 'create'
    try {
      const payload = { ...data, projectId: id }
      if (isCreate) {
        await createTask(payload)
      } else {
        await updateTask(taskModal.id, data)
      }
      setTaskModal(null)
      toast.success(isCreate ? 'Task created successfully!' : 'Task updated successfully!')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTaskDeleteId(null)
      toast.success('Task deleted.')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete task.')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update task status.')
    }
  }

  const handleEditProject = async (data) => {
    setSaving(true)
    try {
      await updateProject(id, data)
      setEditProjectModal(false)
      toast.success('Project updated successfully!')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      await deleteProject(id)
      toast.success('Project deleted.')
      navigate('/projects')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete project.')
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId || adding) return
    setAdding(true)
    try {
      await addMember(id, selectedUserId)
      setSelectedUserId('')
      toast.success('Member added to project.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId)
      toast.success('Member removed from project.')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove member.')
    }
  }

  const taskModalDefault =
    taskModal && taskModal !== 'create'
      ? {
          title: taskModal.title,
          description: taskModal.description,
          assigneeIds: taskModal.assignees?.map(a => a.id) || [],
          status: taskModal.status,
          priority: taskModal.priority,
          dueDate: taskModal.dueDate ? taskModal.dueDate.slice(0, 10) : '',
        }
      : {}

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Owner: {project.owner?.name || project.owner?.email || '—'} · {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditProjectModal(true)}
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
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
        {['Tasks', 'Members'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'Tasks' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s === 'IN_PROGRESS' ? 'In Progress' : s === 'TODO' ? 'To Do' : 'Done'}
                </option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectCls}>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={selectCls}>
              <option value="All">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name || m.email}</option>
              ))}
            </select>
            <div className="ml-auto">
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTaskModal('create')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  <Plus size={15} /> Add Task
                </motion.button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No tasks match your filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-5 py-3 font-medium">Title</th>
                      <th className="text-left px-4 py-3 font-medium">Assignee</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Priority</th>
                      <th className="text-left px-4 py-3 font-medium">Due Date</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => {
                      const overdue = isOverdue(task)
                      const isAssignee = task.assignees?.some(a => a.id === user?.id) ?? false
                      return (
                        <tr
                          key={task.id}
                          className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                            overdue ? 'bg-red-50 dark:bg-red-900/10' : ''
                          }`}
                        >
                          <td className="px-5 py-3">
                            <Link to={`/tasks/${task.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                              {task.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {task.assignees?.length > 0 ? task.assignees.map(a => a.name || a.email).join(', ') : '—'}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                          <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(task.dueDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isAdmin && (
                                <>
                                  <button onClick={() => setTaskModal(task)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => setTaskDeleteId(task.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition">
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                              {!isAdmin && isAssignee && (
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="TODO">To Do</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="DONE">Done</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'Members' && (
        <div>
          {isAdmin && (
            <div className="flex gap-3 mb-6 flex-wrap">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition flex-1 max-w-xs"
              >
                <option value="">Select a user to add…</option>
                {allUsers
                  .filter(u => !members.some(m => m.id === (u.id || u._id?.toString())))
                  .map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name ? `${u.name} (${u.email})` : u.email} — {u.role}
                    </option>
                  ))
                }
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || adding}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                <UserPlus size={15} /> Add Member
              </button>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No members yet.</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name || '—'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ m.role === 'ADMIN' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }`}>
                      {m.role}
                    </span>
                    {isAdmin && m.id !== user?.id && (
                      <button onClick={() => handleRemoveMember(m.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition">
                        <UserMinus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {taskModal && (
        <Modal title={taskModal === 'create' ? 'Add Task' : 'Edit Task'} onClose={() => setTaskModal(null)}>
          <TaskForm defaultValues={taskModalDefault} members={members} onSubmit={handleTaskSubmit} loading={saving} />
        </Modal>
      )}

      {editProjectModal && (
        <Modal title="Edit Project" onClose={() => setEditProjectModal(false)}>
          <ProjectForm defaultValues={{ name: project.name, description: project.description, memberIds: members.map(m => m.id) }} onSubmit={handleEditProject} loading={saving} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Project" onClose={() => setDeleteConfirm(false)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{project.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
            <button onClick={handleDeleteProject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition">Delete</button>
          </div>
        </Modal>
      )}

      {taskDeleteId && (
        <Modal title="Delete Task" onClose={() => setTaskDeleteId(null)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this task? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setTaskDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
            <button onClick={() => handleDeleteTask(taskDeleteId)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
