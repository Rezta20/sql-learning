import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { days, CORE_DAY_COUNT, EXTRA_DAY_ID, extraUnlocked, getDay } from '../content/days'
import { WORLDS, SETUP_STEPS, stageMeta } from '../content/lessons'
import { showExtra } from '../lib/extraUnlock'
import { clearAllProgress, loadState } from '../lib/storage'
import { badges, setupDone, stageDone, stageStatus, worldDone } from '../lib/progress'

function cardTone(ratio: number, score: { score: number; total: number } | undefined): 'success' | 'idle' | 'warning' {
  const allTasks = ratio === 1
  const noTasks = ratio === 0
  const quizPerfect = Boolean(score && score.total > 0 && score.score === score.total)
  const noQuiz = !score

  if (allTasks && quizPerfect) return 'success'
  if (noTasks && noQuiz) return 'idle'
  return 'warning'
}

const STATUS_ICON = { locked: '🔒', current: '▶', 'in-progress': '⏳', done: '✅' } as const

const STATUS_STYLE = {
  locked: 'bg-muted/60 text-muted-foreground ring-border opacity-80',
  current: 'bg-card ring-2 ring-primary shadow-[0_6px_0_0_var(--primary)] -translate-y-0.5',
  'in-progress': 'bg-card ring-primary/40 shadow-[0_4px_0_0_var(--border)]',
  done: 'bg-success/10 ring-success/40 shadow-[0_4px_0_0_oklch(0.68_0.16_150_/_0.4)]',
} as const

