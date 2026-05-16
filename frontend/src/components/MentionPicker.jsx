import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import Avatar from './Avatar'

export default function MentionPicker({ users = [], value = [], onChange, label = 'Members' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const getId = (u) => u.id || u._id

  const selected = users.filter((u) => value.includes(getId(u)))
  const filtered = users.filter((u) => {
    if (value.includes(getId(u))) return false
    const q = query.replace(/^@/, '').toLowerCase()
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  })

  const add = (user) => {
    onChange([...value, getId(user)])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const remove = (id) => onChange(value.filter((v) => v !== id))

  const handleChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Backspace' && !query && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div
        className="min-h-[42px] w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((u) => {
          const id = getId(u)
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium pl-1 pr-1.5 py-0.5 rounded-full"
            >
              <Avatar name={u.name || u.email} size="sm" className="!w-4 !h-4 !text-[9px]" />
              <span className="max-w-[100px] truncate">{u.name || u.email}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(id) }}
                className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-100 flex-shrink-0"
              >
                <X size={11} />
              </button>
            </span>
          )
        })}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? 'Type @ to mention members…' : ''}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
        />
      </div>

      {open && (
        <ul className="absolute z-50 top-full mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-gray-400 dark:text-gray-500 text-center">
              {users.length === 0 ? 'No users available' : 'No matches found'}
            </li>
          ) : (
            filtered.map((u) => (
              <li key={getId(u)}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(u) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition text-left"
                >
                  <Avatar name={u.name || u.email} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-snug">
                      {u.name || '—'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
