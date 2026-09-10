import { Bug, LifeBuoy, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CopyButton } from '../components/CommandPanel'
import { useToast } from '../components/Toast'
import { cardLabel, getCard } from '../content/cards'
import { errorEntries, matchErrors, type ErrorEntry } from '../content/errors'
import { todayKey } from '../lib/dates'
import { messages } from '../lib/messages'
import { XP } from '../lib/progress'
import { updateState } from '../lib/storage'

function EntryCard({ e, hit }: { e: ErrorEntry; hit?: boolean }) {
  return (
    <li className={cn('rounded-xl border bg-card p-4 text-left', hit && 'border-primary shadow-[0_3px_0_0_var(--primary)]')} data-testid={`stuck-entry-${e.id}`}>
      <p className="m-0 font-mono text-xs break-all text-muted-foreground">{e.looksLike}</p>
      <p className="mt-2 mb-1 text-sm">
        <span className="mr-1 rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-bold text-destructive">哪個字錯了</span>
        {e.where}
      </p>
      <p className="m-0 text-sm">
        <span className="mr-1 rounded bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success">怎麼改</span>
        {e.fix}
      </p>
      {e.cards?.length ? (
        <p className="mt-2 mb-0 text-xs text-muted-foreground">
          回去看卡：
          {e.cards.map((n) => {
            const c = getCard(n)
            return c ? (
              <span key={n} className="ml-1 rounded bg-gold/20 px-1.5 py-0.5">
                {cardLabel(c)}
              </span>
            ) : null
          })}
        </p>
      ) : null}
    </li>
  )
}

export function StuckPage() {
  const toast = useToast()
  const [text, setText] = useState('')
  const [browse, setBrowse] = useState(false)
  const hits = useMemo(() => matchErrors(text), [text])
  const tried = text.trim().length > 0

  const groups = useMemo(() => {
    const m = new Map<ErrorEntry['group'], ErrorEntry[]>()
    for (const e of errorEntries) m.set(e.group, [...(m.get(e.group) ?? []), e])
    return Array.from(m.entries())
  }, [])

  const logIt = () => {
    updateState((s) => {
      s.errorLogCount += 1
      const ids = hits.map((h) => `${todayKey()}:${h.id}`)
      s.stuckLog = [...(s.stuckLog ?? []), ...(ids.length ? ids : [`${todayKey()}:unknown`])]
    })
    toast(`+${XP.errorLog} XP，錯誤日誌 +1`)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="crumbs m-0">
        <Link to="/">← 今天</Link>
      </p>
      <div className="flex items-center gap-2">
        <LifeBuoy className="size-6 text-sky-700" />
        <h1 className="m-0 text-2xl font-bold tracking-tight">卡住了</h1>
      </div>
      <p className="m-0 text-sm text-muted-foreground">先貼錯誤訊息（ERROR 那一行就好）。字典查得到就不用問老師。</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='例如：ERROR:  column "Taipei" does not exist'
        rows={3}
        className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="stuck-input"
        autoFocus
      />

      {hits.length > 0 ? (
        <section className="flex flex-col gap-2" data-testid="stuck-hits">
          <h2 className="m-0 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Search className="size-4" /> 找到 {hits.length} 條
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {hits.map((e) => (
              <EntryCard key={e.id} e={e} hit />
            ))}
          </ul>
          <Button type="button" variant="success" size="lg" className="mt-1 w-full max-w-sm self-center" onClick={logIt} data-testid="stuck-solved">
            <Bug className="size-4" /> 解決了，筆記本寫 3 行錯誤日誌（+{XP.errorLog}）
          </Button>
        </section>
      ) : tried ? (
        <section className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5" data-testid="stuck-miss">
          <p className="m-0 text-sm text-muted-foreground">字典裡沒有這個。把它貼給老師：</p>
          <CopyButton text={messages.stuck + text} label="問老師" after="貼上後補一張截圖。老師只會說哪個字錯了、怎麼改。" tone="plain" testId="stuck-ask" />
        </section>
      ) : null}

      <details className="group rounded-2xl border bg-card/60" open={browse} onToggle={(e) => setBrowse((e.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold select-none">
          翻字典（{errorEntries.length} 條）
          <span className="float-right text-muted-foreground group-open:rotate-180">▾</span>
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {groups.map(([g, list]) => (
            <section key={g}>
              <h3 className="m-0 mb-2 text-xs font-bold text-muted-foreground">{g}</h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {list.map((e) => (
                  <EntryCard key={e.id} e={e} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </div>
  )
}
