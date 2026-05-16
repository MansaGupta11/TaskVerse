import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getUsers, updateUserRole, deleteUser } from '../api/users.api'
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
  const [deleteId, setDeleteId] = useState(null)
  const { user: currentUser } = useAuthStore()

  const load = () => {
    setLoading(true)
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    try {
      await updateUserRole(u.id, newRole)
      toast.success('User role updated.')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update user role.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId)
      setDeleteId(null)
      toast.success('User deleted.')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete user.')
    }
  }

  const deleteTarget = users.find((u) => u.id === deleteId)

  if (loading) return <Spinner />

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all team members and their roles</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {users.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name} size="md" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {u.name || '\u2014'}
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">(you)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Make {u.role === 'ADMIN' ? 'Member' : 'Admin'}
                            </button>
                            <button
                              onClick={() => setDeleteId(u.id)}
                              className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {deleteId && (
        <Modal title="Delete User" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900 dark:text-white">{deleteTarget?.name || deleteTarget?.email}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
