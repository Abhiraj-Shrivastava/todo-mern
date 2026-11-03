import { useCallback, useEffect, useState } from 'react';

export function useFetch(fetcher, key, version = 0) {
  const [state, setState] = useState({ key: null, data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher(controller.signal).then(
      (data) => setState({ key, data, error: null, loading: false }),
      (error) => {
        if (error.name === 'AbortError') return;
        setState((s) => ({ key, data: s.key === key ? s.data : null, error, loading: false }));
      }
    );
    return () => controller.abort();
  }, [key, version, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const fresh = state.key === key;
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: state.loading || !fresh,
    reload,
  };
}
