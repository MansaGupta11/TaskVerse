import { motion } from 'framer-motion'
import { LogoMark } from './Logo'

export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* soft static ring */}
        <div className="absolute inset-0 rounded-full border border-indigo-100 dark:border-indigo-900/40" />
        {/* spinning gradient arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        {/* pulsing brand mark */}
        <motion.div
          animate={{ scale: [1, 0.85, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LogoMark size={34} className="shadow-lg shadow-indigo-500/30" />
        </motion.div>
      </div>
    </div>
  )
}
