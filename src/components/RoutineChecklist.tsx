import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ROUTINE_STEPS, routineChecks } from '../lib/progress'
import { todayKey } from '../lib/dates'
import { loadState, updateState } from '../lib/storage'

export function RoutineChecklist() {
  const [checks, setChecks] = useState<boolean[]>(() => routineChecks(loadState()))
  const [open, setOpen] = useState(false)
  const done = checks.filter(Boolean).length

  const toggle = (i: number) => {
    const next = checks.map((v, j) => (j === i ? !v : v))
    setChecks(next)
    updateState((s) => {
      s.routine = { date: todayKey(), checks: next }
    })
  }

  return (
    <section className="rounded-2xl bg-card/70 ring-1 ring-border" data-testid="routine">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>📋 今日流程</span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="flex gap-1">
            {ROUTINE_STEPS.map((_, i) => (
              <span key={i} className={cn('size-2 rounded-full', checks[i] ? 'bg-success' : 'bg-border')} />
            ))}
          </span>
          {done}/{ROUTINE_STEPS.length} {open ? '▾' : '▸'}
        </span>
      </button>
      {open ? (
        <ol className="m-0 list-none space-y-0.5 px-2 pb-2">
          {ROUTINE_STEPS.map((step, i) => (
            <li key={step} className={cn(checks[i] && 'text-muted-foreground line-through')}>
              <label className="choice-row py-1.5">
                <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} data-testid={`routine-${i}`} />
                <span className="choice text-sm">{step}</span>
              </label>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
