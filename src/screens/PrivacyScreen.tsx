import { Link } from 'react-router-dom'

const DATA = [
  { label: 'Whoop',          text: "We access the app owner's personal recovery score, HRV, resting heart rate and sleep data solely to display it within the app." },
  { label: 'Apple Calendar', text: "We access the app owner's personal calendar events solely to display them within the app." },
  { label: 'Location',       text: 'We access device location solely to fetch local weather data.' },
]

const HANDLING = [
  'No data is collected or stored on any external server.',
  'No data is shared with any third parties whatsoever.',
  'All data remains locally on the device in browser localStorage only.',
  'This app has no public users. It is a strictly private personal tool.',
]

export default function PrivacyScreen() {
  return (
    <div className="static-page">
      <Link to="/" className="static-back">← Back</Link>
      <h1>Privacy</h1>
      <p>Last updated: April 2026.</p>
      <p><em>daybreak</em> is a personal app built for private use by a single individual.</p>

      <h2>Data accessed</h2>
      {DATA.map(({ label, text }) => (
        <p key={label}><strong>{label}.</strong> {text}</p>
      ))}

      <h2>How data is handled</h2>
      {HANDLING.map((item, i) => (
        <p key={i}>{item}</p>
      ))}

      <h2>Contact</h2>
      <p><a href="mailto:sianrodwaysmith@hotmail.co.uk">sianrodwaysmith@hotmail.co.uk</a></p>
    </div>
  )
}
