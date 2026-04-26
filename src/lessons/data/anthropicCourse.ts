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
  ],
}
