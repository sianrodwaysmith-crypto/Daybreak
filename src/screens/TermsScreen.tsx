import { useNavigate } from 'react-router-dom'

const TERMS = [
  'Not intended for public use or distribution',
  'No commercial use whatsoever',
  'Connects to Whoop and Apple Calendar on behalf of the owner only',
  'The owner takes no responsibility for accuracy of data from connected third party services',
]

export default function TermsScreen() {
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

        <h1 className="legal-title">Terms of Service</h1>
        <div className="legal-updated">Last updated: April 2026</div>

        <p className="legal-intro">
          DayBreak is a private personal productivity app for single user private use only.
        </p>

        <div className="legal-section">
          <div className="legal-list">
            {TERMS.map((item, i) => (
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
