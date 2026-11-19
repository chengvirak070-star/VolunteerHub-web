import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { EventRow } from '../../components/event/EventCard.jsx'
import PostCard from '../../components/post/PostCard.jsx'
import Elephant from '../../components/ui/Elephant.jsx'
import Icon from '../../components/ui/Icon.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import FollowButton from '../../components/user/FollowButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getUpcoming } from '../../services/eventService.js'
import { getFeed, getTrending } from '../../services/postService.js'
import { getSuggestions } from '../../services/userService.js'
import { compact, nextBadge } from '../../utils/format.js'

const TABS = [
  ['forYou', 'feed.forYou'],
  ['following', 'feed.following'],
  ['events', 'feed.events'],
]

function MiniProfile({ user }) {
  const { t } = useLang()
  const hours = user.hours ?? 0
  const goal = nextBadge(hours)
  return (
    <div className="card card-pad mini-profile">
      <Link to={`/u/${user.username}`} className="row">
        <Avatar user={user} size={44} />
        <div style={{ minWidth: 0 }}>
          <strong className="small" style={{ display: 'block' }}>
            {user.name}
          </strong>
          <span className="muted xs">
            @{user.username} · {t('user.volunteer')}
          </span>
        </div>
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 6px' }} className="small">
        <span>{t('nav.myHours')}</span>
        <strong>{hours} h</strong>
      </div>
      <div className="progress orange">
        <span style={{ width: `${Math.min(100, (hours / goal) * 100)}%` }} />
      </div>
      <p className="muted xs" style={{ marginTop: 8 }}>
        {t('feed.toBadge', { n: goal - hours, goal })}
      </p>
    </div>
  )
}

function SideNav() {
  const { t } = useLang()
  const { user } = useAuth()
  const items = [
    ['/', 'home', 'nav.home'],
    ['/discover', 'compass', 'nav.discover'],
    // Organizers manage their own events; volunteers see the events they joined.
    user.role === 'organizer' ? ['/organizer', 'calendar', 'org.title'] : ['/my-events', 'calendar', 'nav.myEvents'],
    user.role === 'organizer' ? null : ['/my-hours', 'clock', 'nav.myHours'],
    ['/saved', 'bookmark', 'nav.saved'],
    ['/settings', 'sliders', 'nav.settings'],
  ].filter(Boolean)
  return (
    <nav className="card side-nav">
      {items.map(([to, icon, key]) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <Icon name={icon} size={18} />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  )
}

function RightColumn() {
  const { t } = useLang()
  const upcoming = useAsync(() => getUpcoming(3), [])
  const suggestions = useAsync(getSuggestions, [])
  const trending = useAsync(getTrending, [])

  return (
    <aside className="sticky-col feed-right">
      <section className="card widget">
        <div className="widget-head">
          <h3>{t('feed.upcoming')}</h3>
          <Link to="/discover" className="link xs">
            {t('feed.seeAll')}
          </Link>
        </div>
        {upcoming.data?.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </section>

      <section className="card widget">
        <div className="widget-head">
          <h3>{t('feed.whoToFollow')}</h3>
        </div>
        {suggestions.data?.map((u) => (
          <div className="follow-item" key={u.id}>
            <Link to={`/u/${u.username}`}>
              <Avatar user={u} size={36} />
            </Link>
            <div className="who">
              <Link to={`/u/${u.username}`} className="one-line" title={u.name}>
                <strong>{u.name}</strong>
              </Link>
              <div className="muted xs one-line">
                {u.role === 'organizer'
                  ? `${compact(u.followers)} ${t('user.followers')}`
                  : `${u.hours} ${t('user.hours')}`}
              </div>
            </div>
            <FollowButton userId={u.id} initial={u.isFollowing} />
          </div>
        ))}
      </section>

      <section className="card widget">
        <div className="widget-head">
          <h3>{t('feed.trending')}</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trending.data?.slice(0, 6).map((tag) => (
            <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="chip chip-tag">
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <div className="help-card">
        <Elephant size={40} />
        <p>
          {t('feed.helpPre')} <strong>{t('feed.helpLink')}</strong> {t('feed.helpPost')}
        </p>
      </div>
    </aside>
  )
}

export default function Feed() {
  const { t } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('forYou')
  const feed = useAsync(() => getFeed(tab), [tab])
  const firstName = user.name.split(' ')[0]
  const removePost = (id) => feed.setData((list) => list.filter((p) => p.id !== id))

  return (
    <div className="page">
      <div className="feed-grid">
        <aside className="sticky-col feed-left">
          <MiniProfile user={user} />
          <SideNav />
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card composer">
            <Avatar user={user} size={36} />
            <button type="button" className="composer-input" onClick={() => navigate('/create')}>
              {t('feed.share', { name: firstName })}
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate('/create')}>
              <Icon name="image" size={18} />
              {t('feed.photo')}
            </button>
          </div>

          <div className="tabs" role="tablist">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`tab-pill ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {t(label)}
              </button>
            ))}
          </div>

          {feed.loading && !feed.data && <p className="empty">{t('common.loading')}</p>}
          {feed.error && <p className="card empty">{feed.error.message}</p>}
          {feed.data?.length === 0 && <p className="card empty">{t('feed.empty')}</p>}
          {feed.data?.map((p) => (
            <PostCard key={p.id} post={p} onDeleted={removePost} />
          ))}
        </section>

        <RightColumn />
      </div>
    </div>
  )
}
