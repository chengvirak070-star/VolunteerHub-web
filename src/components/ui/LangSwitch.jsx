import { useLang } from '../../i18n/index.jsx'

export default function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" className={`km ${lang === 'km' ? 'active' : ''}`} onClick={() => setLang('km')}>
        ខ្មែរ
      </button>
    </div>
  )
}
