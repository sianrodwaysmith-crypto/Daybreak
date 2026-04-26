import type { Course } from '../types'

/* ====================================================================
   The 'All things Anthropic' course.
   Authored content lives here as a plain data structure so adding,
   editing, or replacing courses is a no-touch change to the rest of
   the module. Days 2-14 land in a follow-up commit.

   Factual notes are accurate to my best knowledge as of early 2026 and
   should be skimmed by a human before being relied on externally.
==================================================================== */

export const ANTHROPIC_COURSE: Course = {
  id:          'anthropic-foundations',
  title:       'All things Anthropic',
  description: 'A guided introduction to the AI safety company building Claude. No prior knowledge assumed.',
  totalDays:   14,
  authoredAt:  '2026-04-26',
  lessons: [
    {
      id:               'anthropic-d1',
      dayNumber:        1,
      title:            'What is artificial intelligence, really?',
      hook:             'How a model turns letters into language.',
      estimatedMinutes: 3,
      conceptTags:      ['ai-foundations', 'neural-networks', 'emergence'],
      body:
`Artificial intelligence is, at heart, pattern-finding at scale. Modern AI systems are built on neural networks: layered grids of simple mathematical units that learn by adjusting how strongly they pass signals to each other. None of those units knows anything on its own. The intelligence is in the pattern of their connections, refined over billions of training examples.

What changed in the last decade is not the idea of neural networks (that goes back to the 1950s) but the scale at which we can run them. Bigger models with more parameters, trained on more data, on faster chips, started to do things their smaller versions simply could not. Reasoning, translating, writing code, holding a conversation — abilities that were never explicitly programmed in. They emerged.

Researchers call this emergence: capabilities that appear past a certain size threshold without anyone designing them. It's also why predicting what the next generation of models will do is harder than it sounds. A system that's "merely" predicting words can, at sufficient scale, write a sonnet, debug your code, or talk you through grief.

That's the thing to hold on to. AI is not magic and not a person. It is mathematics done at a scale large enough to be surprising.`,
      takeaway:         'Modern AI is mathematics at a scale large enough to be surprising.',
      questions: [
        {
          id:           'anthropic-d1-q1',
          prompt:       'Which of these is closest to a one-line definition of modern AI?',
          options: [
            'A set of hand-written if/else rules describing the world',
            'Pattern-finding done by neural networks at very large scale',
            'A database of facts looked up in response to questions',
            'A simulation of a single human brain inside a computer',
          ],
          correctIndex: 1,
          explanation:  'Modern AI systems are neural networks that learn patterns from huge datasets. They are not rule sets, lookup tables, or brain simulations.',
          difficulty:   'easy',
          conceptTags:  ['ai-foundations'],
        },
        {
          id:           'anthropic-d1-q2',
          prompt:       'What does "emergence" mean in the context of large language models?',
          options: [
            'Capabilities that appear past a certain scale without being designed in',
            'The first time the model is shown to the public',
            'The point where the model becomes self-aware',
            'A specific layer near the output of the network',
          ],
          correctIndex: 0,
          explanation:  'Emergence describes capabilities (reasoning, translation, code) that show up once a model crosses a size and training threshold, without being explicitly programmed.',
          difficulty:   'medium',
          conceptTags:  ['emergence'],
        },
        {
          id:           'anthropic-d1-q3',
          prompt:       'Why did neural networks start producing breakthrough results in the last decade specifically?',
          options: [
            'A new mathematical theory of intelligence was discovered',
            'Researchers finally added consciousness to the architecture',
            'Compute, data, and model size all reached new scales',
            'Governments deregulated AI research',
          ],
          correctIndex: 2,
          explanation:  'The core ideas are decades old; the change was the scale at which we could now train them — bigger models, more data, faster chips.',
          difficulty:   'medium',
          conceptTags:  ['neural-networks', 'ai-foundations'],
        },
        {
          id:           'anthropic-d1-q4',
          prompt:       'A neural network "knows" things in which sense?',
          options: [
            'Each unit stores a fact about the world',
            'The knowledge lives in the strengths of connections between units',
            'The model retrieves text from its training set on demand',
            'A central memory module holds everything the model has learned',
          ],
          correctIndex: 1,
          explanation:  'Knowledge in a neural network is encoded in the weights — the strengths of connections — not in any single unit or a separate memory.',
          difficulty:   'hard',
          conceptTags:  ['neural-networks'],
        },
      ],
    },
  ],
}
