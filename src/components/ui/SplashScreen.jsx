import Elephant from './Elephant.jsx'

// Full-screen loading screen shown when the app first opens.
// Uses the .splash styles defined in index.html so it matches the pre-JS splash exactly.
export default function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Loading VolunteerHub">
      <Elephant size={110} />
      <div className="splash-logo">
        Volunteer<span>Hub</span>
      </div>
      <div className="splash-spinner" />
      <div className="splash-text">ចូលរួម ជួយ និងរាប់ម៉ោងស្ម័គ្រចិត្ត</div>
    </div>
  )
}
