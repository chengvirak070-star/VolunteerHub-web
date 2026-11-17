import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { CAMBODIA_CENTER, CITY_CENTERS, googleMapsUrl, parseCoordinates, round, searchPlaces } from '../../utils/maps.js'
import Icon from '../ui/Icon.jsx'
import MapView from '../ui/MapView.jsx'

/**
 * Lets an organizer put the event's pin on the map:
 * tap the map, drag the pin, search a place, use GPS, or paste a Google Maps link.
 *   value: { lat, lng } | null    onChange(value)    city: used to center the map
 */
export default function LocationPicker({ value, onChange, city }) {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [link, setLink] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const position = value ? [value.lat, value.lng] : null
  const center = CITY_CENTERS[city] || CAMBODIA_CENTER
  const pick = (lat, lng) => {
    setMsg('')
    onChange({ lat: round(lat), lng: round(lng) })
  }

  async function search(e) {
    e?.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setMsg('')
    try {
      const list = await searchPlaces(city ? `${query}, ${city}` : query)
      setResults(list)
      if (list.length === 0) setMsg(t('map.noResults'))
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  function applyLink(text) {
    setLink(text)
    if (!text.trim()) return
    const c = parseCoordinates(text)
    if (c) {
      pick(c[0], c[1])
      setLink('')
    } else {
      setMsg(t('map.badLink'))
    }
  }

  function locateMe() {
    if (!navigator.geolocation) return setMsg(t('map.noGps'))
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false)
        pick(p.coords.latitude, p.coords.longitude)
      },
      () => {
        setBusy(false)
        setMsg(t('map.gpsDenied'))
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="location-picker">
      <div className="location-tools">
        <div className="location-search">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('map.searchPh')}
            aria-label={t('map.searchPh')}
            onKeyDown={(e) => e.key === 'Enter' && search(e)}
          />
          <button type="button" className="btn btn-dark" onClick={search} disabled={busy}>
            <Icon name="search" size={16} />
          </button>
        </div>
        <button type="button" className="btn btn-outline" onClick={locateMe} disabled={busy}>
          <Icon name="pin" size={16} /> {t('map.myLocation')}
        </button>
      </div>

      {results?.length > 0 && (
        <div className="card location-results">
          {results.map((r) => (
            <button
              key={`${r.lat},${r.lng}`}
              type="button"
              onClick={() => {
                pick(r.lat, r.lng)
                setResults(null)
              }}
            >
              <Icon name="pin" size={14} /> {r.name}
            </button>
          ))}
        </div>
      )}

      <MapView position={position} center={center} onPick={pick} height={280} />

      <input
        className="input"
        value={link}
        onChange={(e) => applyLink(e.target.value)}
        placeholder={t('map.pastePh')}
        aria-label={t('map.pastePh')}
      />

      <div className="location-status">
        {position ? (
          <>
            <span>
              <Icon name="pin" size={14} className="verified" /> {t('map.pinSet')} ({value.lat}, {value.lng}) ·{' '}
              <a className="link" href={googleMapsUrl(value.lat, value.lng)} target="_blank" rel="noreferrer">
                {t('map.checkGoogle')}
              </a>
            </span>
            <button type="button" className="link" style={{ background: 'none', border: 0 }} onClick={() => onChange(null)}>
              {t('map.remove')}
            </button>
          </>
        ) : (
          <span className="muted">{t('map.hint')}</span>
        )}
      </div>
      {msg && <p className="error-text">{msg}</p>}
    </div>
  )
}
