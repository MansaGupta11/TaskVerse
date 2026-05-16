import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, UserRound, Search, AlertTriangle } from 'lucide-react'
import { getUsers, deleteUser } from '../api/users.api'
import { RoleBadge } from '../components/Badge'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { formatDate } from '../utils/formatDate'
import useAuthStore from '../store/authStore'
import Avatar from '../components/Avatar'
import { toast } from 'sonner'

export default function UsersAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null) // full user object
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const { user: currentUser } = useAuthStore()

  const load = () => {
    setLoading(true)
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const uid = deleteTarget.id || deleteTarget._id
    setDeleting(true)
    try {
      await deleteUser(uid)
      setDeleteTarget(null)
      toast.success(`${deleteTarget.name || deleteTarget.email} has been deleted.`)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete user.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  if (loading) return <Spinner />

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {users.length} {users.length === 1 ? 'user' : 'users'} in total
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <UserRound size={36} strokeWidth={1.2} />
            <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3.5 font-medium">User</th>
                  <th className="text-left px-4 py-3.5 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3.5 font-medium">Role</th>
                  <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right px-6 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((u, idx) => {
                  const uid = u.id || u._id
                  const isSelf = uid === (currentUser?.id || currentUser?._id)

                  return (
                    <motion.tr
                      key={uid}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name} size="md" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white leading-tight">
                              {u.name || '—'}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] font-medium text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 md:hidden mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-4 text-gray-400 dark:text-gray-500 text-xs hidden lg:table-cell">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className="text-xs text-gray-300 dark:text-gray-600 italic">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(u)}
                              title="Delete user"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-all"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Delete User" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Delete {deleteTarget.name || deleteTarget.email}?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                This will remove their account, unassign all tasks, and delete any projects they own. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
            <Avatar src={deleteTarget.avatar} name={deleteTarget.name} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{deleteTarget.name}</p>
              <p className="text-xs text-gray-400">{deleteTarget.email}</p>
            </div>
            <RoleBadge role={deleteTarget.role} />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={!deleting ? { scale: 1.02 } : {}}
              whileTap={!deleting ? { scale: 0.97 } : {}}
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting…' : 'Yes, Delete User'}
            </motion.button>
          </div>
        </Modal>
      )}
    </div>
  )
}
