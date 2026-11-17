import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ImageUpload from '../../components/post/ImageUpload.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { CITIES } from '../../services/eventService.js'
import { createEvent, getCategories, getEventRaw, updateEvent } from '../../services/organizerService.js'
import { shrinkImage } from '../../utils/image.js'
import { localDate } from '../../utils/mappers.js'

const pad = (n) => String(n).padStart(2, '0')
const timeOf = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Hours between two 'HH:mm' times, rounded to 0.5. */
function hoursBetween(start, end) {
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  const diff = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60
  return diff > 0 ? Math.round(diff * 2) / 2 : 0
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDate(d)
}

const EMPTY = {
  title: '',
  description: '',
  categoryId: '',
  place: '',
  city: 'Phnom Penh',
  date: tomorrow(),
  start: '07:00',
  end: '11:00',
  hours: 4,
  capacity: 30,
}

/** Create (/organizer/events/new) or edit (/organizer/events/:id/edit) an event. */
export default function EventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { t } = useLang()
  const navigate = useNavigate()
  const categories = useAsync(getCategories, [])
  const existing = useAsync(() => (isEdit ? getEventRaw(id) : Promise.resolve(null)), [id])

  const [v, setV] = useState(EMPTY)
  const [cover, setCover] = useState(null)
  const [hoursTouched, setHoursTouched] = useState(isEdit)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Fill the form when editing
  const loaded = existing.data
  useEffect(() => {
    if (!loaded) return
    const s = new Date(loaded.starts_at)
    const e = new Date(loaded.ends_at)
    const [place, ...rest] = loaded.location.split(',')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setV({
      title: loaded.title,
      description: loaded.description,
      categoryId: String(loaded.category?.id ?? ''),
      place: place.trim(),
      city: rest.join(',').trim(),
      date: localDate(s),
      start: timeOf(s),
      end: timeOf(e),
      hours: loaded.hours,
      capacity: loaded.capacity,
    })
  }, [loaded])

  // Default category = first one
  const firstCategory = categories.data?.[0]?.id
  const categoryId = v.categoryId || (firstCategory ? String(firstCategory) : '')

  const set = (k) => (e) => {
    const value = e.target.value
    setV((old) => {
      const next = { ...old, [k]: value }
      // Hours follow the start/end time until the organizer types their own number
      if ((k === 'start' || k === 'end') && !hoursTouched) next.hours = hoursBetween(next.start, next.end)
      return next
    })
    if (k === 'hours') setHoursTouched(true)
  }

  const cities = useMemo(() => (v.city && !CITIES.includes(v.city) ? [...CITIES, v.city] : CITIES), [v.city])

  async function pickCover(file) {
    setError('')
    if (!file) return setCover(null)
    try {
      setCover(await shrinkImage(file, 1600))
    } catch (err) {
      setError(err.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!v.title.trim() || !v.description.trim() || !v.place.trim()) return setError(t('org.errRequired'))
    if (hoursBetween(v.start, v.end) <= 0) return setError(t('org.errTime'))
    const startsAt = new Date(`${v.date}T${v.start}`)
    if (!isEdit && startsAt <= new Date()) return setError(t('org.errPast'))

    setBusy(true)
    try {
      const values = {
        title: v.title.trim(),
        description: v.description.trim(),
        categoryId,
        location: [v.place.trim(), v.city].filter(Boolean).join(', '),
        startsAt: `${v.date} ${v.start}`,
        endsAt: `${v.date} ${v.end}`,
        hours: v.hours,
        capacity: v.capacity,
        cover,
      }
      if (isEdit) {
        await updateEvent(id, values)
        toast(t('org.saved'))
      } else {
        await createEvent(values)
        toast(t('org.created'))
      }
      navigate('/organizer')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (isEdit && existing.loading) return <div className="page empty">{t('common.loading')}</div>
  if (isEdit && existing.error) return <div className="page empty">{existing.error.message}</div>

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <form className="card card-pad event-form" onSubmit={submit} noValidate>
        <h1 style={{ fontSize: 22 }}>{isEdit ? t('org.editTitle') : t('org.createTitle')}</h1>
        {!isEdit && <p className="muted small">{t('org.reviewNote')}</p>}

        <div className="field">
          <label htmlFor="title">{t('org.fTitle')}</label>
          <input id="title" className="input" value={v.title} onChange={set('title')} maxLength={150} placeholder={t('org.fTitlePh')} />
        </div>

        <div className="field">
          <label htmlFor="cat">{t('search.category')}</label>
          <select id="cat" className="select" value={categoryId} onChange={set('categoryId')}>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en} · {c.name_km}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="desc">{t('event.about')}</label>
          <textarea id="desc" className="textarea" value={v.description} onChange={set('description')} maxLength={5000} placeholder={t('org.fDescPh')} />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="place">{t('org.fPlace')}</label>
            <input id="place" className="input" value={v.place} onChange={set('place')} maxLength={150} placeholder="Riverside" />
          </div>
          <div className="field">
            <label htmlFor="city">{t('org.fCity')}</label>
            <select id="city" className="select input" value={v.city} onChange={set('city')}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row three">
          <div className="field">
            <label htmlFor="date">{t('hours.date')}</label>
            <input id="date" type="date" className="input" value={v.date} min={isEdit ? undefined : localDate(new Date())} onChange={set('date')} />
          </div>
          <div className="field">
            <label htmlFor="start">{t('org.fStart')}</label>
            <input id="start" type="time" className="input" value={v.start} onChange={set('start')} />
          </div>
          <div className="field">
            <label htmlFor="end">{t('org.fEnd')}</label>
            <input id="end" type="time" className="input" value={v.end} onChange={set('end')} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="hours">{t('org.fHours')}</label>
            <input id="hours" type="number" className="input" min="0.5" max="24" step="0.5" value={v.hours} onChange={set('hours')} />
            <span className="muted xs">{t('org.fHoursHint')}</span>
          </div>
          <div className="field">
            <label htmlFor="cap">{t('org.fCapacity')}</label>
            <input id="cap" type="number" className="input" min="1" max="1000" value={v.capacity} onChange={set('capacity')} />
          </div>
        </div>

        <div className="field">
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t('org.fCover')}</span>
          {isEdit && loaded?.cover_url && !cover && (
            <img src={loaded.cover_url} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12 }} />
          )}
          <ImageUpload value={cover} onChange={pickCover} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            {t('create.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !categoryId}>
            {busy ? t('common.loading') : isEdit ? t('profile.save') : t('org.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
