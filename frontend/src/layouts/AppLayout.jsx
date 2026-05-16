import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'
import Avatar from '../components/Avatar'
import { LogoMark } from '../components/Logo'

const navBase =
  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150'
const activeClass = 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
const inactiveClass =
  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    ...(!isAdmin ? [{ to: '/tasks/my', icon: CheckSquare, label: 'My Tasks' }] : []),
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo + ThemeToggle */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="text-base font-bold text-gray-900 dark:text-white">TaskVerse</span>
          </div>
          <ThemeToggle />
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                  isAdmin
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {user?.role || 'MEMBER'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${navBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `${navBase} ${isActive ? activeClass : inactiveClass}`}
              >
                <Users size={17} />
                User Management
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <LogOut size={17} />
            Log Out
          </motion.button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  )
}
