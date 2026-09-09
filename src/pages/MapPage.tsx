import { Check, Clock, Lock, Play, Star, Wrench } from 'lucide-react'
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

const STATUS_ICON = { locked: Lock, current: Play, 'in-progress': Clock, done: Check } as const

const STATUS_STYLE = {
  locked: 'bg-muted/50 text-muted-foreground border-border opacity-75',
  current: 'bg-card border-primary shadow-[0_4px_0_0_var(--primary)] -translate-y-0.5',
  'in-progress': 'bg-card border-primary/40 shadow-[0_3px_0_0_var(--border)]',
  done: 'bg-success/10 border-success/40',
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
    const Icon = STATUS_ICON[status]
    return (
      <li key={day.id} className="min-w-0">
        <Link
          to={`/day/${day.id}`}
          className={cn(
            'day-card flex h-full flex-col gap-1.5 rounded-xl border p-3 no-underline transition-transform hover:-translate-y-1 hover:no-underline',
            STATUS_STYLE[status],
            meta.isBigBoss && status !== 'locked' && 'border-boss/50',
          )}
          data-testid={`day-card-${day.id}`}
          data-tone={tone}
          data-status={status}
        >
          <span className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Icon className={cn('size-3.5', status === 'current' && 'fill-primary text-primary', status === 'done' && 'text-success')} />
              {day.id === EXTRA_DAY_ID ? 'Extra' : `關 ${day.id}`}
            </span>
            {meta.isBigBoss ? <Star className="size-3.5 fill-boss text-boss" /> : null}
          </span>
          <strong className="text-sm leading-snug text-foreground">{day.title}</strong>
          <span className="mt-auto flex items-center gap-1 pt-1" aria-label={`課程 ${lessonsDone}/${meta.lessons.length}`}>
            {meta.lessons.map((l, i) => (
              <span key={l.id} className={cn('h-1.5 flex-1 rounded-full', i < lessonsDone ? 'bg-success' : 'bg-border')} />
            ))}
            <span className={cn('ml-1 size-2.5 rounded-sm rotate-45', bossDone ? 'bg-boss' : 'bg-border')} title="Boss" />
          </span>
        </Link>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <h1 className="m-0 text-2xl font-bold tracking-tight">地圖</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {cleared}/{CORE_DAY_COUNT} 關
        </span>
      </div>

      <section className="flex flex-col gap-4" data-testid="world-map">
        <Link
          to="/setup"
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3 no-underline hover:no-underline',
            setupOk ? 'bg-success/10 border-success/40' : 'bg-card border-primary shadow-[0_4px_0_0_var(--primary)]',
          )}
          data-testid="stage0-card"
        >
          <span className={cn('grid size-9 place-items-center rounded-lg', setupOk ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary')}>
            {setupOk ? <Check className="size-5" /> : <Wrench className="size-5" />}
          </span>
          <span className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">關 0</span>
            <strong className="text-foreground">環境設定</strong>
          </span>
          <span className="ml-auto text-sm font-semibold text-muted-foreground">
            {setupCount}/{SETUP_STEPS.length}
          </span>
        </Link>

        <ul className="m-0 flex list-none flex-col gap-4 p-0" data-testid="day-grid">
          {WORLDS.map((w) => {
            const done = worldDone(state, w.id)
            return (
              <li key={w.id} className={cn('world rounded-2xl border bg-card/60 p-4', done && 'border-success/30 bg-success/5')}>
                <h2 className="m-0 flex items-center gap-2 text-base font-bold">
                  <span className="text-xs font-semibold text-muted-foreground">世界 {w.id}</span>
                  {w.name}
                  {done ? <Check className="size-4 text-success" /> : null}
                </h2>
                <p className="mt-0.5 mb-3 text-sm text-muted-foreground">{w.blurb}</p>
                <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3">{w.stageIds.map(renderStage)}</ul>
              </li>
            )
          })}
          {unlocked ? (
            <li className="world rounded-2xl border border-boss/30 bg-boss/5 p-4">
              <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-bold">
                <span className="text-xs font-semibold text-muted-foreground">隱藏</span>
                隱藏關
              </h2>
              <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3">{renderStage(EXTRA_DAY_ID)}</ul>
            </li>
          ) : null}
        </ul>
      </section>

      <details className="group rounded-2xl border bg-card/60" data-testid="badges">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold select-none">
          徽章 {earned.length}/{all.length}
          <span className="float-right text-muted-foreground group-open:rotate-180">▾</span>
        </summary>
        <ul className="m-0 grid list-none grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
          {all.map((b) => (
            <li
              key={b.id}
              className={cn('flex flex-col items-center rounded-xl border p-3 text-center', b.earned ? 'border-gold bg-gold/15' : 'bg-muted/50 opacity-70')}
              title={b.hint}
            >
              <span className={cn('grid size-10 place-items-center text-2xl', b.earned && 'animate-pop')} aria-hidden="true">
                {b.earned ? b.emoji : <Lock className="size-5 text-muted-foreground" />}
              </span>
              <span className="mt-1 text-sm font-semibold">{b.name}</span>
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
