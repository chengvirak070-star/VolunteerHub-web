import Elephant from './Elephant.jsx'
import Logo from './Logo.jsx'

// Full-screen loading screen shown when the app first opens.
// Uses the .splash styles defined in index.html so it matches the pre-JS splash exactly.
//   message: optional line under the spinner (e.g. "Connecting to server…")
//   offline: show a "Try again" button instead of the spinner
export default function SplashScreen({ message, offline = false }) {
  return (
    <div className="splash" role="status" aria-label="Loading VolunteerHub">
      <Elephant size={110} />
      <Logo variant="light" height={40} />
      {offline ? (
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      ) : (
        <div className="splash-spinner" />
      )}
      <div className="splash-text">{message || 'ចូលរួម ជួយ និងរាប់ម៉ោងស្ម័គ្រចិត្ត'}</div>
    </div>
  )
}
