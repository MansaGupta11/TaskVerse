import { useState, useEffect } from 'react';
import { getProjectsApi } from '../api/projects.api';
export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjectsApi();
      setProjects(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProjects(); }, []);
  return { projects, loading, error, refetch: fetchProjects };
}
