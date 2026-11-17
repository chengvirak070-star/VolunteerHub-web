import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { categoryName, getCategories } from '../../services/categoryService.js'
import { CITIES } from '../../services/eventService.js'

/**
 * value: { categories: string[] (slugs), when: 'any'|'week'|'month', city: string, freeOnly: boolean }
 */
export default function EventFilters({ value, onChange }) {
  const { t, lang } = useLang()
  const categories = useAsync(getCategories, [])
  const set = (k, v) => onChange({ ...value, [k]: v })
  const toggleCat = (slug) =>
    set('categories', value.categories.includes(slug) ? value.categories.filter((x) => x !== slug) : [...value.categories, slug])

  return (
    <aside className="card filters sticky-col">
      <h3 style={{ fontSize: 16 }}>{t('search.filters')}</h3>
      <h4>{t('search.category')}</h4>
      {categories.data?.map((c) => (
        <label key={c.slug} className="checkbox">
          <input type="checkbox" checked={value.categories.includes(c.slug)} onChange={() => toggleCat(c.slug)} />
          {categoryName(c, lang)}
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
        {CITIES.map((c) => (
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
