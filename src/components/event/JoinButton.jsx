import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { toggleJoin } from '../../services/eventService.js'

/**
 * Join / leave an event. Calls onChange(updatedEvent) after the server answers.
 */
export default function JoinButton({ event, size = 'sm', block = false, onChange }) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState(false)
  const isFull = event.spotsLeft <= 0 && !event.isJoined

  async function handle(e) {
    e.preventDefault()
    e.stopPropagation()
    setBusy(true)
    try {
      const updated = await toggleJoin(event.id)
      onChange?.(updated)
    } finally {
      setBusy(false)
    }
  }

  let label = t('event.join')
  if (isFull) label = t('event.full')
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
      disabled={busy || isFull}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </button>
  )
}
