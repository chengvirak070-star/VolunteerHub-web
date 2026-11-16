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
import Profile from './pages/Profile/Profile.jsx'
import Search from './pages/Search/Search.jsx'
import Settings from './pages/Settings/Settings.jsx'

const Loading = SplashScreen

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
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
        <Route path="u/:username" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="my-hours" element={<MyHours />} />
        <Route path="my-events" element={<MyEvents mode="joined" />} />
        <Route path="saved" element={<MyEvents mode="saved" />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
