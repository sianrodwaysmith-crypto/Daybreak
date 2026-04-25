import { useNavigate } from 'react-router-dom'

const DATA = [
  { label: 'Whoop', text: "We access the app owner's personal recovery score, HRV, resting heart rate and sleep data solely to display it within the app." },
  { label: 'Apple Calendar', text: "We access the app owner's personal calendar events solely to display them within the app." },
  { label: 'Location', text: 'We access device location solely to fetch local weather data.' },
]

const HANDLING = [
  'No data is collected or stored on any external server',
  'No data is shared with any third parties whatsoever',
  'All data remains locally on the device in browser localStorage only',
  'This app has no public users — it is a strictly private personal tool',
]

export default function PrivacyScreen() {
  const navigate = useNavigate()

  return (
    <div className="legal-page">
      <div className="glow glow-tl" />
      <div className="glow glow-tr" />

      <div className="legal-inner">
        <div className="legal-nav">
          <button className="legal-back-btn" onClick={() => navigate('/')} aria-label="Back to home">
            ←
          </button>
          <span className="legal-app-name">DAYBREAK</span>
        </div>

        <h1 className="legal-title">Privacy Policy</h1>
        <div className="legal-updated">Last updated: April 2026</div>

        <p className="legal-intro">
          DayBreak is a personal app built for private use by a single individual.
        </p>

        <div className="legal-section">
          <div className="legal-section-label">DATA ACCESSED</div>
          <div className="legal-list">
            {DATA.map(({ label, text }) => (
              <div key={label} className="legal-item">
                <span className="legal-item-accent">{label}</span>
                {' — '}
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-label">HOW DATA IS HANDLED</div>
          <div className="legal-list">
            {HANDLING.map((item, i) => (
              <div key={i} className="legal-item">{item}</div>
            ))}
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-label">CONTACT</div>
          <a href="mailto:sianrodwaysmith@hotmail.co.uk" className="legal-email">
            sianrodwaysmith@hotmail.co.uk
          </a>
        </div>
      </div>
    </div>
  )
}
