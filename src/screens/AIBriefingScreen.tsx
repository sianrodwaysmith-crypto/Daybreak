const ITEMS = [
  {
    tag: 'ANTHROPIC',
    headline: 'Claude 4 Opus sets new benchmark on reasoning tasks, scoring 92% on GPQA Diamond',
    summary: "Anthropic's latest model demonstrates significant improvements in multi-step reasoning and code generation. Enterprise customers are already reporting a 40% reduction in manual review time.",
  },
  {
    tag: 'OPENAI',
    headline: 'GPT-5 enters limited preview with real-time voice and vision capabilities combined',
    summary: 'The model can now process live video feeds while simultaneously engaging in voice conversation, opening new possibilities for accessibility tools and real-time analytics.',
  },
  {
    tag: 'GOOGLE DEEPMIND',
    headline: 'Gemini Ultra 2 achieves state-of-the-art on protein structure prediction tasks',
    summary: "Building on AlphaFold's foundation, the new model predicts protein-ligand interactions at near-quantum-chemistry accuracy, with potential applications in drug discovery.",
  },
  {
    tag: 'INDUSTRY',
    headline: 'AI coding assistants now used by 78% of professional developers, up from 45% last year',
    summary: 'A new Stack Overflow survey shows rapid adoption, with developers reporting an average 35% productivity gain. Junior developers are the biggest beneficiaries.',
  },
]

export default function AIBriefingScreen() {
  return (
    <div>
      <div className="screen-section">
        <div className="screen-section-label">AI & TECHNOLOGY NEWS</div>
        {ITEMS.map((item, i) => (
          <div key={i} className="ai-item">
            <div className="ai-item-tag">{item.tag}</div>
            <div className="ai-item-headline">{item.headline}</div>
            <div className="ai-item-summary">{item.summary}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
