import { useEffect, useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { api, toast } from '../../services/api.js'

/**
 * "Report a problem" box. Sends { message, page_url } to the admin panel (Bug reports page).
 * page: the page the user was on, sent automatically.
 */
export default function BugReportDialog({ page, onClose }) {
  const { t } = useLang()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  async function send(e) {
    e.preventDefault()
    setError('')
    if (message.trim().length < 5) return setError(t('bug.errShort'))
    setBusy(true)
    try {
      await api('/bug-reports', { method: 'POST', body: { message: message.trim(), page_url: page } })
      toast(t('bug.thanks'))
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="card modal" onSubmit={send} role="dialog" aria-modal="true" aria-label={t('bug.title')}>
        <h2 style={{ fontSize: 18 }}>{t('bug.title')}</h2>
        <p className="muted small">{t('bug.hint')}</p>
        <textarea
          className="textarea"
          style={{ minHeight: 120 }}
          maxLength={2000}
          placeholder={t('bug.placeholder')}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setError('')
          }}
          autoFocus
        />
        <p className="muted xs">
          {t('bug.page')} <code>{page}</code>
        </p>
        {error && <p className="error-text">{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {t('create.cancel')}
          </button>
          <button type="submit" className="btn btn-dark" disabled={busy}>
            {busy ? t('common.loading') : t('bug.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
