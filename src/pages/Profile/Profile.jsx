import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EventCard from '../../components/event/EventCard.jsx'
import Toast from '../../components/ui/Toast.jsx'
import HoursTable from '../../components/user/HoursTable.jsx'
import ProfileHeader from '../../components/user/ProfileHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../hooks/useToast.js'
import { useLang } from '../../i18n/index.jsx'
import { getJoinedEvents } from '../../services/eventService.js'
import { getHoursLog, getProfileTiles, getUserByUsername } from '../../services/userService.js'
import { BADGE_STEPS, nextBadge, tintClass } from '../../utils/format.js'

function BadgesCard({ hours }) {
  const { t } = useLang()
  const goal = nextBadge(hours)
  const steps = BADGE_STEPS.filter((s) => s <= Math.max(50, goal))
  return (
    <div className="badges-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{t('profile.badges')}</h3>
        <span className="small" style={{ color: '#c9d4de' }}>
          {t('profile.toNext', { n: goal - hours, goal })}
        </span>
      </div>
      <div className="progress orange" style={{ margin: '14px 0 10px' }}>
        <span style={{ width: `${Math.min(100, (hours / goal) * 100)}%` }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <span key={s} className={`badge-chip ${hours >= s ? '' : 'locked'}`}>
            {s} hrs
          </span>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        style={{ marginTop: 14 }}
        onClick={() => window.print()}
      >
        {t('profile.certificate')}
      </button>
    </div>
  )
}

export default function Profile() {
  const { username } = useParams()
  const { t } = useLang()
  const { user: me } = useAuth()
  const isMe = username === me.username
  const [tab, setTab] = useState('posts')
  const [toast, showToast] = useToast()

  const profile = useAsync(() => getUserByUsername(username), [username])
  const tiles = useAsync(getProfileTiles, [])
  const joined = useAsync(getJoinedEvents, [])
  const hours = useAsync(getHoursLog, [])

  if (profile.loading && !profile.data) return <div className="page empty">{t('common.loading')}</div>
  if (!profile.data) return <div className="page empty">{t('profile.notFound')}</div>

  const user = profile.data

  function onFollowChange(now) {
    profile.setData((u) => ({ ...u, isFollowing: now, followers: u.followers + (now ? 1 : -1) }))
  }

  function share() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    showToast(t('post.copied'))
  }

  return (
    <div className="page page-narrow">
      <ProfileHeader user={user} isMe={isMe} onShare={share} onFollowChange={onFollowChange} />

      <div className="profile-grid">
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>{t('profile.about')}</h3>
            <p className="small" style={{ color: 'var(--text-2)' }}>
              {user.bio || '—'}
            </p>
            {user.skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {user.skills.map((s) => (
                  <span key={s} className="chip" style={{ background: 'var(--bg)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          {user.role === 'volunteer' && <BadgesCard hours={user.hours ?? 0} />}
        </aside>

        <section>
          <div className="tabs-underline" role="tablist" style={{ marginBottom: 14 }}>
            {[
              ['posts', 'profile.posts'],
              ['events', 'profile.events'],
              ['hours', 'profile.hoursTab'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                className={tab === k ? 'active' : ''}
                onClick={() => setTab(k)}
              >
                {t(label)}
              </button>
            ))}
          </div>

          {tab === 'posts' && (
            <div className="post-grid">
              {(isMe ? tiles.data : tiles.data?.slice(0, 3))?.map((p) => (
                <div key={p.id} className="card post-tile">
                  <div className={`post-tile-img ${tintClass(p.tint)}`} />
                  <div className="post-tile-foot">
                    <span>{p.tag}</span>
                    <span>{t('post.likes', { n: p.likes })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <div className="card-grid-3">
              {joined.data?.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
              {joined.data?.length === 0 && <p className="empty">—</p>}
            </div>
          )}

          {tab === 'hours' && hours.data && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <HoursTable rows={hours.data} />
            </div>
          )}
        </section>
      </div>
      <Toast message={toast} />
    </div>
  )
}
