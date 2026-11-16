import { mock } from './api.js'
import { events, joinedEventIds, savedEventIds, users } from './mockData.js'

const TODAY = new Date('2026-11-16T00:00:00')

function decorate(e) {
  return {
    ...e,
    organizer: users.find((u) => u.id === e.organizerId),
    spotsLeft: Math.max(0, e.capacity - e.joined),
    isJoined: joinedEventIds.has(e.id),
    isSaved: savedEventIds.has(e.id),
  }
}

export function getEventSync(id) {
  const e = events.find((x) => x.id === id)
  return e ? decorate(e) : null
}

export function getEvent(id) {
  const e = events.find((x) => x.id === id)
  if (!e) return mock(null)
  const d = decorate(e)
  d.attendeeUsers = e.attendees.map((uid) => users.find((u) => u.id === uid)).filter(Boolean)
  d.questions = e.questions.map((q) => ({ ...q, user: users.find((u) => u.id === q.userId) }))
  return mock(d)
}

export function getUpcoming(limit = 3) {
  return mock(
    [...events]
      .filter((e) => new Date(e.date) >= TODAY && e.city === 'Phnom Penh')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit)
      .map(decorate),
  )
}

/**
 * filters: { q, categories: string[], when: 'any'|'week'|'month', city, freeOnly }
 */
export function searchEvents({ q = '', categories = [], when = 'any', city = '', freeOnly = false } = {}) {
  const s = q.trim().toLowerCase()
  const weekEnd = new Date(TODAY)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const monthEnd = new Date(TODAY)
  monthEnd.setMonth(monthEnd.getMonth() + 1)

  const list = events
    .map(decorate)
    .filter((e) => new Date(e.date) >= TODAY)
    .filter((e) => {
      if (!s) return true
      const hay = `${e.title} ${e.description} ${e.place} ${e.city} ${e.organizer?.name}`.toLowerCase()
      return hay.includes(s) || (s === 'cleanup' && hay.includes('recycl'))
    })
    .filter((e) => categories.length === 0 || e.categories.some((c) => categories.includes(c)))
    .filter((e) => {
      const d = new Date(e.date)
      if (when === 'week') return d <= weekEnd
      if (when === 'month') return d <= monthEnd
      return true
    })
    .filter((e) => !city || e.city === city)
    .filter((e) => !freeOnly || e.spotsLeft > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  return mock(list)
}

export function getCities() {
  return [...new Set(events.map((e) => e.city))]
}

export function toggleJoin(id) {
  const e = events.find((x) => x.id === id)
  if (!e) return mock(null)
  if (joinedEventIds.has(id)) {
    joinedEventIds.delete(id)
    e.joined -= 1
    e.attendees = e.attendees.filter((u) => u !== 'u1')
  } else {
    if (e.joined >= e.capacity) return Promise.reject(new Error('Event is full'))
    joinedEventIds.add(id)
    e.joined += 1
    e.attendees = ['u1', ...e.attendees]
  }
  return mock(decorate(e), 120)
}

export function toggleSave(id) {
  if (savedEventIds.has(id)) savedEventIds.delete(id)
  else savedEventIds.add(id)
  return mock(savedEventIds.has(id), 60)
}

export function askQuestion(id, userId, text) {
  const e = events.find((x) => x.id === id)
  const q = { id: `q${Date.now()}`, userId, text, ago: 'just now' }
  e.questions.push(q)
  return mock({ ...q, user: users.find((u) => u.id === userId) })
}

export function getJoinedEvents() {
  return mock(events.filter((e) => joinedEventIds.has(e.id)).map(decorate))
}

export function getSavedEvents() {
  return mock(events.filter((e) => savedEventIds.has(e.id)).map(decorate))
}
