import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useUiStore from '../store/uiStore'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useUiStore()
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl 
        bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
        hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
