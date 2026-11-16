import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { toggleJoin } from '../../services/eventService.js'

/**
 * Join / leave an event. Calls onChange(updatedEvent) after the server answers.
 */
export default function JoinButton({ event, size = 'sm', block = false, onChange }) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState(false)
  const isFull = !event.isJoined && (event.spotsLeft <= 0 || event.status === 'full')
  const isClosed = !event.isJoined && ['closed', 'pending', 'rejected'].includes(event.status)

  async function handle(e) {
    e.preventDefault()
    e.stopPropagation()
    setBusy(true)
    try {
      const updated = await toggleJoin(event)
      onChange?.(updated)
    } catch (err) {
      toast(err.message) // e.g. "This event is full."
    } finally {
      setBusy(false)
    }
  }

  let label = t('event.join')
  if (isClosed) label = t('event.closed')
  else if (isFull) label = t('event.full')
  else if (event.isJoined) label = hover ? t('event.leave') : t('event.joined')

  const cls = [
    'btn',
    event.isJoined ? 'btn-outline' : 'btn-primary',
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
  ].join(' ')

  return (
    <button
      type="button"
      className={cls}
      onClick={handle}
      disabled={busy || isFull || isClosed}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </button>
  )
}
