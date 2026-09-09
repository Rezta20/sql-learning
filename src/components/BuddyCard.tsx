import { Bone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HUNGER_TEXT, daysSinceStudy, fullness, hungerStage } from '../lib/hunger'
import { levelFor, totalXp } from '../lib/progress'
import type { StoredState } from '../types'
import { Buddy } from './Buddy'

const BAR: Record<string, string> = {
  full: 'bg-success',
  new: 'bg-success',
  ok: 'bg-primary',
  hungry: 'bg-amber-500',
  faint: 'bg-destructive',
}

/** 夥伴 + 飽食度條 + 一句話。首頁用 lg，頁首用 compact。 */
export function BuddyCard({ state, compact, cheer, say }: { state: StoredState; compact?: boolean; cheer?: boolean; say?: string }) {
  const lv = levelFor(totalXp(state))
  const stage = hungerStage(state)
  const f = fullness(state)
  const days = daysSinceStudy(state)
  const text = HUNGER_TEXT[stage]

  if (compact) {
    return (
      <div className="flex items-center gap-2" data-testid="buddy-compact">
        <Buddy level={lv.lv} stage={stage} size="sm" />
        <div className="hidden w-24 flex-col gap-0.5 sm:flex">
          <span className="text-[11px] leading-none font-semibold text-muted-foreground">
            飽食 {f}
          </span>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className={cn('h-full rounded-full transition-[width] duration-700', BAR[stage])} style={{ width: `${f}%` }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="flex w-full items-center gap-4 rounded-2xl border bg-card p-4" data-testid="buddy-card">
      <Buddy level={lv.lv} stage={stage} size="lg" cheer={cheer} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-bold">
            夥伴 <span className="text-muted-foreground">Lv{lv.lv}</span>
          </span>
          <span className={cn('text-sm font-semibold', stage === 'faint' && 'text-destructive', stage === 'hungry' && 'text-amber-600')}>{text.label}</span>
        </div>
        <div className="mt-2 flex items-center gap-2" data-testid="fullness" data-value={f}>
          <Bone className="size-4 text-muted-foreground" />
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
            <div className={cn('h-full rounded-full transition-[width] duration-700', BAR[stage])} style={{ width: `${f}%` }} />
          </div>
          <span className="w-9 text-right text-sm font-semibold tabular-nums">{f}</span>
        </div>
        <p className="mt-2 mb-0 text-sm leading-snug text-muted-foreground">
          {say ?? text.line}
          {days !== null && days > 0 ? <span className="ml-1 text-xs">（{days} 天沒學）</span> : null}
        </p>
      </div>
    </section>
  )
}
