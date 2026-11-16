import { api, qs } from './api.js'
import { localDate, mapEvent } from '../utils/mappers.js'

/** Cities offered in the Location filter. */
export const CITIES = ['Phnom Penh', 'Siem Reap', 'Battambang', 'Kampot', 'Kep']

/**
 * GET /events
 * filters: { q, categories: ['Environment', ...], when: 'any'|'week'|'month', city, freeOnly, perPage }
 */
export async function searchEvents({ q = '', categories = [], when = 'any', city = '', freeOnly = false, perPage } = {}) {
  let to
  if (when !== 'any') {
    const end = new Date()
    if (when === 'week') end.setDate(end.getDate() + 7)
    if (when === 'month') end.setMonth(end.getMonth() + 1)
    to = localDate(end)
  }

  const res = await api(
    `/events${qs({
      search: q.trim(),
      category: categories.map((c) => c.toLowerCase()).join(','),
      location: city,
      to,
      has_spots: freeOnly,
      per_page: perPage,
    })}`,
  )
  return res.data.map(mapEvent)
}

export function getUpcoming(limit = 3) {
  return searchEvents({ perPage: limit })
}

/** GET /events/{id} — null when it does not exist. */
export async function getEvent(id) {
  try {
    const res = await api(`/events/${id}`)
    return mapEvent(res.data)
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

/** Join or leave. Returns the updated event. */
export async function toggleJoin(event) {
  const res = await api(`/events/${event.id}/register`, { method: event.isJoined ? 'DELETE' : 'POST' })
  return mapEvent(res.data)
}

/** Save or unsave. Returns true when the event is now saved. */
export async function toggleSave(event) {
  const res = await api(`/events/${event.id}/save`, { method: event.isSaved ? 'DELETE' : 'POST' })
  return res.data.is_saved_by_me
}

/** Events a user joined (or, for organizers, runs). */
export async function getUserEvents(username) {
  const res = await api(`/users/${encodeURIComponent(username)}/events`)
  return res.data.map(mapEvent)
}

export async function getSavedEvents() {
  const res = await api('/me/saved-events')
  return res.data.map(mapEvent)
}
