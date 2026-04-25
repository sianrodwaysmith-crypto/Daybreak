export default function StoicScreen() {
  return (
    <div>
      <div className="stoic-quote-card">
        <div className="stoic-quote">
          "You have power over your mind — not outside events. Realise this, and you will find strength."
        </div>
        <div className="stoic-attribution">— MARCUS AURELIUS · MEDITATIONS</div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">TODAY'S PRINCIPLE</div>
        <div className="screen-card">
          <div className="stoic-body">
            Focus on what lies within your control — your thoughts, your responses, your effort.
            The external world moves according to its own laws. Meet it with equanimity, not resistance.
            Today, practise the discipline of perception: choose how you interpret every event,
            and you choose how the day feels.
          </div>
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">MORNING EXERCISE</div>
        <div className="screen-card">
          <div className="stoic-body">
            Take two minutes before you begin. Anticipate one difficulty you might face today.
            Visualise meeting it with calm, with clarity, with your best self. When it arrives —
            and it may — you will already have rehearsed your response.
          </div>
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">EVENING REFLECTION</div>
        <div className="screen-card">
          <div className="stoic-body">
            At day's end, ask three questions: What did I do well? What could I have done better?
            What will I do differently tomorrow? Not in self-criticism — in honest accounting.
            The examined life compounds.
          </div>
        </div>
      </div>
    </div>
  )
}
