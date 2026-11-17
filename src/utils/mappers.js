// Convert API responses into the shapes the UI components use.
import { mapUser } from './user.js'

const TINT_BY_CATEGORY = { environment: 'mint', education: 'slate', health: 'green', community: 'peach' }
const TINTS = ['mint', 'peach', 'slate', 'green']

const pad = (n) => String(n).padStart(2, '0')

/** Date -> 'YYYY-MM-DD' in the visitor's local time. */
export function localDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Date -> '7:00 AM' */
export function timeStr(d) {
  const h = d.getHours()
  return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`
}

/** '2026-11-17T08:00:00+07:00' -> '25 min ago' */
export function timeAgo(iso) {
  const then = new Date(iso)
  const mins = Math.floor((Date.now() - then.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function splitLocation(location = '') {
  const [place, ...rest] = location.split(',')
  return { place: place.trim(), city: rest.join(',').trim() }
}

export function mapEvent(e) {
  if (!e) return null
  const start = new Date(e.starts_at)
  const end = e.ends_at ? new Date(e.ends_at) : null
  const org = e.organization
  const owner = org?.user

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    lat: e.latitude ?? null,
    lng: e.longitude ?? null,
    ...splitLocation(e.location),
    date: localDate(start),
    start: timeStr(start),
    end: end ? timeStr(end) : '',
    isPast: start.getTime() < Date.now(),
    hours: e.hours,
    capacity: e.capacity,
    joined: e.joined_count ?? 0,
    spotsLeft: e.spots_left ?? 0,
    isJoined: Boolean(e.is_joined_by_me),
    isSaved: Boolean(e.is_saved_by_me),
    status: e.status,
    image: e.cover_url,
    tint: TINT_BY_CATEGORY[e.category?.slug] || 'mint',
    category: e.category,

    organizer: owner
      ? {
          ...mapUser({
            id: owner.id,
            name: org.name,
            username: owner.username,
            avatar_url: org.logo_url || owner.avatar_url,
            role: 'organizer',
            verified: org.verified,
            followers_count: owner.followers_count,
            is_following: owner.is_following,
          }),
          eventsCount: org.events_count,
        }
      : org
        ? { name: org.name, verified: org.verified }
        : null,
    attendeeUsers: (e.attendees || []).map(mapUser),
    friendsGoing: e.friends_going_count ?? 0,
  }
}

export function mapPost(p) {
  if (!p) return null
  const ev = p.event
  return {
    id: p.id,
    author: mapUser(p.author),
    ago: timeAgo(p.created_at),
    text: p.body,
    image: p.image_url,
    tint: TINTS[p.id % TINTS.length], // colour used for the profile grid tile when there is no photo
    hashtags: p.hashtags || [],
    likes: p.likes_count ?? 0,
    likedByMe: Boolean(p.is_liked_by_me),
    commentCount: p.comments_count ?? 0,
    event: ev
      ? {
          id: ev.id,
          title: ev.title,
          ...splitLocation(ev.location),
          date: localDate(new Date(ev.starts_at)),
          status: ev.status,
          spotsLeft: ev.spots_left ?? 0,
          isJoined: Boolean(ev.is_joined_by_me),
        }
      : null,
  }
}

export function mapComment(c) {
  return { id: c.id, user: mapUser(c.author), text: c.body, ago: timeAgo(c.created_at) }
}

export function mapHourLog(l) {
  return {
    id: l.id,
    event: l.event?.title ?? '—',
    organizer: l.event?.organization ?? '—',
    date: l.event?.starts_at ? localDate(new Date(l.event.starts_at)) : null,
    hours: l.hours,
    status: l.status, // pending | approved | declined
  }
}

export function mapNotification(n) {
  return {
    id: n.id,
    type: n.type,
    actor: n.actor ? mapUser(n.actor) : null,
    text: n.message,
    link: n.link,
    ago: timeAgo(n.created_at),
    unread: !n.read_at,
  }
}
