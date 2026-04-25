export default function ClientBriefScreen() {
  return (
    <div>
      <div className="client-active-box">
        <div className="client-active-eyebrow">ACTIVE CLIENT</div>
        <div className="client-active-name">AZTEC</div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">PROJECT DETAILS</div>
        <div className="screen-card">
          {[
            ['PROJECT',  'Digital Transformation Q2'],
            ['PLATFORM', 'Salesforce CRM'],
            ['PHASE',    'Phase 2 — Integration'],
            ['DEADLINE', '15 May 2026'],
            ['STATUS',   'On Track'],
          ].map(([k, v]) => (
            <div key={k} className="detail-row">
              <div className="detail-key">{k}</div>
              <div className="detail-value" style={v === 'On Track' ? { color: '#4ade80' } : undefined}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">TODAY'S PRIORITIES</div>
        <div className="screen-card">
          {[
            '→  Review integration spec v2.1 with dev team',
            '→  Confirm data migration timeline with Aztec IT',
            '→  Send weekly status update to James Henderson',
          ].map((t, i) => (
            <div key={i} className="detail-row">
              <div className="detail-value" style={{ textAlign: 'left' }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">KEY CONTACTS</div>
        <div className="screen-card">
          {[
            ['SPONSOR',   'James Henderson, CPO'],
            ['TECH LEAD', 'Sarah Okonkwo'],
            ['PM',        'Tom Reeves'],
          ].map(([k, v]) => (
            <div key={k} className="detail-row">
              <div className="detail-key">{k}</div>
              <div className="detail-value">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">ALSO ACTIVE</div>
        <div className="screen-card">
          {[
            ['CLIENT',  'Salesforce'],
            ['STATUS',  'Discovery Phase'],
            ['CONTACT', 'Rachel Ng, Enterprise'],
          ].map(([k, v]) => (
            <div key={k} className="detail-row">
              <div className="detail-key">{k}</div>
              <div className="detail-value" style={v === 'Discovery Phase' ? { color: '#64b5f6' } : undefined}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
