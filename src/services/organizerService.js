// Organizer side: create/edit own events, see registrations, mark attendance.
import { api } from './api.js'
import { mapEvent } from '../utils/mappers.js'
import { mapUser } from '../utils/user.js'

export async function getMyOrganizedEvents() {
  const res = await api('/organizer/events')
  return res.data.map(mapEvent)
}

/** For the edit form: the raw API event (dates, category id…). */
export async function getEventRaw(id) {
  const res = await api(`/events/${id}`)
  return res.data
}

/**
 * values: { title, description, categoryId, location, startsAt, endsAt, hours, capacity, cover (File|null) }
 * startsAt / endsAt are 'YYYY-MM-DD HH:mm' in Cambodia time.
 */
function toForm(values, method) {
  const form = new FormData()
  if (method) form.append('_method', method)
  form.append('title', values.title)
  form.append('description', values.description)
  form.append('category_id', values.categoryId)
  form.append('location', values.location)
  form.append('starts_at', values.startsAt)
  form.append('ends_at', values.endsAt)
  form.append('hours', values.hours)
  form.append('capacity', values.capacity)
  if (values.cover) form.append('cover', values.cover)
  // Map pin (empty = no pin)
  form.append('latitude', values.latitude ?? '')
  form.append('longitude', values.longitude ?? '')
  return form
}

export async function createEvent(values) {
  const res = await api('/organizer/events', { method: 'POST', body: toForm(values) })
  return mapEvent(res.data)
}

export async function updateEvent(id, values) {
  const res = await api(`/organizer/events/${id}`, { method: 'POST', body: toForm(values, 'PUT') })
  return mapEvent(res.data)
}

export async function deleteEvent(id) {
  await api(`/organizer/events/${id}`, { method: 'DELETE' })
}

/** [{ id, status, user, hourLog: { hours, status } | null }] */
export async function getRegistrations(eventId) {
  const res = await api(`/organizer/events/${eventId}/registrations`)
  return res.data.map((r) => ({
    id: r.id,
    status: r.status,
    user: mapUser(r.user),
    hourLog: r.hour_log,
  }))
}

/** status: 'attended' | 'absent' */
export async function markAttendance(registrationId, status) {
  const res = await api(`/organizer/registrations/${registrationId}/attendance`, {
    method: 'POST',
    body: { status },
  })
  return { id: res.data.id, status: res.data.status, user: mapUser(res.data.user), hourLog: res.data.hour_log }
}
