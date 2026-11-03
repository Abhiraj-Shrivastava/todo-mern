import { useCallback, useEffect, useState } from 'react';

/**
 * Runs `fetcher(signal)` whenever `key` or `version` changes.
 * - `key` identifies the query: data from a different key is never shown.
 * - `version` forces a refetch of the same query (after a create/update/delete);
 *   the previous data stays on screen while it reloads, so lists don't flash.
 */
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
    // `fetcher` is a fresh closure every render; `key` captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
