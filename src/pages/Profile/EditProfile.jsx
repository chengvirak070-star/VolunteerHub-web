import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { updateProfile } from '../../services/userService.js'
import { shrinkImage } from '../../utils/image.js'
import { PROVINCES, SKILL_IDEAS } from '../../utils/places.js'

const MAX_SKILLS = 10

export default function EditProfile() {
  const { t } = useLang()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio ?? '',
    city: user.city ?? '',
    school: user.school ?? '',
    telegram: user.telegram ?? '',
    phone: user.phone ?? '',
  })
  const [skills, setSkills] = useState(user.skills ?? [])
  const [skillText, setSkillText] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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

  // Skills: type and press Enter (or a comma), or tap an idea
  function addSkill(raw) {
    const s = raw.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30)
    if (!s) return
    setSkills((list) => {
      if (list.some((x) => x.toLowerCase() === s.toLowerCase())) return list
      if (list.length >= MAX_SKILLS) {
        setError(t('profile.skillsMax'))
        return list
      }
      return [...list, s]
    })
    setSkillText('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError(t('auth.errName'))
    setBusy(true)
    setError('')
    try {
      const all = skillText.trim() ? [...skills, skillText.trim()] : skills // don't lose a half-typed skill
      const updated = await updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        city: form.city,
        school: form.school.trim(),
        telegram: form.telegram.trim(),
        phone: form.phone.trim(),
        skills: [...new Set(all)].slice(0, MAX_SKILLS),
        avatar,
      })
      updateUser(updated)
      toast(t('profile.saved'))
      navigate(`/u/${updated.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const shownUser = { ...user, name: form.name || user.name, avatarUrl: preview || user.avatarUrl }
  const ideas = SKILL_IDEAS.filter((s) => !skills.some((x) => x.toLowerCase() === s.toLowerCase())).slice(0, 6)

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <form className="card card-pad edit-profile" onSubmit={submit}>
        <h1 style={{ fontSize: 22 }}>{t('profile.editTitle')}</h1>

        {/* ---- Photo + name ---- */}
        <div className="edit-photo">
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

        <div className="field">
          <label htmlFor="name">{t('profile.name')}</label>
          <input id="name" className="input" value={form.name} maxLength={100} onChange={set('name')} />
        </div>

        <div className="field">
          <label htmlFor="bio">{t('profile.bio')}</label>
          <textarea id="bio" className="textarea" value={form.bio} maxLength={500} placeholder={t('profile.bioPh')} onChange={set('bio')} style={{ minHeight: 90 }} />
          <span className="muted xs" style={{ textAlign: 'right' }}>
            {form.bio.length}/500
          </span>
        </div>

        {/* ---- About me ---- */}
        <h2 className="edit-section">{t('profile.sectionAbout')}</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="city">{t('profile.city')}</label>
            <select id="city" className="select input" value={form.city} onChange={set('city')}>
              <option value="">{t('profile.cityNone')}</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="school">{t('profile.school')}</label>
            <input id="school" className="input" value={form.school} maxLength={150} placeholder={t('profile.schoolPh')} onChange={set('school')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="skill">
            {t('profile.skills')} <span className="muted xs">({skills.length}/{MAX_SKILLS})</span>
          </label>
          <div className="skill-box" onClick={() => document.getElementById('skill')?.focus()}>
            {skills.map((s) => (
              <span key={s} className="skill-chip">
                {s}
                <button type="button" aria-label={`${t('create.remove')} ${s}`} onClick={() => setSkills((list) => list.filter((x) => x !== s))}>
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
            <input
              id="skill"
              value={skillText}
              maxLength={30}
              placeholder={skills.length ? '' : t('profile.skillsPh')}
              onChange={(e) => {
                const v = e.target.value
                if (v.includes(',')) addSkill(v)
                else setSkillText(v)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSkill(skillText)
                } else if (e.key === 'Backspace' && !skillText && skills.length) {
                  setSkills((list) => list.slice(0, -1))
                }
              }}
            />
          </div>
          {ideas.length > 0 && skills.length < MAX_SKILLS && (
            <div className="skill-ideas">
              <span className="muted xs">{t('profile.skillsIdeas')}</span>
              {ideas.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => addSkill(s)}>
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Contact ---- */}
        <h2 className="edit-section">{t('profile.sectionContact')}</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="telegram">Telegram</label>
            <div className="input-prefix">
              <span>@</span>
              <input id="telegram" className="input" value={form.telegram.replace(/^@/, '')} maxLength={40} placeholder="chengvirak" onChange={set('telegram')} />
            </div>
            <span className="muted xs">{t('profile.telegramHint')}</span>
          </div>
          <div className="field">
            <label htmlFor="phone">{t('profile.phone')}</label>
            <input id="phone" className="input" type="tel" value={form.phone} maxLength={30} placeholder="012 345 678" onChange={set('phone')} />
            <span className="muted xs">🔒 {t('profile.phoneHint')}</span>
          </div>
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
