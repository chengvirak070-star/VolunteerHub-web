// Helpers for map locations (OpenStreetMap on the page, links open Google Maps).

/** Map centers used when no pin is set yet. [lat, lng] */
export const CITY_CENTERS = {
  'Phnom Penh': [11.5564, 104.9282],
  'Siem Reap': [13.3633, 103.8564],
  Battambang: [13.0957, 103.2022],
  Kampot: [10.6104, 104.1815],
  Kep: [10.4836, 104.3165],
}
export const CAMBODIA_CENTER = [12.5657, 104.991]

/** Link that opens the place in Google Maps. */
export function googleMapsUrl(lat, lng, label) {
  if (lat != null && lng != null) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || '')}`
}

/** Link that starts Google Maps directions to the place. */
export function googleDirectionsUrl(lat, lng, label) {
  const dest = lat != null && lng != null ? `${lat},${lng}` : encodeURIComponent(label || '')
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`
}

/**
 * Reads coordinates from a pasted Google Maps link or plain "lat, lng" text.
 * Works with links like:
 *   https://www.google.com/maps/place/.../@11.5726,104.93,17z
 *   https://maps.google.com/?q=11.5726,104.93
 *   https://www.google.com/maps/place/...!3d11.5726!4d104.93
 *   11.5726, 104.93
 * Returns [lat, lng] or null. (Short links like maps.app.goo.gl can't be read — open them first and copy the long link.)
 */
export function parseCoordinates(text) {
  if (!text) return null
  const s = decodeURIComponent(text.trim())
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // place data (most exact)
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/, // map view
    /[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/, // ?q=lat,lng
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/, // "lat, lng"
  ]
  for (const p of patterns) {
    const m = s.match(p)
    if (m) {
      const lat = Number(m[1])
      const lng = Number(m[2])
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [round(lat), round(lng)]
    }
  }
  return null
}

export const round = (n) => Math.round(n * 1e6) / 1e6

/**
 * Search places in Cambodia with OpenStreetMap (Nominatim). Free; meant for light use.
 * Returns [{ name, lat, lng }].
 */
export async function searchPlaces(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=kh&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Place search is not available right now.')
  const list = await res.json()
  return list.map((p) => ({ name: p.display_name, lat: round(Number(p.lat)), lng: round(Number(p.lon)) }))
}
