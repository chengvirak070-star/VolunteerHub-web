import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EventCard from '../../components/event/EventCard.jsx'
import HoursTable from '../../components/user/HoursTable.jsx'
import ProfileHeader from '../../components/user/ProfileHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { getUserEvents } from '../../services/eventService.js'
import { getUserPosts } from '../../services/postService.js'
import { downloadCertificate, getUserByUsername, getUserHours } from '../../services/userService.js'
import { BADGE_STEPS, nextBadge, tintClass } from '../../utils/format.js'

function BadgesCard({ hours, isMe, username }) {
  const { t } = useLang()
  const [downloading, setDownloading] = useState(false)
  const goal = nextBadge(hours)
  const steps = BADGE_STEPS.filter((s) => s <= Math.max(50, goal))

  async function download() {
    setDownloading(true)
    try {
      await downloadCertificate(username)
    } catch (err) {
      toast(err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="badges-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{t('profile.badges')}</h3>
        <span className="small" style={{ color: '#c9d4de', textAlign: 'right' }}>
          {hours >= BADGE_STEPS.at(-1)
            ? t('profile.allBadges')
            : t('profile.toNext', { n: Math.max(0, goal - hours), goal })}
        </span>
      </div>
      <div className="progress orange" style={{ margin: '14px 0 10px' }}>
        <span style={{ width: `${Math.min(100, (hours / goal) * 100)}%` }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <span key={s} className={`badge-chip ${hours >= s ? '' : 'locked'}`}>
            {t('profile.hrs', { n: s })}
          </span>
        ))}
      </div>
      {isMe && (
        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ marginTop: 14 }}
          onClick={download}
          disabled={downloading}
        >
          {downloading ? t('common.loading') : t('profile.certificate')}
        </button>
      )}
    </div>
  )
}

export default function Profile() {
  const { username } = useParams()
  const { t } = useLang()
  const { user: me } = useAuth()
  const isMe = username === me.username
  const [tab, setTab] = useState('posts')

  const profile = useAsync(() => getUserByUsername(username), [username])
  const posts = useAsync(() => getUserPosts(username), [username])
  // Events and hours are only fetched when their tab is opened.
  const events = useAsync(() => (tab === 'events' ? getUserEvents(username) : Promise.resolve(null)), [username, tab === 'events'])
  const hours = useAsync(() => (tab === 'hours' ? getUserHours(username) : Promise.resolve(null)), [username, tab === 'hours'])

  if (profile.loading) return <div className="page empty">{t('common.loading')}</div>
  if (profile.error) return <div className="page empty">{profile.error.message}</div>
  if (!profile.data) return <div className="page empty">{t('profile.notFound')}</div>

  const user = profile.data

  function onFollowChange(now) {
    profile.setData((u) => ({ ...u, isFollowing: now, followers: u.followers + (now ? 1 : -1) }))
  }

  function share() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    toast(t('post.copied'))
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
          </div>
          {user.role === 'volunteer' && <BadgesCard hours={user.hours ?? 0} isMe={isMe} username={user.username} />}
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
            <>
              {posts.loading && <p className="empty">{t('common.loading')}</p>}
              {!posts.loading && posts.data?.length === 0 && <p className="card empty">{t('feed.empty')}</p>}
              <div className="post-grid">
                {!posts.loading &&
                  posts.data?.map((p) => (
                    <Link key={p.id} to={`/posts/${p.id}`} className="card post-tile" title={p.text}>
                      <div
                        className={`post-tile-img ${p.image ? '' : tintClass(p.tint)}`}
                        style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}
                      />
                      <div className="post-tile-foot">
                        <span>{p.hashtags[0] ? `#${p.hashtags[0]}` : p.text.slice(0, 18)}</span>
                        <span>{t('post.likes', { n: p.likes })}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          )}

          {tab === 'events' && (
            <>
              {(events.loading || events.data === null) && <p className="empty">{t('common.loading')}</p>}
              {!events.loading && events.data?.length === 0 && <p className="card empty">{t('search.noEvents')}</p>}
              <div className="card-grid-3">
                {!events.loading && events.data?.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </>
          )}

          {tab === 'hours' &&
            (hours.loading || !hours.data ? (
              <p className="empty">{t('common.loading')}</p>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <HoursTable rows={hours.data} />
              </div>
            ))}
        </section>
      </div>
    </div>
  )
}
