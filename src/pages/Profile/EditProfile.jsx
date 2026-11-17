import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/user/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { updateProfile } from '../../services/userService.js'
import { shrinkImage } from '../../utils/image.js'

export default function EditProfile() {
  const { t } = useLang()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio ?? '')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Preview of the newly picked photo
  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    try {
      // Big photos are scaled down here, so any size from a phone works.
      setAvatar(await shrinkImage(file, 600))
    } catch (err) {
      setError(err.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return setError(t('auth.errName'))
    setBusy(true)
    setError('')
    try {
      const updated = await updateProfile({ name: name.trim(), bio: bio.trim(), avatar })
      updateUser(updated)
      toast(t('profile.saved'))
      navigate(`/u/${updated.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const shownUser = { ...user, name: name || user.name, avatarUrl: preview || user.avatarUrl }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <form className="card card-pad" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ fontSize: 22 }}>{t('profile.editTitle')}</h1>

        <div className="field">
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t('profile.photo')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar user={shownUser} size={80} />
            <div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
                {t('profile.changePhoto')}
              </button>
              <p className="muted xs" style={{ marginTop: 6 }}>
                {t('profile.photoHint')}
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="name">{t('profile.name')}</label>
          <input id="name" className="input" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="bio">{t('profile.bio')}</label>
          <textarea
            id="bio"
            className="textarea"
            value={bio}
            maxLength={500}
            placeholder={t('profile.bioPh')}
            onChange={(e) => setBio(e.target.value)}
          />
          <span className="muted xs" style={{ textAlign: 'right' }}>
            {bio.length}/500
          </span>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            {t('create.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('common.loading') : t('profile.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
