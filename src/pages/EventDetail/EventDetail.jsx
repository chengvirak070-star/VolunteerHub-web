import { Link, useNavigate, useParams } from 'react-router-dom'
import JoinButton from '../../components/event/JoinButton.jsx'
import Elephant from '../../components/ui/Elephant.jsx'
import Icon from '../../components/ui/Icon.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import FollowButton from '../../components/user/FollowButton.jsx'
import UserName from '../../components/user/UserName.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { categoryName } from '../../services/categoryService.js'
import { getEvent, toggleSave } from '../../services/eventService.js'
import { compact, longDate, tintClass } from '../../utils/format.js'

export default function EventDetail() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const { data: event, loading, error, setData } = useAsync(() => getEvent(id), [id])

  if (loading && !event) return <div className="page empty">{t('common.loading')}</div>
  if (error) return <div className="page empty">{error.message}</div>
  if (!event) return <div className="page empty">{t('event.notFound')}</div>

  const org = event.organizer
  const percent = Math.min(100, Math.round((event.joined / event.capacity) * 100))
  const shown = event.attendeeUsers.slice(0, 4)
  const others = Math.max(0, event.joined - shown.length)

  // After joining/leaving, reload so the attendee list and counts are fresh.
  async function onJoinChange(updated) {
    setData((e) => ({ ...e, ...updated, organizer: e.organizer, attendeeUsers: e.attendeeUsers, friendsGoing: e.friendsGoing }))
    const fresh = await getEvent(id).catch(() => null)
    if (fresh) setData(fresh)
  }

  async function onSave() {
    try {
      const saved = await toggleSave(event)
      setData((e) => ({ ...e, isSaved: saved }))
    } catch (err) {
      toast(err.message)
    }
  }

  function onShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    toast(t('post.copied'))
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
            {event.category && <span className="pill pill-mint">{categoryName(event.category, lang)}</span>}
            {event.status !== 'open' && <span className="pill pill-slate">{t(`event.status.${event.status}`)}</span>}
          </div>
          <h1 style={{ fontSize: 30, marginBottom: 14 }}>{event.title}</h1>

          {org?.username && (
            <div className="card organizer-row">
              <Link to={`/u/${org.username}`}>
                <Avatar user={org} size={44} />
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserName user={org} />
                <p className="muted xs">
                  {t('user.organizer')} · {compact(org.followers)} {t('user.followers')}
                  {org.eventsCount != null && ` · ${org.eventsCount} ${t('profile.events').toLowerCase()}`}
                </p>
              </div>
              <FollowButton
                userId={org.id}
                initial={org.isFollowing}
                size="md"
                onChange={(now) =>
                  setData((e) => ({
                    ...e,
                    organizer: { ...e.organizer, isFollowing: now, followers: e.organizer.followers + (now ? 1 : -1) },
                  }))
                }
              />
            </div>
          )}

          <section className="detail-section">
            <h3>{t('event.about')}</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </section>

          <section className="detail-section">
            <h3>{t('event.location')}</h3>
            <div className="map-box">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="pin" size={20} className="verified" />
                {event.location}
              </span>
            </div>
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
              <Icon name="pin" size={18} /> {event.location}
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
            {event.joined === 0 ? (
              <p className="muted xs">{t('event.beFirst')}</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar-stack">
                  {shown.map((u) => (
                    <Avatar key={u.id} user={u} size={32} />
                  ))}
                </div>
                {others > 0 && <span className="muted xs">{t('event.others', { n: others })}</span>}
              </div>
            )}
            {event.friendsGoing > 0 && (
              <p className="muted xs" style={{ marginTop: 10 }}>
                {t('event.friendsGoing', { n: event.friendsGoing })}
              </p>
            )}
          </div>

          <div className="help-card">
            <Elephant size={48} />
            <p>{t('event.hoursNote', { n: event.hours })}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
