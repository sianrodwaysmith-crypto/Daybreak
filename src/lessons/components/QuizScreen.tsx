import { useMemo, useState } from 'react'
import { copy } from '../copy'
import type { Answer, Question } from '../types'

/* ====================================================================
   QuizScreen — five questions, one at a time.
   The wrong-answer experience must feel safe to fail at: no buzzers,
   no "incorrect" shouting. Just the right answer highlighted, the
   user's choice softly red if wrong, and a clear explanation.

   The screen owns its own answers-so-far buffer and emits the full
   list to the parent on the final "See recap" tap.
==================================================================== */

interface QuizAnswerOut {
  question:        Question
  selectedIndex:   number
  correct:         boolean
  responseTimeMs:  number
}

interface Props {
  questions:    Question[]
  onComplete:   (answers: QuizAnswerOut[]) => void
  // Optional live recorder so the parent can persist each answer as
  // it's made (rather than waiting for completion). Used for SM-2.
  onAnswer?:    (answer: Answer, conceptTags: string[]) => void
}

export function QuizScreen({ questions, onComplete, onAnswer }: Props) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [collected, setCollected] = useState<QuizAnswerOut[]>([])

  // Track when the current question was first shown so we can record
  // a response time without leaking renders.
  const startTimes = useMemo<number[]>(() => questions.map(() => 0), [questions])
  if (startTimes[index] === 0) startTimes[index] = Date.now()

  if (questions.length === 0) return null
  const total = questions.length
  const q     = questions[index]
  const isLast = index === total - 1
  const answered = selected !== null

  function handlePick(i: number) {
    if (selected !== null) return
    const correct = i === q.correctIndex
    const responseTimeMs = Date.now() - startTimes[index]
    setSelected(i)

    const out: QuizAnswerOut = { question: q, selectedIndex: i, correct, responseTimeMs }
    setCollected(prev => [...prev, out])

    if (onAnswer) {
      onAnswer(
        {
          questionId:     q.id,
          lessonId:       '',  // parent fills in (knows the lesson context)
          answeredAt:     new Date().toISOString(),
          selectedIndex:  i,
          correct,
          responseTimeMs,
        },
        q.conceptTags,
      )
    }
  }

  function handleContinue() {
    if (selected === null) return
    if (isLast) {
      onComplete(collected)
      return
    }
    setIndex(i => i + 1)
    setSelected(null)
  }

  function optionClass(i: number): string {
    if (selected === null) return 'quiz-option'
    if (i === q.correctIndex) return 'quiz-option is-correct'
    if (i === selected)       return 'quiz-option is-wrong'
    return 'quiz-option is-dim'
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-screen-head">
        <span className="quiz-screen-counter">{copy.quiz.counter(index + 1, total)}</span>
        <span className="quiz-screen-dots" aria-hidden>
          {questions.map((_, i) => (
            <span
              key={i}
              className={`quiz-dot${i < index ? ' is-done' : ''}${i === index ? ' is-now' : ''}`}
            />
          ))}
        </span>
      </div>

      <h2 className="quiz-screen-prompt">{q.prompt}</h2>

      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={optionClass(i)}
            onClick={() => handlePick(i)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className="quiz-explanation">{q.explanation}</div>
      )}

      <div className="quiz-foot">
        <button
          className={`quiz-continue${answered ? ' is-ready' : ''}`}
          onClick={handleContinue}
          disabled={!answered}
        >
          {isLast ? copy.quiz.seeRecap : copy.quiz.continue}
        </button>
      </div>
    </div>
  )
}

export type { QuizAnswerOut }
