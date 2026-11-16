import { api, mock } from './api.js'
import { mapUser } from '../utils/user.js'
import { followingIds, hoursLog, notifications, profileTiles, users } from './mockData.js'

// ---------- Real API ----------

/** GET /users/{username} — returns null when not found. */
export async function getUserByUsername(username) {
  try {
    const res = await api(`/users/${encodeURIComponent(username)}`)
    return mapUser(res.data)
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

/** "Who to follow": a few seeded accounts until a suggestions endpoint exists. */
export async function getSuggestions() {
  const usernames = ['readcambodia', 'darakim', 'healthfriends']
  const list = await Promise.all(usernames.map((u) => getUserByUsername(u).catch(() => null)))
  return list.filter((u) => u && !u.is_me)
}

/**
 * Follow / unfollow. Real users have numeric ids; ids like "u2" belong to
 * mock data still used by the feed and search (until phase 4).
 */
export async function toggleFollow(userId, currentlyFollowing) {
  if (typeof userId === 'number') {
    const res = await api(`/users/${userId}/follow`, { method: currentlyFollowing ? 'DELETE' : 'POST' })
    return res.data.is_following
  }
  if (followingIds.has(userId)) followingIds.delete(userId)
  else followingIds.add(userId)
  return mock(followingIds.has(userId), 80)
}

// ---------- Still mock (later phases) ----------

const withFollow = (u) => ({ ...u, isFollowing: followingIds.has(u.id) })

export function getUserById(id) {
  return users.find((u) => u.id === id)
}

export function searchUsers(q) {
  const s = q.trim().toLowerCase()
  return mock(
    users
      .filter((u) => u.id !== 'u1')
      .filter(
        (u) =>
          !s ||
          u.name.toLowerCase().includes(s) ||
          u.bio.toLowerCase().includes(s) ||
          (s.includes('clean') && ['u2', 'u6', 'u7'].includes(u.id)),
      )
      .map(withFollow),
  )
}

export function getProfileTiles() {
  return mock(profileTiles)
}

export function getHoursLog() {
  return mock(hoursLog)
}

export function getNotifications() {
  return mock(notifications)
}

export function markAllNotificationsRead() {
  notifications.forEach((n) => (n.unread = false))
  return mock(true, 50)
}
