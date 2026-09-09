import { BookOpen, ChevronDown, ChevronRight, GraduationCap, PenLine } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Card, CardProgress } from '../types'
import { dueSlot, readyToGraduate } from '../lib/progress'

type Props = {
  card: Card
  progress?: CardProgress
  onWritten?: () => void
  onReview?: (slot: 'd1' | 'd3' | 'd7') => void
  onGraduate?: () => void
  onUnwrite?: () => void
}

type Variant = 'gold' | 'go' | 'soft'

/**
 * 一張卡 = 一行 + 一顆按鈕。按鈕文字會變：抄好了 → 複習完了 → 畢業。
 * 點卡片本身展開例子／畫圖。
 */
export function CardBox({ card, progress, onWritten, onReview, onGraduate, onUnwrite }: Props) {
  const [open, setOpen] = useState(false)
  const due = progress ? dueSlot(progress) : null
  const grad = progress?.graduatedAt
  const ready = progress ? readyToGraduate(progress) : false
  const n = String(card.n).padStart(2, '0')
  const doneReviews = progress ? ['d1', 'd3', 'd7'].filter((k) => progress[k as 'd1' | 'd3' | 'd7']).length : 0

  let action: { label: string; icon?: ReactNode; onClick?: () => void; testId: string; variant: Variant } | null
  if (!progress) action = { label: '抄好了', icon: <PenLine className="size-4" />, onClick: onWritten, testId: `card-write-${card.n}`, variant: 'gold' }
  else if (grad) action = null
  else if (due) action = { label: '複習完了', icon: <BookOpen className="size-4" />, onClick: () => onReview?.(due), testId: `card-review-${card.n}`, variant: 'go' }
  else if (ready) action = { label: '畢業，撕下', icon: <GraduationCap className="size-4" />, onClick: onGraduate, testId: `card-grad-${card.n}`, variant: 'gold' }
  else action = { label: `等複習 ${doneReviews}/3`, testId: `card-wait-${card.n}`, variant: 'soft' }

  return (
    <article
      className={cn(
        'rounded-xl border bg-card transition-shadow',
        due && 'border-sky shadow-[0_3px_0_0_var(--sky)]',
        grad && 'opacity-70',
      )}
      data-testid={`card-${card.n}`}
    >
      <div className="flex items-center gap-3 p-3">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums', progress ? 'bg-gold text-gold-foreground' : 'bg-muted text-muted-foreground')}>#{n}</span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate">
              <strong>{card.en}</strong>
              <span className="text-muted-foreground">｜{card.zh}</span>
            </span>
            <span className="truncate text-sm text-muted-foreground">{card.line}</span>
          </span>
          <span className="ml-auto text-muted-foreground">{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</span>
        </button>
        <div className="shrink-0">
          {action ? (
            <Button type="button" variant={action.variant} size="sm" data-testid={action.testId} onClick={action.onClick} disabled={!action.onClick}>
              {action.icon}
              {action.label}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              <GraduationCap className="size-3.5" /> 畢業
            </span>
          )}
        </div>
      </div>
      {open ? (
        <div className="space-y-2 border-t px-4 py-3 text-sm animate-in fade-in slide-in-from-top-1">
          <p className="m-0">
            <span className="mr-2 font-bold text-muted-foreground">例子</span>
            <code>{card.example}</code>
          </p>
          <p className="m-0">
            <span className="mr-2 font-bold text-muted-foreground">畫圖</span>
            {card.draw}
          </p>
          {progress && !grad && onUnwrite ? (
            <Button type="button" variant="ghost" size="xs" className="text-muted-foreground" onClick={onUnwrite}>
              取消「已抄」
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
