import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { api, toast } from '../../services/api.js'
import { shrinkImage } from '../../utils/image.js'
import Icon from './Icon.jsx'

/**
 * "Report a problem" box. Sends message, page and an optional screenshot
 * to the admin panel (Bug reports page).
 * page: the page the user was on, sent automatically.
 */
export default function BugReportDialog({ page, onClose }) {
  const { t } = useLang()
  const fileRef = useRef(null)
  const [message, setMessage] = useState('')
  const [shot, setShot] = useState(null) // File
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const preview = useMemo(() => (shot ? URL.createObjectURL(shot) : null), [shot])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  async function attachImage(file) {
    if (!file) return
    setError('')
    try {
      setShot(await shrinkImage(file, 1600))
    } catch (err) {
      setError(err.message)
    }
  }

  // Ctrl+V a screenshot (e.g. after Win+Shift+S)
  function onPaste(e) {
    const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'))
    if (item) {
      e.preventDefault()
      attachImage(item.getAsFile())
    }
  }

  async function send(e) {
    e.preventDefault()
    setError('')
    if (message.trim().length < 5) return setError(t('bug.errShort'))
    setBusy(true)
    try {
      const form = new FormData()
      form.append('message', message.trim())
      form.append('page_url', page)
      if (shot) form.append('screenshot', shot)
      await api('/bug-reports', { method: 'POST', body: form })
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
      <form className="card modal" onSubmit={send} onPaste={onPaste} role="dialog" aria-modal="true" aria-label={t('bug.title')}>
        <h2 style={{ fontSize: 18 }}>{t('bug.title')}</h2>
        <p className="muted small">{t('bug.hint')}</p>
        <textarea
          className="textarea"
          style={{ minHeight: 110 }}
          maxLength={2000}
          placeholder={t('bug.placeholder')}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setError('')
          }}
          autoFocus
        />

        {preview ? (
          <div className="bug-shot">
            <img src={preview} alt={t('bug.screenshot')} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShot(null)}>
              <Icon name="x" size={14} /> {t('create.remove')}
            </button>
          </div>
        ) : (
          <button type="button" className="bug-add-shot" onClick={() => fileRef.current?.click()}>
            <Icon name="image" size={20} />
            <span>
              <strong>{t('bug.addScreenshot')}</strong>
              <span className="muted xs" style={{ display: 'block' }}>
                {t('bug.pasteHint')}
              </span>
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            attachImage(e.target.files?.[0])
            e.target.value = ''
          }}
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
