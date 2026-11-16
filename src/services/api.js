// Talks to the Laravel API (volunteerhub-api).
// Set the address in volunteerhub-web/.env  ->  VITE_API_URL=http://localhost:8000/api
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

let token = null
let onUnauthorized = null

export function setToken(t) {
  token = t
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors // Laravel validation errors: { field: [messages] }
  }
}

/**
 * api('/auth/me')
 * api('/auth/login', { method: 'POST', body: { email, password } })
 * api('/profile', { method: 'POST', body: formData })   // FormData for file uploads
 */
export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData
  const headers = { Accept: 'application/json' }
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is "php artisan serve" running?', 0)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.()

    // Server crashed (e.g. database is off): show a simple message, keep details in the console.
    if (res.status >= 500) {
      console.error(`API ${method} ${path} failed (${res.status}):`, data?.message || data)
      throw new ApiError('Something went wrong on the server. Please try again in a moment.', res.status)
    }

    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null
    throw new ApiError(firstError || data?.message || `Request failed (${res.status})`, res.status, data?.errors)
  }

  return data
}

// (unused) fake delay helper, kept for quick experiments.
export function mock(value, ms = 150) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
}

/** Builds "?a=1&b=2" from an object, skipping empty values. */
export function qs(params = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, v === true ? '1' : v)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Downloads a file (e.g. the PDF certificate) that needs the login token. */
export async function downloadFile(path, filename) {
  let res
  try {
    res = await fetch(BASE_URL + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new ApiError('Cannot reach the server.', 0)
  }
  if (!res.ok) throw new ApiError(`Download failed (${res.status})`, res.status)
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Shows a small message at the bottom of the screen from anywhere (see UserLayout). */
export function toast(message) {
  window.dispatchEvent(new CustomEvent('vh-toast', { detail: message }))
}
