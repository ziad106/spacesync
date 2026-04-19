import { useState, useEffect, useCallback } from 'react';
import API from '../api';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/resources');
      setResources(data);
    } catch { setResources([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { resources, loading, refetch: fetch };
}
