import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { loadState, updateState } from '../lib/storage'

const PHASES = [
  { name: '暖身：複習到期卡', minutes: 3 },
  { name: '一個概念', minutes: 5 },
  { name: '抄手寫卡', minutes: 5 },
  { name: '動手：3 題 + 專案題', minutes: 25 },
  { name: 'Boss 題', minutes: 5 },
  { name: '結算', minutes: 2 },
]
const TOTAL_MIN = PHASES.reduce((n, p) => n + p.minutes, 0)

function phaseAt(elapsedSec: number) {
  let acc = 0
  for (const p of PHASES) {
    acc += p.minutes * 60
    if (elapsedSec < acc) return p
  }
  return null
}

function fmt(sec: number): string {
  const s = Math.max(0, sec)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function TimerBar() {
  const [startedAt, setStartedAt] = useState<string | null>(() => loadState().timer?.startedAt ?? null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const start = () => {
    const at = new Date().toISOString()
    updateState((s) => {
      s.timer = { startedAt: at }
    })
    setStartedAt(at)
    setNow(Date.now())
  }

  const stop = () => {
    updateState((s) => {
      s.timer = null
    })
    setStartedAt(null)
  }

  if (!startedAt) {
    return (
      <Button type="button" variant="soft" size="sm" className="rounded-full" data-testid="timer-start" onClick={start}>
        ⏱ {TOTAL_MIN} 分鐘
      </Button>
    )
  }

  const elapsed = Math.floor((now - new Date(startedAt).getTime()) / 1000)
  const remaining = TOTAL_MIN * 60 - elapsed
  const phase = phaseAt(elapsed)
  const pct = Math.min(100, (elapsed / (TOTAL_MIN * 60)) * 100)
  const over = remaining <= 0

  return (
    <div
      className={cn(
        'relative flex h-8 min-w-48 items-center overflow-hidden rounded-full text-xs font-bold ring-1',
        over ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-card text-foreground ring-border',
      )}
      data-testid="timer"
    >
      <div className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      <span className="relative flex-1 truncate px-3 tabular-nums">
        {!over ? `⏱ ${fmt(remaining)} · ${phase?.name ?? ''}` : '⏱ 時間到！收尾 → 結算'}
      </span>
      <button
        type="button"
        className="relative grid size-8 place-items-center text-muted-foreground hover:text-foreground"
        onClick={stop}
        aria-label="停止計時"
      >
        ✕
      </button>
    </div>
  )
}
