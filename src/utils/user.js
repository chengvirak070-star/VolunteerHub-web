const COLORS = ['#b5541a', '#14967f', '#13263a', '#1f6b45', '#8a3b12', '#2e7d5b']

/** Converts a user from the API into the shape the UI components use. */
export function mapUser(u) {
  if (!u) return null
  const initials = u.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return {
    ...u,
    initials,
    color: COLORS[u.id % COLORS.length],
    avatarUrl: u.avatar_url,
    hours: u.total_hours ?? 0,
    eventsCount: u.role === 'organizer' ? (u.organization?.events_count ?? u.events_count) : u.events_count,
    followers: u.followers_count ?? 0,
    following: u.following_count ?? 0,
    isFollowing: u.is_following ?? false,
  }
}
