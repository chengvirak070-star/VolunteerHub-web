// Windows / desktop notifications using the browser's Notification API.
// They appear while VolunteerHub is open in a browser tab (also in the background).

const KEY = 'vh-desktop-notifications'

export const desktopSupported = () => typeof window !== 'undefined' && 'Notification' in window

/** 'granted' | 'denied' | 'default' | 'unsupported' */
export const desktopPermission = () => (desktopSupported() ? Notification.permission : 'unsupported')

/** The user's own on/off switch (on by default once permission is granted). */
export function desktopEnabled() {
  try {
    return desktopPermission() === 'granted' && localStorage.getItem(KEY) !== 'off'
  } catch {
    return desktopPermission() === 'granted'
  }
}

export function setDesktopEnabled(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event('vh-desktop-notify-changed'))
}

/** Asks the browser for permission. Returns the new permission. */
export async function requestDesktopPermission() {
  if (!desktopSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  if (result === 'granted') setDesktopEnabled(true)
  window.dispatchEvent(new Event('vh-desktop-notify-changed'))
  return result
}

// Windows shows PNG icons more reliably than SVG, so draw the logo pin into a PNG once.
let iconPromise = null
function iconUrl() {
  if (!iconPromise) {
    iconPromise = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const c = document.createElement('canvas')
          c.width = 128
          c.height = 128
          const ctx = c.getContext('2d')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, 128, 128)
          ctx.drawImage(img, 22, 14, 84, 100)
          resolve(c.toDataURL('image/png'))
        } catch {
          resolve('/favicon.svg')
        }
      }
      img.onerror = () => resolve('/favicon.svg')
      img.src = '/favicon.svg'
    })
  }
  return iconPromise
}

/**
 * Shows one notification. n = mapped notification { id, type, actor, text, link }.
 * onClick(n) runs when the user clicks it (open the right page).
 */
export async function showDesktopNotification(n, onClick) {
  if (!desktopEnabled()) return false
  const withName = ['like', 'comment', 'follow'].includes(n.type) && n.actor
  const title = withName ? n.actor.name : 'VolunteerHub'
  const body = withName ? `${n.actor.name} ${n.text}` : n.text
  try {
    const note = new Notification(title, { body, icon: await iconUrl(), tag: `vh-${n.id}` })
    note.onclick = () => {
      window.focus()
      onClick?.(n)
      note.close()
    }
    return true
  } catch {
    return false
  }
}
