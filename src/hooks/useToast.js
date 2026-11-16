import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast(ms = 2000) {
  const [message, setMessage] = useState(null)
  const timer = useRef()

  const show = useCallback(
    (msg) => {
      clearTimeout(timer.current)
      setMessage(msg)
      timer.current = setTimeout(() => setMessage(null), ms)
    },
    [ms],
  )

  useEffect(() => () => clearTimeout(timer.current), [])
  return [message, show]
}
