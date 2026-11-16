import { mock } from './api.js'
import { followingIds, posts, trending, users } from './mockData.js'
import { getEventSync } from './eventService.js'

function decorate(p) {
  return {
    ...p,
    author: users.find((u) => u.id === p.authorId),
    event: p.eventId ? getEventSync(p.eventId) : null,
    comments: p.comments.map((c) => ({ ...c, user: users.find((u) => u.id === c.userId) })),
  }
}

/** tab: 'forYou' | 'following' | 'events' */
export function getFeed(tab = 'forYou') {
  let list = posts
  if (tab === 'following') list = posts.filter((p) => followingIds.has(p.authorId) || p.authorId === 'u1')
  if (tab === 'events') list = posts.filter((p) => p.eventId)
  return mock(list.map(decorate))
}

export function toggleLike(id) {
  const p = posts.find((x) => x.id === id)
  p.likedByMe = !p.likedByMe
  p.likes += p.likedByMe ? 1 : -1
  return mock({ liked: p.likedByMe, likes: p.likes }, 60)
}

export function addComment(postId, userId, text) {
  const p = posts.find((x) => x.id === postId)
  const c = { id: `c${Date.now()}`, userId, text }
  p.comments.push(c)
  p.commentCount += 1
  return mock({ ...c, user: users.find((u) => u.id === userId) }, 80)
}

export function createPost({ authorId, text, image, eventId }) {
  const p = {
    id: `p${Date.now()}`,
    authorId,
    ago: 'just now',
    text,
    image: image || null,
    tint: image ? null : undefined,
    eventId: eventId || null,
    likes: 0,
    likedByMe: false,
    comments: [],
    commentCount: 0,
  }
  posts.unshift(p)
  return mock(decorate(p))
}

export function getTrending() {
  return mock(trending)
}
