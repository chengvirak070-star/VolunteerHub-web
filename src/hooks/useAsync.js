import { useEffect, useState } from 'react'

/**
 * Runs an async function whenever deps change.
 * Returns { data, loading, error, setData }.
 *
 * - deps must be simple values (strings, numbers, plain objects) — they are compared as JSON.
 * - While a new request is running, the previous data stays visible and loading is true.
 * - On an error, data becomes null and error holds the Error.
 */
export function useAsync(fn, deps) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState({ data: null, error: null, key: null })

  useEffect(() => {
    let alive = true
    fn()
      .then((data) => alive && setState({ data, error: null, key }))
      .catch((error) => alive && setState({ data: null, error, key }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setData = (updater) =>
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))

  const loading = state.key !== key
  return { data: state.data, error: loading ? null : state.error, loading, setData }
}
