import { api, downloadFile, qs } from './api.js'
import { mapHourLog, mapNotification } from '../utils/mappers.js'
import { mapUser } from '../utils/user.js'

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

/** "Who to follow": the most-followed accounts you don't follow yet. */
export async function getSuggestions() {
  const res = await api(`/search${qs({ type: 'people' })}`)
  return res.data.people
    .filter((u) => !u.is_following)
    .slice(0, 3)
    .map(mapUser)
}

export async function searchUsers(q) {
  const res = await api(`/search${qs({ q: q.trim(), type: 'people' })}`)
  return res.data.people.map(mapUser)
}

/** Follow / unfollow. Returns true when you now follow the user. */
export async function toggleFollow(userId, currentlyFollowing) {
  const res = await api(`/users/${userId}/follow`, { method: currentlyFollowing ? 'DELETE' : 'POST' })
  return res.data.is_following
}

/** My hour logs + totals: { rows, approved, pending, attended } */
export async function getMyHours() {
  const res = await api('/me/hours')
  return {
    rows: res.data.map(mapHourLog),
    approved: res.meta.approved_hours,
    pending: res.meta.pending_hours,
    attended: res.meta.events_attended,
  }
}

export async function getUserHours(username) {
  const res = await api(`/users/${encodeURIComponent(username)}/hours`)
  return res.data.map(mapHourLog)
}

export function downloadCertificate(username) {
  return downloadFile('/me/certificate', `volunteerhub-certificate-${username}.pdf`)
}

/** { items, unread } */
export async function getNotifications() {
  const res = await api('/notifications')
  return { items: res.data.map(mapNotification), unread: res.meta.unread_count }
}

export async function getUnreadCount() {
  const res = await api('/notifications')
  return res.meta.unread_count
}

export async function markAllNotificationsRead() {
  await api('/notifications/read-all', { method: 'POST' })
}

export async function markNotificationRead(id) {
  await api(`/notifications/${id}/read`, { method: 'POST' })
}
