const statusClasses = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-emerald-100 text-emerald-700',
}

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const priorityClasses = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {statusLabels[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        priorityClasses[priority] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {priority ? priority.charAt(0) + priority.slice(1).toLowerCase() : '—'}
    </span>
  )
}

export function RoleBadge({ role }) {
  const cls =
    role === 'ADMIN'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {role}
    </span>
  )
}
