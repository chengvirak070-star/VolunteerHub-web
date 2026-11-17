import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SplashScreen from './components/ui/SplashScreen.jsx'
import { useAuth } from './context/AuthContext.jsx'
import UserLayout from './layouts/UserLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import CreatePost from './pages/CreatePost/CreatePost.jsx'
import Discover from './pages/Discover/Discover.jsx'
import EventDetail from './pages/EventDetail/EventDetail.jsx'
import Feed from './pages/Feed/Feed.jsx'
import MyEvents from './pages/MyEvents/MyEvents.jsx'
import MyHours from './pages/MyHours/MyHours.jsx'
import Notifications from './pages/Notifications/Notifications.jsx'
import Attendance from './pages/Organizer/Attendance.jsx'
import EventForm from './pages/Organizer/EventForm.jsx'
import OrganizerEvents from './pages/Organizer/OrganizerEvents.jsx'
import PostDetail from './pages/PostDetail/PostDetail.jsx'
import EditProfile from './pages/Profile/EditProfile.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Search from './pages/Search/Search.jsx'
import Settings from './pages/Settings/Settings.jsx'

// Splash while starting; explains a slow (sleeping) server; offers "Try again" if it never answers.
function StartupScreen() {
  const { waking, offline } = useAuth()
  if (offline) return <SplashScreen offline message="Can't reach the server right now. Your login is saved." />
  return <SplashScreen message={waking ? 'Connecting to server… (this can take up to a minute)' : undefined} />
}

function RequireAuth({ children }) {
  const { user, loading, offline } = useAuth()
  const location = useLocation()
  if (loading || offline) return <StartupScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

// Organizer pages: other roles are sent home.
function OrganizerOnly({ children }) {
  const { user } = useAuth()
  return user?.role === 'organizer' ? children : <Navigate to="/" replace />
}

function GuestOnly({ children }) {
  const { user, loading, offline } = useAuth()
  if (loading || offline) return <StartupScreen />
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route element={<RequireAuth><UserLayout /></RequireAuth>}>
        <Route index element={<Feed />} />
        <Route path="discover" element={<Discover />} />
        <Route path="search" element={<Search />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="create" element={<CreatePost />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="u/:username" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="my-hours" element={<MyHours />} />
        <Route path="my-events" element={<MyEvents mode="joined" />} />
        <Route path="saved" element={<MyEvents mode="saved" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="organizer" element={<OrganizerOnly><OrganizerEvents /></OrganizerOnly>} />
        <Route path="organizer/events/new" element={<OrganizerOnly><EventForm /></OrganizerOnly>} />
        <Route path="organizer/events/:id/edit" element={<OrganizerOnly><EventForm /></OrganizerOnly>} />
        <Route path="organizer/events/:id/attendance" element={<OrganizerOnly><Attendance /></OrganizerOnly>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
