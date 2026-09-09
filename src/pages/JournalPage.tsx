import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Markdown } from '../components/Markdown'
import { entryOnOrBefore, journal } from '../content/journal'
import { addDays, formatKey, todayKey } from '../lib/dates'

export function JournalPage() {
  const today = todayKey()
  const [selected, setSelected] = useState<string | undefined>(() => journal[0]?.date)
  const entry = selected ? journal.find((e) => e.date === selected) : undefined

  const jump = (daysAgo: number) => {
    const target = addDays(today, -daysAgo)
    const found = entryOnOrBefore(target)
    setSelected(found?.date)
    return found
  }

  const jumps = [
    { label: '昨天', n: 1 },
    { label: '3 天前', n: 3 },
    { label: '7 天前', n: 7 },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="m-0 text-2xl font-black">📓 學習日誌</h1>
        <span className="text-sm text-muted-foreground">結算後老師寫一篇</span>
      </div>
      <p className="m-0 text-sm text-muted-foreground">隔天、3 天、7 天回來看一眼，提醒自己學過什麼。</p>

      <div className="flex flex-wrap gap-2" data-testid="journal-jumps">
        {jumps.map((j) => {
          const target = addDays(today, -j.n)
          const found = entryOnOrBefore(target)
          return (
            <Button key={j.n} type="button" variant="soft" size="sm" className="rounded-full" onClick={() => jump(j.n)} disabled={!found}>
              {j.label}
              <span className="text-xs font-normal text-muted-foreground">{found ? formatKey(found.date) : '沒有紀錄'}</span>
            </Button>
          )
        })}
      </div>

      {journal.length === 0 ? (
        <p className="empty m-0">還沒有日誌。上完第一課、點「結算」貼給老師，這裡就會出現第一篇。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 sm:flex-col">
            {journal.map((e) => (
              <li key={e.date}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-xl px-3 py-2 text-left text-sm font-semibold whitespace-nowrap transition-colors',
                    e.date === selected ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground ring-1 ring-border hover:bg-accent',
                  )}
                  onClick={() => setSelected(e.date)}
                >
                  {e.date === today ? '今天 ' : ''}
                  {formatKey(e.date)}
                </button>
              </li>
            ))}
          </ul>
          <article className="rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6" data-testid="journal-entry">
            {entry ? <Markdown text={entry.body} /> : <p className="empty m-0">那天沒有紀錄。</p>}
          </article>
        </div>
      )}
    </div>
  )
}
