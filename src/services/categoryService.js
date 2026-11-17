import { api } from './api.js'

// Categories come from the database, so new ones (added by organizers) appear everywhere.
let cache = null

/** [{ id, slug, name_en, name_km }] — loaded once per page visit. */
export async function getCategories({ fresh = false } = {}) {
  if (!cache || fresh) {
    cache = api('/categories')
      .then((res) => res.data)
      .catch((e) => {
        cache = null
        throw e
      })
  }
  return cache
}

/** Organizers/admins: add a category. Returns the new (or existing same-name) category. */
export async function createCategory(nameEn, nameKm) {
  const res = await api('/categories', { method: 'POST', body: { name_en: nameEn, name_km: nameKm } })
  cache = null // reload the list next time
  return res.data
}

/** Category name in the current language. */
export function categoryName(category, lang) {
  if (!category) return ''
  return lang === 'km' ? category.name_km || category.name_en : category.name_en
}
