import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../../components/post/ImageUpload.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { searchEvents } from '../../services/eventService.js'
import { createPost } from '../../services/postService.js'

export default function CreatePost() {
  const { t } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [eventId, setEventId] = useState('')
  const [busy, setBusy] = useState(false)
  const events = useAsync(() => searchEvents(), [])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      await createPost({
        authorId: user.id,
        text: text.trim(),
        image: image ? URL.createObjectURL(image) : null,
        eventId,
      })
      navigate('/')
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
          autoFocus
        />

        <ImageUpload value={image} onChange={setImage} />

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            ✕
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>
            {t('create.post')}
          </button>
        </div>
      </form>
    </div>
  )
}
