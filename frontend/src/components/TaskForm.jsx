import { useState } from 'react'
import { useForm } from 'react-hook-form'
import MentionPicker from './MentionPicker'

const inputCls =
  'w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition'

export default function TaskForm({ defaultValues, members = [], onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      ...defaultValues,
    },
  })

  const [assigneeIds, setAssigneeIds] = useState(
    defaultValues?.assigneeIds ??
      (defaultValues?.assigneeId ? [defaultValues.assigneeId] : [])
  )

  const submit = (data) => {
    onSubmit({ ...data, assigneeIds })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          className={inputCls}
          placeholder="Task title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="Task details…"
          {...register('description')}
        />
      </div>

      <MentionPicker
        users={members}
        value={assigneeIds}
        onChange={setAssigneeIds}
        label="Assign To"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select className={inputCls} {...register('status')}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select className={inputCls} {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input type="date" className={inputCls} {...register('dueDate')} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          {loading ? 'Saving…' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}
