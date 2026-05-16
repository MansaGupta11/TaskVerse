import axios from 'axios';
import { toast } from 'sonner';
const instance = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
instance.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      res.data = res.data.data
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      toast.error('Your session expired. Please sign in again.');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(err);
  }
);
export default instance;
