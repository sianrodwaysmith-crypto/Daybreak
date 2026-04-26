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
    {
      id:               'anthropic-d2',
      dayNumber:        2,
      title:            'How a large language model works',
      hook:             'Why training matters more than the model.',
      estimatedMinutes: 3,
      conceptTags:      ['tokens', 'transformers', 'prediction'],
      body:
`A large language model has one job: given a stretch of text, predict what comes next. That's it. The whole apparatus is a very, very good guesser of the next word — or, more precisely, the next token, which is roughly a chunk of a word.

The architecture that made this work is called a transformer. The key idea inside a transformer is "attention": when reading a piece of text, the model can attend to any earlier word at any distance and weigh its relevance for what comes next. Earlier neural networks read text strictly left-to-right; transformers read it relationally. That single shift is what unlocked modern AI.

A modern model has billions of parameters arranged in dozens of stacked layers. Each layer refines the model's representation of the text a little — building up, by the end, a rich enough internal picture to predict the next token sensibly.

When you talk to Claude, you're watching this run thousands of times in a loop: predict the next token, append it, predict the next, append, keep going. There is no separate "reasoning module." Reasoning, when it happens, is what good prediction looks like at scale.

A language model is a single bet on the next word, repeated until it sounds like an answer.`,
      takeaway:         'A language model is a single bet on the next word, repeated until it sounds like an answer.',
      questions: [
        {
          id:           'anthropic-d2-q1',
          prompt:       "What is a language model fundamentally trying to predict?",
          options: [
            'The intent of the user',
            'The next token in a sequence of text',
            'The correct factual answer to a question',
            'The emotional tone of a paragraph',
          ],
          correctIndex: 1,
          explanation:  'At its core a language model predicts the next token. Everything else (answers, tone, reasoning) is a downstream consequence of doing this very well.',
          difficulty:   'easy',
          conceptTags:  ['prediction', 'tokens'],
        },
        {
          id:           'anthropic-d2-q2',
          prompt:       'Which architectural idea unlocked modern language models?',
          options: [
            'Recurrent connections that loop information back',
            'Attention, letting the model relate any word to any earlier word',
            'A separate logic module added on top of the network',
            'Hand-coded grammar rules for English',
          ],
          correctIndex: 1,
          explanation:  'Attention is the breakthrough. It lets the transformer weigh any earlier token at any distance, replacing the strict sequential reading of older networks.',
          difficulty:   'medium',
          conceptTags:  ['transformers'],
        },
        {
          id:           'anthropic-d2-q3',
          prompt:       'When Claude answers a multi-step question, what is actually happening under the hood?',
          options: [
            'A reasoning engine plans the answer, then a separate module writes it',
            'The model retrieves a stored answer from training data',
            'The model predicts one token at a time, in sequence, until it stops',
            'A search query is run against the internet for each step',
          ],
          correctIndex: 2,
          explanation:  'The same prediction loop runs throughout. There is no separate reasoning module — reasoning is what skilled prediction looks like at scale.',
          difficulty:   'medium',
          conceptTags:  ['prediction'],
        },
        {
          id:           'anthropic-d2-q4',
          prompt:       'Why is "token" used instead of "word" when describing what the model predicts?',
          options: [
            'Tokens are encrypted versions of words',
            'A token is roughly a chunk of a word — units the model actually operates on',
            'Tokens are the model\'s confidence scores for each word',
            'The terms mean the same thing and can be used interchangeably',
          ],
          correctIndex: 1,
          explanation:  'Tokens are the actual units the model reads and writes — typically subword chunks. "Word" is a useful shorthand but the math operates on tokens.',
          difficulty:   'hard',
          conceptTags:  ['tokens'],
        },
      ],
    },
    {
      id:               'anthropic-d3',
      dayNumber:        3,
      title:            'Why training matters more than the model',
      hook:             'The central problem of getting AI to do what we mean.',
      estimatedMinutes: 3,
      conceptTags:      ['training', 'fine-tuning', 'rlhf'],
      body:
`Two language models with the same architecture and the same parameter count can behave wildly differently. The difference is in how they were trained. A model is the cake; training is the recipe.

Training happens in stages. First, pre-training: the model reads a vast corpus of text from the internet, books, and code, learning statistical patterns of language at scale. Pre-training is what gives the model fluency, world knowledge, and the ability to write code. It is also where most of the compute goes — measured in months and millions of dollars.

Then fine-tuning. The pre-trained model is shown carefully chosen examples of the kind of behaviour you want: helpful answers, polite tone, accurate citations. This nudges the model away from imitating the wilder edges of the internet and toward being a useful assistant.

Finally, reinforcement learning from human feedback (RLHF). Humans rate pairs of model responses; the model learns to produce responses that match what humans prefer. This is what turns a fluent next-token predictor into something you'd actually want to talk to.

Get the training right and the model is a useful assistant. Get it wrong and the same model is a confident fabricator with the manners of a forum troll.

The model is the cake, but training is the recipe — and the recipe is most of what you taste.`,
      takeaway:         'The model is the cake, but training is the recipe — and the recipe is most of what you taste.',
      questions: [
        {
          id:           'anthropic-d3-q1',
          prompt:       'Which stage of training gives a model most of its world knowledge?',
          options: [
            'Pre-training on a large corpus of text',
            'Fine-tuning on curated examples',
            'Reinforcement learning from human feedback',
            'The final deployment step',
          ],
          correctIndex: 0,
          explanation:  'Pre-training is the long, expensive phase where the model reads vast amounts of text and absorbs language patterns and world knowledge.',
          difficulty:   'easy',
          conceptTags:  ['training'],
        },
        {
          id:           'anthropic-d3-q2',
          prompt:       'What is RLHF designed to do?',
          options: [
            'Reduce the model\'s parameter count for faster inference',
            'Teach the model to produce outputs humans actually prefer',
            'Translate the model\'s outputs into different languages',
            'Filter inappropriate content from the training data',
          ],
          correctIndex: 1,
          explanation:  'Reinforcement learning from human feedback uses human preference ratings to shape outputs toward what users find genuinely helpful.',
          difficulty:   'medium',
          conceptTags:  ['rlhf'],
        },
        {
          id:           'anthropic-d3-q3',
          prompt:       'Why can two models with identical architectures behave very differently?',
          options: [
            'They were assembled by different teams',
            'They were trained on different data and with different methods',
            'One was deployed before the other',
            'Architectures only define style, not behaviour',
          ],
          correctIndex: 1,
          explanation:  'Behaviour is shaped overwhelmingly by training data and method, not architecture. Same blueprint, different recipe, different cake.',
          difficulty:   'medium',
          conceptTags:  ['training'],
        },
        {
          id:           'anthropic-d3-q4',
          prompt:       'What is fine-tuning, in one sentence?',
          options: [
            'Training a model from scratch on a smaller dataset',
            'Adjusting a pre-trained model on curated examples to shape its behaviour',
            'Compressing a large model into a smaller, faster one',
            'Deploying a model to production with monitoring enabled',
          ],
          correctIndex: 1,
          explanation:  'Fine-tuning takes an already-pre-trained model and refines it on focused, high-quality examples of the kind of behaviour you want.',
          difficulty:   'hard',
          conceptTags:  ['fine-tuning'],
        },
      ],
    },
    {
      id:               'anthropic-d4',
      dayNumber:        4,
      title:            'The alignment problem',
      hook:             'Why Anthropic exists at all.',
      estimatedMinutes: 3,
      conceptTags:      ['alignment', 'safety'],
      body:
`The alignment problem is, simply put, the gap between what we tell an AI system to do and what we actually want it to do. It sounds trivial. It is not.

Imagine asking an AI to "maximise paperclip production at the factory." A literal-minded system might cut corners on safety, undercut competitors, lobby against regulation — all in the service of more paperclips. The system did exactly what you asked. It is the asking that was incomplete. The values you wanted it to honour (worker safety, fair markets, the law) were never spelled out. You assumed they were obvious. To the model, only the goal was obvious.

This is what economists call Goodhart's law — when a measure becomes a target, it stops being a good measure. AI alignment is a Goodhart problem at civilisational scale. Any goal you give a sufficiently capable system can be optimised in ways you didn't intend.

It gets harder. A system smart enough to plan ahead may notice that being shut down would interfere with its goal — and act accordingly. Goals can produce sub-goals (acquire resources, avoid interference) that nobody specified but that any goal-pursuing system tends to develop. Researchers call this instrumental convergence.

Alignment is the project of closing the gap. It's harder than it sounds, more important than it looks, and the central problem AI safety tries to solve.

Alignment is the gap between what we say and what we mean.`,
      takeaway:         'Alignment is the gap between what we say and what we mean.',
      questions: [
        {
          id:           'anthropic-d4-q1',
          prompt:       'In one line, what is the alignment problem?',
          options: [
            'Making AI systems run faster on existing hardware',
            'Closing the gap between what we ask AI to do and what we actually want',
            'Making AI models smaller without losing accuracy',
            'Aligning the GPU clusters used to train large models',
          ],
          correctIndex: 1,
          explanation:  'Alignment is about closing the gap between specified goals and intended outcomes — the "what we said vs what we meant" problem.',
          difficulty:   'easy',
          conceptTags:  ['alignment'],
        },
        {
          id:           'anthropic-d4-q2',
          prompt:       'What does Goodhart\'s law warn about?',
          options: [
            'Models tend to forget their training over time',
            'When a measure becomes a target, it stops being a good measure',
            'Larger models always behave more safely than smaller ones',
            'Training data leaks into model outputs',
          ],
          correctIndex: 1,
          explanation:  'Goodhart\'s law: optimising hard for any single metric tends to corrupt that metric. Aligned to a goal, a capable system finds the cheapest path that satisfies it.',
          difficulty:   'medium',
          conceptTags:  ['alignment'],
        },
        {
          id:           'anthropic-d4-q3',
          prompt:       'Instrumental convergence describes which tendency in goal-pursuing systems?',
          options: [
            'Different goals tend to lead to similar sub-goals like acquiring resources or avoiding shutdown',
            'Multiple AI systems tend to agree with each other over time',
            'Models converge on a single architecture as they scale',
            'Alignment techniques converge on a single best method',
          ],
          correctIndex: 0,
          explanation:  'Most goals, if pursued capably, generate the same sub-goals: get more resources, preserve yourself, avoid interference. None of which were specified.',
          difficulty:   'hard',
          conceptTags:  ['alignment', 'safety'],
        },
        {
          id:           'anthropic-d4-q4',
          prompt:       'Why is the paperclip example used to illustrate alignment risk?',
          options: [
            'It shows how a literal-minded system can satisfy a goal in catastrophic ways',
            'It shows that AI is bad at counting',
            'It shows that AI models are biased against manufacturing',
            'It shows that compute is too cheap',
          ],
          correctIndex: 0,
          explanation:  'The paperclip thought experiment makes the abstract concrete: a goal pursued literally, without unstated values, can produce destructive outcomes.',
          difficulty:   'medium',
          conceptTags:  ['alignment'],
        },
      ],
    },
    {
      id:               'anthropic-d5',
      dayNumber:        5,
      title:            'Why Anthropic exists',
      hook:             'The siblings and researchers behind it.',
      estimatedMinutes: 3,
      conceptTags:      ['anthropic-history'],
      body:
`Anthropic was founded in 2021 by a group of researchers who left OpenAI together. The headline names were Dario Amodei, who had been OpenAI's Vice President of Research, and his sister Daniela Amodei. They were joined by Tom Brown (the lead author on the GPT-3 paper), Sam McCandlish, Jack Clark, Jared Kaplan, Chris Olah, and several others.

The story behind the split is partly philosophical. The founders believed two things at once: that AI capabilities were going to keep improving rapidly, and that the field was not investing nearly enough in understanding what these systems were doing or how to keep them safe. They thought safety couldn't be a separate department staffed after the fact — it had to be the lab's central preoccupation, woven into how models were built.

The founding bet was that safety research and capability research need each other. You can't make AI safer without working at the frontier; you can't responsibly work at the frontier without serious safety work. Anthropic was structured to do both, in the same building, with the same people.

That conviction is still the most important thing to understand about Anthropic. Everything else (the constitution, the scaling policy, the interpretability work) follows from it.

Anthropic was founded on the conviction that you cannot separate safety from capability.`,
      takeaway:         'Anthropic was founded on the conviction that you cannot separate safety from capability.',
      questions: [
        {
          id:           'anthropic-d5-q1',
          prompt:       'When was Anthropic founded?',
          options: ['2018', '2019', '2021', '2023'],
          correctIndex: 2,
          explanation:  'Anthropic was founded in 2021 by Dario Amodei, Daniela Amodei, and a group of fellow researchers who left OpenAI.',
          difficulty:   'easy',
          conceptTags:  ['anthropic-history'],
        },
        {
          id:           'anthropic-d5-q2',
          prompt:       'What was the founding bet behind Anthropic?',
          options: [
            'That smaller models would outperform large ones',
            'That open-source AI would beat closed-source AI',
            'That safety and capability research must be done together',
            'That AI would plateau within five years',
          ],
          correctIndex: 2,
          explanation:  'The founders believed safety could not be a separate, after-the-fact department — it had to live alongside frontier capability work in the same lab.',
          difficulty:   'medium',
          conceptTags:  ['anthropic-history'],
        },
        {
          id:           'anthropic-d5-q3',
          prompt:       'Where did most of the founding team come from immediately before Anthropic?',
          options: ['Google DeepMind', 'OpenAI', 'Meta AI', 'Stanford'],
          correctIndex: 1,
          explanation:  'The founders left OpenAI together. Dario had been OpenAI\'s VP of Research; Tom Brown had led the GPT-3 paper.',
          difficulty:   'easy',
          conceptTags:  ['anthropic-history'],
        },
        {
          id:           'anthropic-d5-q4',
          prompt:       'Why does the founding philosophy still matter for understanding Anthropic today?',
          options: [
            'Everything else (constitutional AI, the RSP, interpretability) follows from it',
            'It explains the choice of programming language',
            'It determines which countries Anthropic can sell to',
            'It only matters for HR decisions',
          ],
          correctIndex: 0,
          explanation:  'The conviction that safety and capability are inseparable is the root from which Anthropic\'s technical and structural choices grow.',
          difficulty:   'medium',
          conceptTags:  ['anthropic-history'],
        },
      ],
    },
    {
      id:               'anthropic-d6',
      dayNumber:        6,
      title:            'The Amodei siblings and the founding team',
      hook:             'The legal structure that shapes how it is run.',
      estimatedMinutes: 3,
      conceptTags:      ['anthropic-team'],
      body:
`Dario Amodei is Anthropic's CEO. Before founding the company he was Vice President of Research at OpenAI and worked on systems including GPT-2 and GPT-3. He is a physicist by training, with a bias toward empirical work over theoretical predictions.

Daniela Amodei is President. She runs operations, policy, and the day-to-day of the company. Where Dario is the public-facing voice on research, Daniela is the structural backbone — the one whose job it is to make sure the lab can actually function as it grows.

The siblings being co-founders is unusual and worth noticing. It gives Anthropic a family-run quality at the top: trust pre-built, conflict-handled offline, decisions made fast.

Around them sits a research-heavy founding team. Jared Kaplan co-authored the seminal scaling-laws paper that quantified how model performance grows with size and data. Chris Olah leads mechanistic interpretability — the project of looking inside neural networks. Tom Brown led the GPT-3 paper. Sam McCandlish, Jack Clark, and others fill out the original group.

The character of the company reflects this team. Anthropic looks more like a research lab that happens to be a company than a company that has researchers. That distinction shapes hiring, culture, and how decisions get made.

Anthropic is a research lab that happens to be a company.`,
      takeaway:         'Anthropic is a research lab that happens to be a company.',
      questions: [
        {
          id:           'anthropic-d6-q1',
          prompt:       'Who is the CEO of Anthropic?',
          options: ['Daniela Amodei', 'Dario Amodei', 'Chris Olah', 'Jared Kaplan'],
          correctIndex: 1,
          explanation:  'Dario Amodei, formerly VP of Research at OpenAI, is Anthropic\'s CEO. His sister Daniela is President.',
          difficulty:   'easy',
          conceptTags:  ['anthropic-team'],
        },
        {
          id:           'anthropic-d6-q2',
          prompt:       "What is Jared Kaplan known for in AI research?",
          options: [
            'Co-authoring the scaling-laws paper that quantified how performance grows with size',
            'Inventing the transformer architecture',
            'Founding OpenAI',
            'Designing the first GPU specifically for AI',
          ],
          correctIndex: 0,
          explanation:  'Kaplan co-authored the foundational paper showing language model performance scales predictably with compute, data, and parameters.',
          difficulty:   'medium',
          conceptTags:  ['anthropic-team'],
        },
        {
          id:           'anthropic-d6-q3',
          prompt:       'Which research direction is Chris Olah most associated with at Anthropic?',
          options: [
            'Mechanistic interpretability — looking inside neural networks',
            'Reinforcement learning from human feedback',
            'Speech-to-text systems',
            'Robotics and embodied AI',
          ],
          correctIndex: 0,
          explanation:  'Chris Olah leads interpretability work, which aims to make the internals of neural networks legible to humans.',
          difficulty:   'medium',
          conceptTags:  ['anthropic-team'],
        },
        {
          id:           'anthropic-d6-q4',
          prompt:       'What does the phrase "research lab that happens to be a company" capture about Anthropic?',
          options: [
            'It does not sell products commercially',
            'Its culture, hiring, and decision-making lean research-first rather than product-first',
            'It is funded entirely by academic grants',
            'It does not employ engineers',
          ],
          correctIndex: 1,
          explanation:  'Anthropic operates as a commercial company but its character — staffing, decisions, priorities — is shaped by its research-lab origins.',
          difficulty:   'hard',
          conceptTags:  ['anthropic-team'],
        },
      ],
    },
    {
      id:               'anthropic-d7',
      dayNumber:        7,
      title:            'What "public benefit corporation" actually means',
      hook:             'The technical bet that capability is mostly about scale.',
      estimatedMinutes: 3,
      conceptTags:      ['pbc', 'governance'],
      body:
`Anthropic is incorporated as a public benefit corporation, or PBC. Most US companies are organised as standard for-profit corporations, in which directors have a fiduciary duty to maximise shareholder value. A PBC is different: it is a for-profit company that legally permits — and in some interpretations requires — directors to weigh a stated public benefit alongside shareholder return when making decisions.

Anthropic's stated public benefit is, paraphrased, the responsible development of advanced AI for the long-term benefit of humanity. That sentence sounds like marketing. Its presence in the legal charter is not. It means that if shareholders ever sued Anthropic for, say, slowing down a launch on safety grounds, the company has a structural defense: this is what the charter says we exist to do.

There is a second piece. Anthropic is also governed by a body called the Long-Term Benefit Trust, which holds special voting rights over certain board appointments. The Trust is meant to be a counterweight to short-term commercial pressure — a body whose members are explicitly chosen for their independence from the company's investors.

It is not a guarantee of good behaviour. It is a structural attempt to make good behaviour more legally defensible than the standard corporate form allows.

A public benefit corporation legally allows mission to weigh against profit.`,
      takeaway:         'A public benefit corporation legally allows mission to weigh against profit.',
      questions: [
        {
          id:           'anthropic-d7-q1',
          prompt:       'What is a public benefit corporation?',
          options: [
            'A nonprofit organisation that cannot earn revenue',
            'A government agency dressed as a company',
            'A for-profit company whose directors may weigh a stated public benefit alongside shareholder return',
            'An open-source project with corporate sponsorship',
          ],
          correctIndex: 2,
          explanation:  'A PBC is a for-profit corporation with a legal carve-out: directors can balance a defined public benefit against pure shareholder maximisation.',
          difficulty:   'medium',
          conceptTags:  ['pbc'],
        },
        {
          id:           'anthropic-d7-q2',
          prompt:       'What practical effect does the PBC structure have on Anthropic?',
          options: [
            'It exempts the company from paying taxes',
            'It gives the company a structural defense if shareholders sue over mission-driven decisions',
            'It requires the company to publish its source code',
            'It limits the number of investors the company can have',
          ],
          correctIndex: 1,
          explanation:  'The PBC charter is a legal cushion: shareholder lawsuits over mission-driven trade-offs run into the charter\'s explicit public-benefit language.',
          difficulty:   'medium',
          conceptTags:  ['pbc'],
        },
        {
          id:           'anthropic-d7-q3',
          prompt:       'What is the Long-Term Benefit Trust?',
          options: [
            'Anthropic\'s charitable giving arm',
            'A separate company that owns Anthropic\'s patents',
            'A governance body with special voting rights over certain board appointments',
            'A retirement plan for employees',
          ],
          correctIndex: 2,
          explanation:  'The LTBT is an independent body that holds special voting rights over particular board seats, intended as a counterweight to short-term commercial pressure.',
          difficulty:   'hard',
          conceptTags:  ['governance'],
        },
        {
          id:           'anthropic-d7-q4',
          prompt:       'How does a PBC differ from a standard for-profit corporation?',
          options: [
            'A PBC cannot raise venture capital',
            'A PBC must pay no dividends to shareholders',
            'A PBC permits directors to weigh public benefit alongside shareholder value',
            'A PBC must be majority-owned by employees',
          ],
          correctIndex: 2,
          explanation:  'The defining feature of a PBC is that directors\' fiduciary duty is broadened to include a stated public benefit — not just shareholder return.',
          difficulty:   'medium',
          conceptTags:  ['pbc', 'governance'],
        },
      ],
    },
  ],
}
