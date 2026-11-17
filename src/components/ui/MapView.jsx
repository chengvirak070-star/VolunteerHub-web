import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

// Teal VolunteerHub pin (same shape as the logo), used instead of Leaflet's default image marker.
const PIN = L.divIcon({
  className: 'vh-map-pin',
  html: '<svg viewBox="6 2 52 62" width="34" height="40"><path fill="#0F9D8A" stroke="#fff" stroke-width="3" d="M32 4C18.7 4 8 14.7 8 28c0 17 24 34 24 34s24-17 24-34C56 14.7 45.3 4 32 4z"/><path fill="#fff" d="M32 38s-11-7-11-14.5c0-3.6 2.9-6.5 6.5-6.5 1.9 0 3.6.9 4.5 2.3.9-1.4 2.6-2.3 4.5-2.3 3.6 0 6.5 2.9 6.5 6.5C43 31 32 38 32 38z"/></svg>',
  iconSize: [34, 40],
  iconAnchor: [17, 40],
})

/**
 * OpenStreetMap map with an optional pin.
 *   position: [lat, lng] | null   — where the pin is
 *   center:   [lat, lng]          — where to look when there is no pin
 *   onPick(lat, lng)              — if given, clicking/dragging moves the pin (editing mode)
 */
export default function MapView({ position, center, zoom = 15, onPick, height = 260 }) {
  const box = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const pickRef = useRef(onPick)

  useEffect(() => {
    pickRef.current = onPick
  }, [onPick])

  // Create the map once
  useEffect(() => {
    const m = L.map(box.current, { scrollWheelZoom: false, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    m.on('click', (e) => pickRef.current?.(e.latlng.lat, e.latlng.lng))
    map.current = m
    return () => {
      m.remove()
      map.current = null
      marker.current = null
    }
  }, [])

  // Move / add the pin and the view
  useEffect(() => {
    const m = map.current
    if (!m) return
    if (position) {
      if (!marker.current) {
        marker.current = L.marker(position, { icon: PIN, draggable: Boolean(pickRef.current) }).addTo(m)
        marker.current.on('dragend', () => {
          const p = marker.current.getLatLng()
          pickRef.current?.(p.lat, p.lng)
        })
      } else {
        marker.current.setLatLng(position)
      }
      // Zoom in when the pin jumps somewhere new (search, link); keep the zoom for small moves (tap, drag)
      const far = !m._loaded || m.getCenter().distanceTo(position) > 2000
      m.setView(position, far ? zoom : m.getZoom())
    } else {
      marker.current?.remove()
      marker.current = null
      m.setView(center, 12)
    }
  }, [position?.[0], position?.[1], center?.[0], center?.[1]]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box} className="map-view" style={{ height }} />
}
