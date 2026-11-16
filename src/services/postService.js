import { api, qs } from './api.js'
import { mapComment, mapPost } from '../utils/mappers.js'

const TABS = { forYou: 'for_you', following: 'following', events: 'events' }

/** GET /feed — tab: 'forYou' | 'following' | 'events' */
export async function getFeed(tab = 'forYou') {
  const res = await api(`/feed${qs({ tab: TABS[tab] || 'for_you' })}`)
  return res.data.map(mapPost)
}

export async function getPost(id) {
  try {
    const res = await api(`/posts/${id}`)
    return mapPost(res.data)
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

export async function getUserPosts(username) {
  const res = await api(`/users/${encodeURIComponent(username)}/posts`)
  return res.data.map(mapPost)
}

/** Search posts. A query starting with # searches by hashtag. */
export async function searchPosts(q) {
  if (!q.trim()) return []
  const res = await api(`/search${qs({ q: q.trim(), type: 'posts' })}`)
  return res.data.posts.map(mapPost)
}

/** Like or unlike. Returns { liked, likes }. */
export async function toggleLike(postId, currentlyLiked) {
  const res = await api(`/posts/${postId}/like`, { method: currentlyLiked ? 'DELETE' : 'POST' })
  return { liked: res.data.is_liked_by_me, likes: res.data.likes_count }
}

export async function getComments(postId) {
  const res = await api(`/posts/${postId}/comments`)
  return res.data.map(mapComment)
}

export async function addComment(postId, text) {
  const res = await api(`/posts/${postId}/comments`, { method: 'POST', body: { body: text } })
  return mapComment(res.data)
}

/** POST /posts — image is a File (or null). */
export async function createPost({ text, image, eventId }) {
  const form = new FormData()
  form.append('body', text)
  if (image) form.append('image', image)
  if (eventId) form.append('event_id', eventId)
  const res = await api('/posts', { method: 'POST', body: form })
  return mapPost(res.data)
}

export async function deletePost(postId) {
  await api(`/posts/${postId}`, { method: 'DELETE' })
}

/** ['#rivercleanup', ...] */
export async function getTrending() {
  const res = await api('/hashtags/trending')
  return res.data.map((h) => `#${h.name}`)
}
