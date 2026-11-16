import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.js'
import km from './km.js'

const dictionaries = { en, km }
const LangContext = createContext(null)

function readStoredLang() {
  try {
    const v = localStorage.getItem('vh-lang')
    return v === 'km' ? 'km' : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem('vh-lang', next)
    } catch {
      /* storage unavailable */
    }
  }, [])

  // t('key', { name: 'Sokha' }) -> replaces {name}
  const t = useCallback(
    (key, vars) => {
      let str = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v)
      }
      return str
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
