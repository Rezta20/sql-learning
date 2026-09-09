import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MiniCommands } from '../components/CommandPanel'
import { useToast } from '../components/Toast'
import { SETUP_STEPS } from '../content/lessons'
import { copyText } from '../lib/clipboard'
import { XP, setupDone } from '../lib/progress'
import { loadState, updateState } from '../lib/storage'

const EXPLAIN = [
  ['OrbStack', 'Docker 的引擎。沒開，docker 指令都不會動。'],
  ['容器 learning-pg', 'Mac 裡的迷你電腦，PostgreSQL 裝在裡面。壞了 docker rm -f learning-pg 重來。'],
  ['5432', 'PostgreSQL 的門牌號碼，TablePlus 靠它連進去。'],
  ['psql', '跟資料庫講 SQL 的視窗。離開打 \\q。'],
  ['電腦重開後', '開 OrbStack → docker start learning-pg。不用重新匯入。'],
]

export function SetupPage() {
  const [state, setState] = useState(() => loadState())
  const toast = useToast()
  const done = SETUP_STEPS.filter((s) => state.setup[s.id]).length
  const cleared = setupDone(state)
  const firstOpen = SETUP_STEPS.findIndex((s) => !state.setup[s.id])

  const toggle = (id: string) => {
    const wasDone = state.setup[id]
    const next = updateState((s) => {
      s.setup[id] = !s.setup[id]
    })
    setState(next)
    if (!wasDone && setupDone(next) && !cleared) toast(`關 0 過關！+${XP.setup} XP`)
  }

  const copy = async (cmd: string) => {
    const ok = await copyText(cmd)
    toast(ok ? '已複製 → 終端機 Cmd+V、Enter' : '複製失敗')
  }

  return (
    <article className="flex flex-col gap-4">
      <p className="crumbs m-0">
        <Link to="/">← 今天</Link>
      </p>
      <div className="flex items-end justify-between">
        <h1 className="m-0 text-2xl font-bold tracking-tight">關 0 · 環境設定</h1>
        <span className="text-sm text-muted-foreground">一步一步：複製 → 貼到終端機 → 看到結果 → 打勾</span>
      </div>

      <div className="flex items-center gap-3" data-testid="setup-progress">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(done / SETUP_STEPS.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {done}/{SETUP_STEPS.length}
        </span>
      </div>

      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {SETUP_STEPS.map((step, i) => {
          const checked = Boolean(state.setup[step.id])
          const optional = step.label.startsWith('（')
          const current = i === firstOpen
          return (
            <li
              key={step.id}
              className={cn(
                'rounded-xl border bg-card p-3 transition-all',
                current && 'step-card-shadow border-primary',
                checked && 'border-success/30 bg-success/5',
                optional && !current && 'opacity-80',
              )}
              data-testid={`setup-${step.id}`}
            >
              <label className="flex cursor-pointer items-center gap-3 font-medium">
                <span className="relative grid size-7 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(step.id)}
                    data-testid={`setup-check-${step.id}`}
                    className={cn(
                      'peer absolute inset-0 m-0 size-7 cursor-pointer appearance-none rounded-full ring-2 transition-colors',
                      checked ? 'bg-success ring-success' : current ? 'bg-card ring-primary' : 'bg-muted ring-border',
                    )}
                  />
                  <span className={cn('pointer-events-none relative text-xs font-black', checked ? 'text-white' : current ? 'text-primary' : 'text-muted-foreground')}>
                    {checked ? '✓' : i + 1}
                  </span>
                </span>
                <span className={cn(checked && 'text-muted-foreground line-through')}>{step.label}</span>
              </label>
              {step.command ? (
                <div className="mt-2 flex items-stretch gap-2">
                  <pre className="m-0 min-w-0 flex-1 overflow-x-auto rounded-lg bg-foreground px-3 py-2 text-sm text-background">
                    <code>{step.command}</code>
                  </pre>
                  <Button type="button" variant="go" className="self-center" onClick={() => copy(step.command!)}>
                    複製
                  </Button>
                </div>
              ) : null}
              {step.hint && (current || checked) ? <p className="mt-2 mb-0 text-sm text-muted-foreground">{step.hint}</p> : null}
            </li>
          )
        })}
      </ol>

      <details className="group rounded-xl border bg-card/60">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold select-none">
          這些東西在幹嘛（一句話版）
          <span className="float-right text-muted-foreground group-open:rotate-180">▾</span>
        </summary>
        <ul className="m-0 list-none space-y-2 px-4 pb-4 text-sm">
          {EXPLAIN.map(([k, v]) => (
            <li key={k} className="flex gap-2">
              <strong className="shrink-0 text-primary">{k}</strong>
              <span className="text-muted-foreground">{v}</span>
            </li>
          ))}
        </ul>
      </details>

      <MiniCommands />
    </article>
  )
}
