const TASKS = [
  'Review outstanding integration points with Sarah',
  'Resolve the data schema discrepancy on the contacts module',
  'Write and send the revised spec document by 3pm',
  'Chase James for written sign-off via email',
]

export default function TodaysFocusScreen() {
  return (
    <div>
      <div className="focus-main-card">
        <div className="focus-eyebrow">TODAY'S SINGLE PRIORITY</div>
        <div className="focus-main-text">
          Complete the Aztec integration spec and get sign-off from the technical lead before end of day.
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">SUPPORTING TASKS</div>
        <div className="screen-card">
          {TASKS.map((t, i) => (
            <div key={i} className="focus-task">
              <div className="focus-task-dot" />
              <div className="focus-task-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">WHY THIS MATTERS</div>
        <div className="screen-card">
          <div className="focus-task-text" style={{ color: 'rgba(255,255,255,0.58)' }}>
            This spec sign-off unlocks Phase 3 of the project and enables the dev team to begin
            build. Delaying by even one day pushes the milestone and affects billing. This is
            the highest-leverage action you can take today.
          </div>
        </div>
      </div>
    </div>
  )
}
