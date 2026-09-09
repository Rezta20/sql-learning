import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CardBox } from '../components/CardBox'
import { useToast } from '../components/Toast'
import { cards } from '../content/cards'
import { getDay } from '../content/days'
import { todayKey } from '../lib/dates'
import { XP, dueCards } from '../lib/progress'
import { loadState, updateState } from '../lib/storage'

type Filter = 'due' | 'all'

export function CardsPage() {
  const [state, setState] = useState(() => loadState())
  const toast = useToast()
  const due = dueCards(state, cards)
  const [filter, setFilter] = useState<Filter>(() => (due.length > 0 ? 'due' : 'all'))
  const graduated = cards.filter((c) => state.cards[String(c.n)]?.graduatedAt).length
  const written = Object.keys(state.cards).length

  const mutate = (fn: Parameters<typeof updateState>[0], msg?: string) => {
    setState(updateState(fn))
    if (msg) toast(msg)
  }

  const list = filter === 'due' ? due.map((d) => d.card) : cards
  const byStage = new Map<number, typeof cards>()
  for (const c of list) byStage.set(c.stage, [...(byStage.get(c.stage) ?? []), c])

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'due', label: '📖 今天到期', count: due.length },
    { id: 'all', label: '全部', count: cards.length },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="m-0 text-2xl font-black">📝 卡片</h1>
        <span className="text-sm text-muted-foreground">
          已抄 <b className="text-foreground">{written}</b> · 畢業 <b className="text-foreground">{graduated}</b>
        </span>
      </div>
      <p className="m-0 text-sm text-muted-foreground">App 上的 #編號 = 筆記本上的 #編號。抄好點一下；到期點一下；三次都會了就畢業。</p>

      <div className="tabs flex gap-1 rounded-full bg-muted p-1" data-testid="card-summary">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn(
              'tab flex flex-1 items-center justify-center gap-2 rounded-full py-1.5 text-sm font-semibold transition-colors',
              filter === t.id ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setFilter(t.id)}
          >
            {t.label}
            <span className={cn('rounded-full px-1.5 text-xs', filter === t.id ? 'bg-primary text-primary-foreground' : 'bg-border')}>{t.count}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? <p className="empty m-0">今天沒有到期的卡 🎉</p> : null}

      {Array.from(byStage.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([stage, group]) => (
          <section key={stage} className="flex flex-col gap-2">
            <h2 className="m-0 mt-2 text-sm font-bold text-muted-foreground">
              關 {stage} <span className="font-normal">· {stage === 0 ? '環境設定' : getDay(stage)?.title}</span>
            </h2>
            {group.map((card) => (
              <CardBox
                key={card.n}
                card={card}
                progress={state.cards[String(card.n)]}
                onWritten={() =>
                  mutate((s) => {
                    s.cards[String(card.n)] = { writtenAt: todayKey() }
                  }, `+${XP.card} XP`)
                }
                onUnwrite={() =>
                  mutate((s) => {
                    delete s.cards[String(card.n)]
                  })
                }
                onReview={(slot) =>
                  mutate((s) => {
                    const cp = s.cards[String(card.n)]
                    if (cp) cp[slot] = todayKey()
                  }, `+${XP.review} XP`)
                }
                onGraduate={() =>
                  mutate((s) => {
                    const cp = s.cards[String(card.n)]
                    if (cp) cp.graduatedAt = new Date().toISOString()
                  }, `🎓 +${XP.graduate} XP`)
                }
              />
            ))}
          </section>
        ))}
    </div>
  )
}
