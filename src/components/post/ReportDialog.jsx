import { useEffect, useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { api, toast } from '../../services/api.js'

const REASONS = ['spam', 'offensive', 'fake', 'offtopic', 'other']

/**
 * "Report" box. type: 'post' | 'comment' | 'user', id: the item's id.
 * The report goes to the admin panel (Reports page).
 */
export default function ReportDialog({ type, id, onClose }) {
  const { t } = useLang()
  const [reason, setReason] = useState('')
  const [other, setOther] = useState('')
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
    if (!reason) return setError(t('report.errChoose'))
    const text = reason === 'other' ? other.trim() : t(`report.r.${reason}`)
    if (reason === 'other' && text.length < 3) return setError(t('report.errOther'))
    setBusy(true)
    try {
      await api('/reports', { method: 'POST', body: { type, id, reason: text } })
      toast(t('report.thanks'))
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="card modal" onSubmit={send} role="dialog" aria-modal="true" aria-label={t(`report.title.${type}`)}>
        <h2 style={{ fontSize: 18 }}>{t(`report.title.${type}`)}</h2>
        <p className="muted small">{t('report.hint')}</p>

        <div className="report-reasons" role="radiogroup">
          {REASONS.map((r) => (
            <label key={r} className={`report-reason ${reason === r ? 'active' : ''}`}>
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => {
                  setReason(r)
                  setError("")
                }}
              />
              {t(`report.r.${r}`)}
            </label>
          ))}
        </div>

        {reason === 'other' && (
          <textarea
            className="textarea"
            style={{ minHeight: 80 }}
            maxLength={500}
            placeholder={t('report.otherPh')}
            value={other}
            onChange={(e) => setOther(e.target.value)}
            autoFocus
          />
        )}

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {t('create.cancel')}
          </button>
          <button type="submit" className="btn btn-dark" disabled={busy}>
            {busy ? t('common.loading') : t('report.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
