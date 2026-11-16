import Elephant from '../../components/ui/Elephant.jsx'
import LangSwitch from '../../components/ui/LangSwitch.jsx'
import TempleSilhouette from '../../components/ui/TempleSilhouette.jsx'
import { useLang } from '../../i18n/index.jsx'

// Left navy hero + right form column, shared by Login and Register.
export default function AuthShell({ children }) {
  const { t } = useLang()
  return (
    <div className="auth">
      <aside className="auth-hero">
        <div className="logo">
          Volunteer<span>Hub</span>
        </div>
        <div className="auth-hero-content">
          <Elephant size={150} />
          <h1>
            {t('auth.tagline1')}
            <br />
            {t('auth.tagline2')}
          </h1>
          <p>{t('auth.subtitle')}</p>
          <p className="km">ចូលរួម ជួយ និងរាប់ម៉ោងស្ម័គ្រចិត្តរបស់អ្នក</p>
        </div>
        <TempleSilhouette width={350} className="auth-temple" />
        <div className="krama" aria-hidden="true" />
      </aside>

      <section className="auth-side">
        <div className="auth-box">
          <LangSwitch />
          <div className="card auth-card">{children}</div>
        </div>
      </section>
    </div>
  )
}
