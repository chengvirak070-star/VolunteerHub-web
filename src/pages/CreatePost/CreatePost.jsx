import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../../components/post/ImageUpload.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { searchEvents } from '../../services/eventService.js'
import { createPost } from '../../services/postService.js'

const MAX_IMAGE_MB = 5

export default function CreatePost() {
  const { t } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [eventId, setEventId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const events = useAsync(() => searchEvents({ perPage: 50 }), [])

  function pickImage(file) {
    setError('')
    if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return setError(`The photo must be smaller than ${MAX_IMAGE_MB} MB.`)
    }
    setImage(file)
  }

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError('')
    try {
      await createPost({ text: text.trim(), image, eventId })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <form className="card card-pad" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={user} size={40} />
          <h1 style={{ fontSize: 20 }}>{t('create.title')}</h1>
        </div>

        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('create.placeholder')}
          aria-label={t('create.title')}
          maxLength={2000}
          autoFocus
        />

        <ImageUpload value={image} onChange={pickImage} />

        <div className="field">
          <label htmlFor="ev">{t('create.linkEvent')}</label>
          <select id="ev" className="select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">{t('create.none')}</option>
            {events.data?.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} · {ev.place}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            {t('create.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>
            {busy ? t('common.loading') : t('create.post')}
          </button>
        </div>
      </form>
    </div>
  )
}
