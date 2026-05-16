const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-9 h-9 text-sm',
  xl: 'w-16 h-16 text-xl',
}

function initialsFrom(name) {
  if (!name || !name.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeCls = SIZES[size] || SIZES.md

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`${sizeCls} rounded-full object-cover bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeCls} rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold flex-shrink-0 ${className}`}
    >
      {initialsFrom(name)}
    </div>
  )
}
