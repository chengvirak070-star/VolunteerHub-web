import { useLang } from '../../i18n/index.jsx'
import { getCities } from '../../services/eventService.js'

const CATEGORIES = ['Environment', 'Education', 'Health', 'Community']

/**
 * value: { categories: string[], when: 'any'|'week'|'month', city: string, freeOnly: boolean }
 */
export default function EventFilters({ value, onChange }) {
  const { t } = useLang()
  const set = (k, v) => onChange({ ...value, [k]: v })
  const toggleCat = (c) =>
    set('categories', value.categories.includes(c) ? value.categories.filter((x) => x !== c) : [...value.categories, c])

  return (
    <aside className="card filters sticky-col">
      <h3 style={{ fontSize: 16 }}>{t('search.filters')}</h3>
      <h4>{t('search.category')}</h4>
      {CATEGORIES.map((c) => (
        <label key={c} className="checkbox">
          <input type="checkbox" checked={value.categories.includes(c)} onChange={() => toggleCat(c)} />
          {t(`cat.${c}`)}
        </label>
      ))}
      <h4>{t('search.when')}</h4>
      <select className="select" value={value.when} onChange={(e) => set('when', e.target.value)}>
        <option value="any">{t('when.any')}</option>
        <option value="week">{t('when.week')}</option>
        <option value="month">{t('when.month')}</option>
      </select>
      <h4>{t('search.locationLabel')}</h4>
      <select className="select" value={value.city} onChange={(e) => set('city', e.target.value)}>
        <option value="">{t('loc.any')}</option>
        {getCities().map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label className="checkbox" style={{ marginTop: 6 }}>
        <input type="checkbox" checked={value.freeOnly} onChange={(e) => set('freeOnly', e.target.checked)} />
        {t('search.freeOnly')}
      </label>
    </aside>
  )
}
