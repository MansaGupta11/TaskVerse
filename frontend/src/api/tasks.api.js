import api from './axios'

export const getTasks = (params) => api.get('/tasks', { params })
export const getMyTasks = () => api.get('/tasks/mine')
export const getTask = (id) => api.get(`/tasks/${id}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status })
