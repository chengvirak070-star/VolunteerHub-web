import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import JoinButton from '../../components/event/JoinButton.jsx'
import Elephant from '../../components/ui/Elephant.jsx'
import Icon from '../../components/ui/Icon.jsx'
import Toast from '../../components/ui/Toast.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import FollowButton from '../../components/user/FollowButton.jsx'
import UserName from '../../components/user/UserName.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../hooks/useToast.js'
import { useLang } from '../../i18n/index.jsx'
import { askQuestion, getEvent, toggleSave } from '../../services/eventService.js'
import { followingIds } from '../../services/mockData.js'
import { compact, longDate, tintClass } from '../../utils/format.js'

export default function EventDetail() {
  const { id } = useParams()
  const { t } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: event, loading, setData } = useAsync(() => getEvent(id), [id])
  const [question, setQuestion] = useState('')
  const [toast, showToast] = useToast()

  if (loading && !event) return <div className="page empty">{t('common.loading')}</div>
  if (!event) return <div className="page empty">{t('event.notFound')}</div>

  const org = event.organizer
  const percent = Math.round((event.joined / event.capacity) * 100)
  const shown = event.attendeeUsers.slice(0, 4)
  const others = Math.max(0, event.joined - shown.length)
  // mock: everyone else on the attendee list is someone you follow
  const friendsGoing = event.attendees.filter((uid) => uid !== user.id).length

  function onJoinChange(updated) {
    setData((e) => ({
      ...e,
      ...updated,
      attendeeUsers: updated.isJoined
        ? [{ ...user, id: 'u1' }, ...e.attendeeUsers.filter((u) => u.id !== 'u1')]
        : e.attendeeUsers.filter((u) => u.id !== 'u1'),
    }))
  }

  async function onSave() {
    const saved = await toggleSave(event.id)
    setData((e) => ({ ...e, isSaved: saved }))
  }

  function onShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    showToast(t('post.copied'))
  }

  async function onAsk(e) {
    e.preventDefault()
    const text = question.trim()
    if (!text) return
    const q = await askQuestion(event.id, user.id, text)
    setData((ev) => ({ ...ev, questions: [...ev.questions, { ...q, user }] }))
    setQuestion('')
  }

  return (
    <div className="page page-narrow">
      <Link
        to="/"
        className="back-link"
        onClick={(e) => {
          if (window.history.length > 1) {
            e.preventDefault()
            navigate(-1)
          }
        }}
      >
        <Icon name="chevronLeft" size={16} /> {t('event.backToFeed')}
      </Link>

      <div
        className={`img-placeholder event-hero ${tintClass(event.tint)}`}
        style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}
      >
        {!event.image && <Icon name="image" size={44} strokeWidth={1.5} />}
      </div>

      <div className="detail-grid">
        {/* Main column */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {event.categories.map((c, i) => (
              <span key={c} className={`pill ${i === 0 ? 'pill-mint' : 'pill-slate'}`}>
                {t(`cat.${c}`)}
              </span>
            ))}
          </div>
          <h1 style={{ fontSize: 30, marginBottom: 14 }}>{event.title}</h1>

          <div className="card organizer-row">
            <Link to={`/u/${org.username}`}>
              <Avatar user={org} size={44} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <UserName user={org} />
              <p className="muted xs">
                {t('user.organizer')} · {compact(org.followers)} {t('user.followers')} · {org.eventsCount}{' '}
                {t('profile.events').toLowerCase()}
              </p>
            </div>
            <FollowButton userId={org.id} initial={followingIds.has(org.id)} size="md" />
          </div>

          <section className="detail-section">
            <h3>{t('event.about')}</h3>
            <p>{event.description}</p>
          </section>

          {event.bring?.length > 0 && (
            <section className="detail-section">
              <h3>{t('event.bring')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {event.bring.map((b) => (
                  <span key={b} className="chip">
                    {b}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="detail-section">
            <h3>{t('event.location')}</h3>
            <div className="map-box">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="pin" size={20} className="verified" />
                {event.place}, {event.city}
              </span>
            </div>
          </section>

          <section className="detail-section">
            <h3>{t('event.questions', { n: event.questions.length })}</h3>
            {event.questions.map((q) => (
              <div key={q.id} className="card question">
                <Avatar user={q.user} size={32} />
                <div>
                  <p className="small">
                    <strong>{q.user.name}</strong>
                    <span className="muted">
                      {q.userId === event.organizerId && ` · ${t('user.organizer')}`} · {q.ago}
                    </span>
                  </p>
                  <p className="small">{q.text}</p>
                </div>
              </div>
            ))}
            <form className="comment-form" onSubmit={onAsk} style={{ marginTop: 4 }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('event.askPh')}
                aria-label={t('event.askPh')}
              />
              <button type="submit" className="btn btn-dark btn-sm" disabled={!question.trim()}>
                {t('event.ask')}
              </button>
            </form>
          </section>
        </div>

        {/* Side column */}
        <aside className="sticky-col">
          <div className="card card-pad">
            <p className="info-line">
              <Icon name="calendar" size={18} /> {longDate(event.date)}
            </p>
            <p className="info-line">
              <Icon name="clock" size={18} /> {event.start} – {event.end} · {t('event.counts', { n: event.hours })}
            </p>
            <p className="info-line">
              <Icon name="pin" size={18} /> {event.place}, {event.city}
            </p>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }} className="xs">
              <strong>{t('event.joinedOf', { a: event.joined, b: event.capacity })}</strong>
              <span className="muted">
                {event.spotsLeft > 0 ? t('event.spotsLeft', { n: event.spotsLeft }) : t('event.full')}
              </span>
            </div>
            <div className="progress" style={{ marginBottom: 14 }}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <JoinButton event={event} size="lg" block onChange={onJoinChange} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={onSave} aria-pressed={event.isSaved}>
                {event.isSaved ? t('event.saved') : t('event.save')}
              </button>
              <button type="button" className="btn btn-outline" onClick={onShare}>
                {t('post.share')}
              </button>
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>{t('event.whoGoing')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar-stack">
                {shown.map((u) => (
                  <Avatar key={u.id} user={u} size={32} />
                ))}
              </div>
              {others > 0 && <span className="muted xs">{t('event.others', { n: others })}</span>}
            </div>
            {friendsGoing > 0 && (
              <p className="muted xs" style={{ marginTop: 10 }}>
                {t('event.friendsGoing', { n: friendsGoing })}
              </p>
            )}
          </div>

          <div className="help-card">
            <Elephant size={48} />
            <p>{t('event.hoursNote', { n: event.hours })}</p>
          </div>
        </aside>
      </div>
      <Toast message={toast} />
    </div>
  )
}
