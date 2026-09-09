import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnnotateText } from '../components/AnnotateText'
import { ExtraLockedNotice } from '../components/ExtraLockedNotice'
import { canAccessDay, dayHeading, getDay } from '../content/days'
import { glossaryForDay, noteId } from '../content/glossary'
import { loadState, updateState, clearQuiz } from '../lib/storage'
import { XP } from '../lib/progress'

/** 同事原版教材：重點說明、任務清單、15 題測驗。 */
export function DayPage() {
  const { id } = useParams()
  const dayId = Number(id)
  const day = getDay(dayId)
  const navigate = useNavigate()
  const initial = useMemo(() => loadState(), [])
  const [checks, setChecks] = useState<boolean[]>(() => {
    if (!day) return []
    const saved = initial.checklists[String(day.id)]
    return saved && saved.length === day.tasks.length ? saved : day.tasks.map(() => false)
  })

  if (!day) {
    return <p>找不到這一關。</p>
  }
  if (!canAccessDay(day.id)) {
    return (
      <article>
        <p>
          <Link to="/map">← 地圖</Link>
        </p>
        <ExtraLockedNotice />
      </article>
    )
  }

  const score = initial.lastScore[String(day.id)]
  const notes = glossaryForDay(day)

  const toggle = (index: number) => {
    const next = checks.map((v, i) => (i === index ? !v : v))
    setChecks(next)
    updateState((s) => {
      s.checklists[String(day.id)] = next
    })
  }

  const startQuiz = () => {
    clearQuiz(day.id)
    navigate(`/day/${day.id}/quiz`)
  }

  return (
    <article className="detail-page">
      <p className="crumbs">
        <Link to={`/day/${day.id}`}>← 回 {dayHeading(day)}</Link>
        <Link to="/map">地圖</Link>
      </p>
      <h1 data-testid="day-title">
        {dayHeading(day)}：<AnnotateText text={day.title} notes={notes} />
      </h1>
      <p className="lead">同事原版教材。上課以「一步一步」頁為主，這頁當補充。</p>
      <section>
        <h2>學習目標</h2>
        <ul>
          {day.objectives.map((t) => (
            <li key={t}>
              <AnnotateText text={t} notes={notes} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>重點說明</h2>
        <ul data-testid="key-points">
          {day.keyPoints.map((t) => (
            <li key={t}>
              <AnnotateText text={t} notes={notes} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>相關資料表（練習資料內建，不含自建表）</h2>
        <p data-testid="related-tables">{day.relatedTables.join('、')}</p>
      </section>
      <section>
        <h2>任務清單</h2>
        <ul className="tasks" data-testid="task-list">
          {day.tasks.map((task, i) => (
            <li key={task}>
              <label className="choice-row">
                <input type="checkbox" checked={checks[i] ?? false} onChange={() => toggle(i)} data-testid={`task-${i}`} />
                <span className="choice">
                  <AnnotateText text={task} notes={notes} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      {score ? (
        <p data-testid="last-score">
          最近測驗：{score.score} / {score.total}
          <span className="error-count" data-testid="error-count">
            {' '}
            · 錯誤 {score.wrong ?? score.total - score.score} 題
          </span>
          {score.total > 0 && score.score === score.total ? <span className="perfect"> · 🌟 滿分 +{XP.quizPerfect} XP</span> : null}
        </p>
      ) : null}
      {notes.length > 0 ? (
        <section className="notes" data-testid="abbrev-notes">
          <h2>* 備註</h2>
          <ul>
            {notes.map((item) => (
              <li key={item.abbr} id={noteId(item.n)}>
                *{item.n} {item.abbr}：{item.full}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <button type="button" className="primary" data-testid="start-quiz" onClick={startQuiz}>
        開始 15 題測驗
      </button>
    </article>
  )
}
