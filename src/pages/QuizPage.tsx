import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getQuestionBank, QUIZ_SIZE } from '../content/questions'
import { shuffle, shuffleChoices } from '../lib/shuffle'
import { loadQuiz, saveQuiz, loadState, saveState } from '../lib/storage'
import { ExtraLockedNotice } from '../components/ExtraLockedNotice'
import { canAccessDay, dayHeading, getDay } from '../content/days'
import { ChoiceText } from '../components/ChoiceText'
import type { QuizAttempt } from '../types'

function buildAttempt(dayId: number): QuizAttempt {
  const picked = shuffle(getQuestionBank(dayId)).slice(0, QUIZ_SIZE).map(shuffleChoices)
  return {
    dayId,
    questions: picked,
    answers: picked.map(() => null),
    submitted: false,
  }
}

export function QuizPage() {
  const { id } = useParams()
  const dayId = Number(id)
  const day = getDay(dayId)
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)

  const unlocked = canAccessDay(dayId)

  useEffect(() => {
    if (!day || !unlocked) return
    const existing = loadQuiz(dayId)
    if (existing && existing.questions.length > 0 && !existing.submitted) {
      setAttempt(existing)
      return
    }
    const next = buildAttempt(dayId)
    saveQuiz(next)
    setAttempt(next)
  }, [day, dayId, unlocked])

  if (!day) return <p>找不到這一天的課程。</p>
  if (!unlocked) return <ExtraLockedNotice />
  if (!attempt) return <p>正在載入測驗…</p>

  const setAnswer = (qi: number, choice: number) => {
    const next: QuizAttempt = {
      ...attempt,
      answers: attempt.answers.map((a, i) => (i === qi ? choice : a)),
    }
    setAttempt(next)
    saveQuiz(next)
  }

  const allAnswered = attempt.answers.every((a) => a !== null)

  const submit = () => {
    if (!allAnswered) return
    const score = attempt.questions.reduce(
      (n, q, i) => n + (attempt.answers[i] === q.answerIndex ? 1 : 0),
      0,
    )
    const submitted: QuizAttempt = { ...attempt, submitted: true }
    saveQuiz(submitted)
    const state = loadState()
    const total = attempt.questions.length
    state.lastScore[String(dayId)] = {
      score,
      total,
      wrong: total - score,
      at: new Date().toISOString(),
    }
    saveState(state)
    navigate(`/day/${dayId}/result`)
  }

  return (
    <div>
      <p>
        <Link to={`/day/${dayId}`}>← 返回 {dayHeading(day)}</Link>
      </p>
      <h1 data-testid="quiz-title">
        {dayHeading(day)} 測驗（{attempt.questions.length} 題）
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <ol className="quiz" data-testid="quiz-list">
          {attempt.questions.map((q, qi) => (
            <li key={q.id} className="quiz-item" data-testid={`question-${qi}`}>
              <header className="panel-head">
                <span className="panel-num">{qi + 1}</span>
                <p className="prompt">{q.prompt}</p>
              </header>
              <div className="panel-body">
                <fieldset>
                  <legend className="sr-only">第 {qi + 1} 題選項</legend>
                  {q.choices.map((c, ci) => {
                    const inputId = `${q.id}-${ci}`
                    return (
                      <label key={inputId} htmlFor={inputId} className="choice-row">
                        <input
                          id={inputId}
                          type="radio"
                          name={q.id}
                          checked={attempt.answers[qi] === ci}
                          onChange={() => setAnswer(qi, ci)}
                        />
                        <ChoiceText text={c} />
                      </label>
                    )
                  })}
                </fieldset>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="submit"
          className="primary"
          data-testid="submit-quiz"
          disabled={!allAnswered}
        >
          送出答案
        </button>
      </form>
    </div>
  )
}
