import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getUsers } from '../api/users.api'
import MentionPicker from './MentionPicker'

const inputCls =
  'w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition'

export default function ProjectForm({ defaultValues, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues })

  const [users, setUsers] = useState([])
  const [memberIds, setMemberIds] = useState(defaultValues?.memberIds ?? [])

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => {})
  }, [])

  const submit = (data) => {
    onSubmit({ ...data, memberIds })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          className={inputCls}
          placeholder="My awesome project"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Min 2 characters' },
          })}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="What is this project about?"
          {...register('description')}
        />
      </div>

      <MentionPicker
        users={users}
        value={memberIds}
        onChange={setMemberIds}
        label="Add Members"
      />

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          {loading ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </form>
  )
}