export function MapPage() {
  const [state, setState] = useState(() => loadState())

  const checklistRatio = (id: number) => {
    const flags = state.checklists[String(id)]
    const total = days.find((d) => d.id === id)?.tasks.length ?? 0
    if (!flags || total === 0) return 0
    return flags.filter(Boolean).length / total
  }

  const [unlocked, setUnlocked] = useState(() => extraUnlocked())
  const shownDays = unlocked ? days : days.filter((d) => d.id <= CORE_DAY_COUNT)

  const quizDays = shownDays.filter((d) => d.id <= CORE_DAY_COUNT && state.lastScore[String(d.id)]).length
  const taskDone = shownDays.reduce((n, d) => {
    const flags = state.checklists[String(d.id)] ?? []
    return n + flags.filter(Boolean).length
  }, 0)
  const taskTotal = shownDays.reduce((n, d) => n + d.tasks.length, 0)
  const cleared = Array.from({ length: CORE_DAY_COUNT }, (_, i) => i + 1).filter((id) => stageDone(state, id)).length

  const tapCount = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key !== '1') return
      if (extraUnlocked()) return
      tapCount.current += 1
      if (tapTimer.current) clearTimeout(tapTimer.current)
      if (tapCount.current >= 5) {
        tapCount.current = 0
        showExtra()
        setUnlocked(true)
        return
      }
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0
      }, 2000)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (tapTimer.current) clearTimeout(tapTimer.current)
    }
  }, [])

  const reset = () => {
    const ok = window.confirm('確定要清除所有進度、卡片、XP 與測驗成績？此動作無法復原。')
    if (!ok) return
    clearAllProgress()
    setUnlocked(false)
    setState(loadState())
  }

  const setupOk = setupDone(state)
  const setupCount = SETUP_STEPS.filter((s) => state.setup[s.id]).length
  const all = badges(state)
  const earned = all.filter((b) => b.earned)

  const renderStage = (id: number) => {
    const day = getDay(id)
    if (!day) return null
    const score = state.lastScore[String(day.id)]
    const ratio = checklistRatio(day.id)
    const tone = cardTone(ratio, score)
    const status = stageStatus(state, day.id)
    const meta = stageMeta(day.id)
    const lessonsDone = meta.lessons.filter((l) => {
      const lp = state.lessons[l.id]
      return lp && lp.exercises.slice(0, l.exercises.length).every(Boolean) && lp.project
    }).length
    const bossDone = Boolean(state.boss[String(day.id)])
    return (
      <li key={day.id} className="min-w-0">
        <Link
          to={`/day/${day.id}`}
          className={cn(
            'day-card flex h-full flex-col gap-1.5 rounded-2xl p-3 no-underline ring-1 transition-transform hover:-translate-y-1 hover:no-underline',
            STATUS_STYLE[status],
            meta.isBigBoss && status !== 'locked' && 'ring-boss/50',
          )}
          data-testid={`day-card-${day.id}`}
          data-tone={tone}
          data-status={status}
        >
          <span className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>
              {STATUS_ICON[status]} {day.id === EXTRA_DAY_ID ? 'Extra' : `關 ${day.id}`}
            </span>
            {meta.isBigBoss ? <span className="text-boss">★</span> : null}
          </span>
          <strong className="text-sm leading-snug text-foreground">{day.title}</strong>
          <span className="mt-auto flex items-center gap-1 pt-1" aria-label={`課程 ${lessonsDone}/${meta.lessons.length}`}>
            {meta.lessons.map((l, i) => (
              <span key={l.id} className={cn('h-1.5 flex-1 rounded-full', i < lessonsDone ? 'bg-success' : 'bg-border')} />
            ))}
            <span className={cn('ml-1 text-xs', bossDone ? '' : 'opacity-30 grayscale')} title="Boss">
              👾
            </span>
          </span>
        </Link>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <h1 className="m-0 text-2xl font-black">🗺 地圖</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {cleared}/{CORE_DAY_COUNT} 關
        </span>
      </div>

      <section className="flex flex-col gap-4" data-testid="world-map">
        <Link
          to="/setup"
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 no-underline ring-1 hover:no-underline',
            setupOk ? 'bg-success/10 ring-success/40' : 'bg-card ring-2 ring-primary shadow-[0_5px_0_0_var(--primary)]',
          )}
          data-testid="stage0-card"
        >
          <span className="text-2xl">🛠</span>
          <span className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground">{setupOk ? '✅' : '▶'} 關 0</span>
            <strong className="text-foreground">環境設定</strong>
          </span>
          <span className="ml-auto text-sm font-bold text-muted-foreground">
            {setupCount}/{SETUP_STEPS.length}
          </span>
        </Link>

        <ul className="m-0 flex list-none flex-col gap-4 p-0" data-testid="day-grid">
          {WORLDS.map((w) => {
            const done = worldDone(state, w.id)
            return (
              <li key={w.id} className={cn('world rounded-3xl bg-card/70 p-4 ring-1 ring-border', done && 'bg-success/5 ring-success/30')}>
                <h2 className="m-0 flex items-center gap-2 text-base font-black">
                  <span className="text-2xl" aria-hidden="true">
                    {w.emoji}
                  </span>
                  {w.name}
                  {done ? <span className="text-success">✅</span> : null}
                </h2>
                <p className="mt-0.5 mb-3 text-sm text-muted-foreground">{w.blurb}</p>
                <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3">{w.stageIds.map(renderStage)}</ul>
              </li>
            )
          })}
          {unlocked ? (
            <li className="world rounded-3xl bg-gradient-to-br from-fuchsia-50 to-sky-50 p-4 ring-1 ring-fuchsia-200">
              <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-black">
                <span className="text-2xl" aria-hidden="true">
                  🌈
                </span>
                隱藏關
              </h2>
              <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3">{renderStage(EXTRA_DAY_ID)}</ul>
            </li>
          ) : null}
        </ul>
      </section>

      <details className="group rounded-3xl bg-card/70 ring-1 ring-border" data-testid="badges">
        <summary className="cursor-pointer list-none px-4 py-3 font-bold select-none">
          🏅 徽章 {earned.length}/{all.length}
          <span className="float-right text-muted-foreground group-open:rotate-180">▾</span>
        </summary>
        <ul className="m-0 grid list-none grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
          {all.map((b) => (
            <li
              key={b.id}
              className={cn('flex flex-col items-center rounded-2xl p-3 text-center ring-1', b.earned ? 'bg-gold/20 ring-gold' : 'bg-muted/50 ring-border opacity-70')}
              title={b.hint}
            >
              <span className={cn('text-3xl', b.earned && 'animate-pop')} aria-hidden="true">
                {b.earned ? b.emoji : '🔒'}
              </span>
              <span className="mt-1 text-sm font-bold">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.hint}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p data-testid="home-progress" className="m-0">
          同事教材任務 {taskDone} / {taskTotal}　·　已測驗 {quizDays} / {CORE_DAY_COUNT}
          {unlocked ? '　·　Extra 已解鎖' : ''}
        </p>
        <Button type="button" variant="ghost" size="xs" className="text-destructive" data-testid="reset-progress" onClick={reset}>
          重設學習記錄
        </Button>
      </div>
    </div>
  )
}
