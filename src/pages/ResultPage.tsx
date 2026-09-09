import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChoiceText } from '../components/ChoiceText'
import { ExtraLockedNotice } from '../components/ExtraLockedNotice'
import { canAccessDay, dayHeading, EXTRA_DAY_ID, getDay, TWO_NF_DAY_ID } from '../content/days'
import { clearQuiz, loadQuiz, loadState } from '../lib/storage'

export function ResultPage() {
  const { id } = useParams()
  const dayId = Number(id)
  const day = getDay(dayId)
  const navigate = useNavigate()
  const attempt = useMemo(() => loadQuiz(dayId), [dayId])
  const stored = useMemo(() => loadState().lastScore[String(dayId)], [dayId])

  if (!day) return <p>找不到這一天的課程。</p>
  if (!canAccessDay(dayId)) return <ExtraLockedNotice />
  if (!attempt?.submitted || !stored) {
    return (
      <p>
        還沒有成績。請先<Link to={`/day/${dayId}/quiz`}>完成測驗</Link>。
      </p>
    )
  }

  const retry = () => {
    clearQuiz(dayId)
    navigate(`/day/${dayId}/quiz`)
  }

  const wrong = stored.wrong ?? stored.total - stored.score

  return (
    <div>
      <p>
        <Link to={`/day/${dayId}`}>← 返回 {dayHeading(day)}</Link>
        {' · '}
        <Link to="/">總覽</Link>
      </p>
      <h1 data-testid="result-title">測驗結果</h1>
      <p className="score" data-testid="result-score">
        {stored.score} / {stored.total}
      </p>
      <p className="error-count" data-testid="result-wrong">
        錯誤 {wrong} 題
      </p>
      {dayId === TWO_NF_DAY_ID && wrong === 0 ? (
        <p data-testid="extra-unlock">
          已解鎖 <Link to={`/day/${EXTRA_DAY_ID}`}>Extra：反正規化設計</Link>
        </p>
      ) : null}
      <ol className="review" data-testid="review-list">
        {attempt.questions.map((q, i) => {
          const chosen = attempt.answers[i]
          const correct = chosen === q.answerIndex
          return (
            <li
              key={q.id}
              className={`review-item ${correct ? 'ok' : 'bad'}`}
              data-testid={`review-${i}`}
            >
              <header className="panel-head">
                <span className="panel-num">{i + 1}</span>
                <p className="prompt">{q.prompt}</p>
                <p className={`verdict ${correct ? 'ok' : 'bad'}`}>
                  <span className="result-icon" aria-hidden="true">
                    {correct ? '✓' : '✕'}
                  </span>
                  <span>{correct ? '正確' : '錯誤'}</span>
                </p>
              </header>
              <div className="panel-body">
                <p>
                  你的作答：
                  {chosen === null ? (
                    '（未作答）'
                  ) : (
                    <ChoiceText text={q.choices[chosen]} />
                  )}
                </p>
                {!correct ? (
                  <p>
                    正確答案：
                    <ChoiceText text={q.choices[q.answerIndex]} />
                  </p>
                ) : null}
                <p className="explain">{q.explanation}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <button type="button" className="primary" data-testid="retry-quiz" onClick={retry}>
        重新測驗
      </button>
    </div>
  )
}
