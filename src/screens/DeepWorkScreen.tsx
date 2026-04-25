const BLOCKS = [
  { time: '06:00', end: '08:00', name: 'Morning Deep Work',    dur: '2h',    color: '#4ade80', bg: 'rgba(74,222,128,0.07)' },
  { time: '08:00', end: '09:00', name: 'Exercise & Recovery',  dur: '1h',    color: '#64b5f6', bg: 'rgba(100,181,246,0.07)' },
  { time: '09:30', end: '11:00', name: 'Client Work Block',    dur: '1.5h',  color: '#ffc800', bg: 'rgba(255,200,0,0.07)' },
  { time: '11:00', end: '12:00', name: 'Email & Admin',        dur: '1h',    color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  { time: '13:00', end: '15:00', name: 'Strategic Deep Work',  dur: '2h',    color: '#4ade80', bg: 'rgba(74,222,128,0.07)' },
  { time: '15:00', end: '16:00', name: 'Learning Block',       dur: '1h',    color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
  { time: '16:00', end: '17:00', name: 'Planning & Review',    dur: '1h',    color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
]

export default function DeepWorkScreen() {
  return (
    <div>
      <div className="screen-section">
        <div className="screen-section-label">TODAY'S TIME BLOCKS</div>
        <div className="time-block-list">
          {BLOCKS.map((b, i) => (
            <div key={i} className="time-block" style={{ background: b.bg }}>
              <div className="time-block-dot" style={{ background: b.color }} />
              <div className="time-block-time">{b.time}–{b.end}</div>
              <div className="time-block-name" style={{ color: b.color }}>{b.name}</div>
              <div className="time-block-dur">{b.dur}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="ai-rec-card">
          <div className="ai-rec-label">AI STRATEGY</div>
          <div className="ai-rec-body">
            Your readiness score of 74 suggests solid cognitive capacity today.
            Front-load your hardest thinking into the morning deep work block —
            this is when your prefrontal cortex operates at peak efficiency.
            Reserve the afternoon block for work that requires creative synthesis
            rather than raw analytical effort. Protect your focus windows ruthlessly:
            no meetings, no Slack, no exceptions.
          </div>
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">FOCUS PROTOCOL</div>
        <div className="screen-card">
          <div className="ai-rec-body">
            Phone in another room · Noise-cancelling headphones · Pomodoro 50/10 ·
            Water on desk · Intentions written before starting · Notifications off
          </div>
        </div>
      </div>
    </div>
  )
}
