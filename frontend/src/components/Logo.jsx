// TaskVerse brand logo — a gradient badge with a checkmark and a sparkle,
// evoking "tasks" within a "verse" (universe). Single source of truth for the
// brand mark used in the sidebar, auth pages, and landing page.

export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '27.5%' }}
      role="img"
      aria-label="TaskVerse"
    >
      <defs>
        <linearGradient
          id="taskverse-mark"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#taskverse-mark)" />
      <path
        d="M10.5 21L16.5 27L26.5 15"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 6.5C31.3 8.7 32.3 9.7 34.5 10C32.3 10.3 31.3 11.3 31 13.5C30.7 11.3 29.7 10.3 27.5 10C29.7 9.7 30.7 8.7 31 6.5Z"
        fill="white"
      />
    </svg>
  )
}

export default function Logo({
  size = 32,
  className = '',
  textClassName = 'text-base font-bold text-gray-900 dark:text-white',
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} className={className} />
      <span className={textClassName}>TaskVerse</span>
    </span>
  )
}
