import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectsList from './pages/ProjectsList'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'
import UsersAdmin from './pages/UsersAdmin'
import MyTasks from './pages/MyTasks'
import useUiStore from './store/uiStore'
import { Toaster } from 'sonner'

export default function App() {
  const { theme, initTheme } = useUiStore()
  useEffect(() => { initTheme(theme) }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks/my" element={<MyTasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
        </Route>
        <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route path="/admin/users" element={<UsersAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" theme={theme} />
    </BrowserRouter>
  )
}
