import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import LangSwitch from '../components/ui/LangSwitch.jsx'
import Avatar from '../components/user/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../i18n/index.jsx'
import Toast from '../components/ui/Toast.jsx'
import { useToast } from '../hooks/useToast.js'
import { getUnreadCount } from '../services/userService.js'

// Remounted (via key) whenever the URL query changes, e.g. clicking a hashtag
function SearchBox({ initial }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const [q, setQ] = useState(initial)

  return (
    <form
      className="searchbox"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      }}
    >
      <Icon name="search" size={16} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('nav.search')}
        aria-label={t('nav.search')}
      />
    </form>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()
  const onProfile = location.pathname === `/u/${user.username}`

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`avatar-btn ${onProfile ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size={38} />
      </button>
      {open && (
        <div className="card user-menu" role="menu" onClick={() => setOpen(false)}>
          <Link to={`/u/${user.username}`}>
            <Icon name="user" size={18} /> {t('nav.profile')}
          </Link>
          <Link to="/my-hours">
            <Icon name="clock" size={18} /> {t('nav.myHours')}
          </Link>
          <div className="divider" style={{ margin: '4px 0' }} />
          <button type="button" onClick={logout}>
            <Icon name="logout" size={18} /> {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

// Unread notification count for the bell: loaded on start, every minute,
// and again when notifications are read or the notifications page is opened/left.
function useUnreadCount(onNotificationsPage) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true
    const load = () =>
      getUnreadCount()
        .then((n) => alive && setCount(n))
        .catch(() => {})
    load()
    window.addEventListener('vh-notifications-read', load)
    const timer = setInterval(load, 60000)
    return () => {
      alive = false
      window.removeEventListener('vh-notifications-read', load)
      clearInterval(timer)
    }
  }, [onNotificationsPage])

  return count
}

export default function UserLayout() {
  const { t } = useLang()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const location = useLocation()
  const urlQ = location.pathname === '/search' ? params.get('q') || '' : ''
  const unread = useUnreadCount(location.pathname === '/notifications')
  const navCls = ({ isActive }) => `icon-btn ${isActive ? 'active' : ''}`

  // Any component can call toast('message') from services/api.js
  const [toastMessage, showToast] = useToast(3000)
  useEffect(() => {
    const onToast = (e) => showToast(e.detail)
    window.addEventListener('vh-toast', onToast)
    return () => window.removeEventListener('vh-toast', onToast)
  }, [showToast])

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="logo" aria-label="VolunteerHub home">
            Volunteer<span>Hub</span>
          </Link>
          <SearchBox key={urlQ} initial={urlQ} />
          <nav className="topbar-actions">
            <NavLink to="/" end className={navCls} aria-label={t('nav.home')}>
              <Icon name="home" size={20} />
            </NavLink>
            <NavLink to="/discover" className={navCls} aria-label={t('nav.discover')}>
              <Icon name="compass" size={20} />
            </NavLink>
            <NavLink to="/notifications" className={navCls} aria-label={t('nav.notifications')}>
              <Icon name="bell" size={20} />
              {unread > 0 && <span className="badge-dot">{unread}</span>}
            </NavLink>
            <Link to="/create" className="btn btn-primary hide-phone" style={{ marginLeft: 8 }}>
              <Icon name="plus" size={18} strokeWidth={2.2} />
              {t('nav.createPost')}
            </Link>
            <LangSwitch className="hide-phone" />
            <UserMenu />
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Bottom menu on phone */}
      <nav className="bottom-nav" aria-label="Main">
        <NavLink to="/" end>
          <Icon name="home" size={22} />
          {t('nav.home')}
        </NavLink>
        <NavLink to="/discover">
          <Icon name="compass" size={22} />
          {t('nav.discover')}
        </NavLink>
        <NavLink to="/create" className="create">
          <span className="plus">
            <Icon name="plus" size={20} strokeWidth={2.4} />
          </span>
        </NavLink>
        <NavLink to="/notifications">
          <Icon name="bell" size={22} />
          {t('nav.notifications')}
        </NavLink>
        <NavLink to={`/u/${user.username}`}>
          <Icon name="user" size={22} />
          {t('nav.profile')}
        </NavLink>
      </nav>

      <Toast message={toastMessage} />
    </>
  )
}
