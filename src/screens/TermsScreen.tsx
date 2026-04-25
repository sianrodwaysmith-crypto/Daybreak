import { Link } from 'react-router-dom'

const TERMS = [
  'Not intended for public use or distribution.',
  'No commercial use whatsoever.',
  'Connects to Whoop and Apple Calendar on behalf of the owner only.',
  'The owner takes no responsibility for accuracy of data from connected third-party services.',
]

export default function TermsScreen() {
  return (
    <div className="static-page">
      <Link to="/" className="static-back">← Back</Link>
      <h1>Terms</h1>
      <p>Last updated: April 2026.</p>
      <p>Daybreak is a private personal productivity app for single-user private use only.</p>

      <h2>Use</h2>
      {TERMS.map((item, i) => <p key={i}>{item}</p>)}

      <h2>Contact</h2>
      <p><a href="mailto:sianrodwaysmith@hotmail.co.uk">sianrodwaysmith@hotmail.co.uk</a></p>
    </div>
  )
}
