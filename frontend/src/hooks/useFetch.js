import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

// Mengambil data GET dari API dan mengelola state loading / error.
// Jika path berubah (misalnya filter), data diambil ulang. Kirim path null untuk menunda.
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: '' }));
    api(path)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  return { ...state, reload: () => setReloadKey((key) => key + 1) };
}
