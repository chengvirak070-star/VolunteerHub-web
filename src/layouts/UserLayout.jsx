import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import Logo from '../components/ui/Logo.jsx'
import LangSwitch from '../components/ui/LangSwitch.jsx'
import Avatar from '../components/user/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../i18n/index.jsx'
import BugReportDialog from '../components/ui/BugReportDialog.jsx'
import { openBugReport } from '../services/api.js'
import Toast from '../components/ui/Toast.jsx'
import { useToast } from '../hooks/useToast.js'
import { showDesktopNotification } from '../services/desktopNotify.js'
import { getNotifications, markNotificationRead } from '../services/userService.js'

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
          {user.role === 'organizer' ? (
            <>
              <Link to="/organizer">
                <Icon name="calendar" size={18} /> {t('org.title')}
              </Link>
              <Link to="/organizer/events/new">
                <Icon name="plus" size={18} /> {t('org.create')}
              </Link>
            </>
          ) : (
            <Link to="/my-hours">
              <Icon name="clock" size={18} /> {t('nav.myHours')}
            </Link>
          )}
          <button type="button" onClick={openBugReport}>
            <Icon name="flag" size={18} /> {t('bug.menu')}
          </button>
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
/**
 * Checks for notifications every 30 s: keeps the bell's unread number up to date and,
 * for anything NEW since the page opened, shows a Windows notification (when VolunteerHub
 * is in the background) or a small in-site message (when you are looking at it).
 */
function useNotificationWatcher(onNotificationsPage, openNotification) {
  const [count, setCount] = useState(0)
  const seen = useRef(null) // ids already known; null until the first check
  const openRef = useRef(openNotification)

  useEffect(() => {
    openRef.current = openNotification
  }, [openNotification])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const { items, unread } = await getNotifications()
        if (!alive) return
        setCount(unread)

        const fresh = seen.current ? items.filter((n) => n.unread && !seen.current.has(n.id)) : []
        seen.current = new Set([...(seen.current ?? []), ...items.map((n) => n.id)])

        // Oldest first, at most 3 at once
        for (const n of fresh.slice(0, 3).reverse()) {
          const inBackground = document.hidden || !document.hasFocus()
          const shown = inBackground && (await showDesktopNotification(n, openRef.current))
          if (!shown) {
            const who = ['like', 'comment', 'follow'].includes(n.type) && n.actor ? `${n.actor.name} ` : ''
            window.dispatchEvent(new CustomEvent('vh-toast', { detail: `🔔 ${who}${n.text}` }))
          }
        }
      } catch {
        /* offline or server asleep: try again next time */
      }
    }
    load()
    window.addEventListener('vh-notifications-read', load)
    const timer = setInterval(load, 30000)
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
  const navigate = useNavigate()
  // Clicking a Windows notification: mark it read and open the right page
  const openNotification = useCallback(
    (n) => {
      markNotificationRead(n.id).catch(() => {})
      navigate(n.link || '/notifications')
    },
    [navigate],
  )
  const unread = useNotificationWatcher(location.pathname === '/notifications', openNotification)
  const navCls = ({ isActive }) => `icon-btn ${isActive ? 'active' : ''}`

  // Any component can call toast('message') from services/api.js
  const [toastMessage, showToast] = useToast(3000)

  // "Report a problem" box: opened from the profile menu, Settings or the help card
  const [bugOpen, setBugOpen] = useState(false)
  useEffect(() => {
    const open = () => setBugOpen(true)
    window.addEventListener('vh-open-bug-report', open)
    return () => window.removeEventListener('vh-open-bug-report', open)
  }, [])
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
            <Logo height={30} />
          </Link>
          <SearchBox key={urlQ} initial={urlQ} />
          <nav className="topbar-actions">
            {/* On phones these 3 live in the bottom menu instead (see .bottom-nav) */}
            <NavLink to="/" end className={(s) => `${navCls(s)} hide-phone`} aria-label={t('nav.home')}>
              <Icon name="home" size={20} />
            </NavLink>
            <NavLink to="/discover" className={(s) => `${navCls(s)} hide-phone`} aria-label={t('nav.discover')}>
              <Icon name="compass" size={20} />
            </NavLink>
            <NavLink to="/notifications" className={(s) => `${navCls(s)} hide-phone`} aria-label={t('nav.notifications')}>
              <Icon name="bell" size={20} />
              {unread > 0 && <span className="badge-dot">{unread}</span>}
            </NavLink>
            {/* Phone only: the search box doesn't fit, so this opens the search page */}
            <NavLink to="/search" className={(s) => `${navCls(s)} show-phone`} aria-label={t('nav.search')}>
              <Icon name="search" size={20} />
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
          <span className="bottom-icon">
            <Icon name="bell" size={22} />
            {unread > 0 && <span className="badge-dot">{unread > 99 ? '99+' : unread}</span>}
          </span>
          {t('nav.notifications')}
        </NavLink>
        <NavLink to={`/u/${user.username}`}>
          <Icon name="user" size={22} />
          {t('nav.profile')}
        </NavLink>
      </nav>

      <Toast message={toastMessage} />
      {bugOpen && <BugReportDialog page={location.pathname + location.search} onClose={() => setBugOpen(false)} />}
    </>
  )
}
