import { BookOpen, Cloud, CloudOff, Map, NotebookPen, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { levelFor, streak, totalXp } from '../lib/progress'
import { SYNC_EVENT, getSyncStatus } from '../lib/sync'
import { useProgress } from '../lib/useProgress'
import { BuddyCard } from './BuddyCard'
import { TimerBar } from './TimerBar'

const NAV = [
  { to: '/', label: '今天', Icon: Target, end: true },
  { to: '/map', label: '地圖', Icon: Map },
  { to: '/cards', label: '卡片', Icon: NotebookPen },
  { to: '/journal', label: '日誌', Icon: BookOpen },
]

export function Layout() {
  const state = useProgress()
  const xp = totalXp(state)
  const lv = levelFor(xp)
  const days = streak(state)
  const [sync, setSync] = useState(() => getSyncStatus())
  useEffect(() => {
    const f = () => setSync(getSyncStatus())
    window.addEventListener(SYNC_EVENT, f)
    return () => window.removeEventListener(SYNC_EVENT, f)
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 sm:px-6">
      <header className="sticky top-0 z-30 -mx-4 mb-6 border-b bg-background/90 px-4 pt-3 pb-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="no-underline hover:no-underline" data-testid="brand">
            <BuddyCard state={state} compact />
          </NavLink>

          <div className="min-w-0 flex-1" data-testid="xp-bar">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold">
                Lv{lv.lv} {lv.name} <span className="text-primary">· {xp} XP</span>
              </span>
              <span className="text-muted-foreground">
                {lv.next ? `距 Lv${lv.next.lv} 還差 ${lv.next.min - xp}` : '滿級'}
                {days > 0 ? ` · 連續 ${days} 天` : ''}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-border">
              <div className="relative h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${Math.max(1.5, lv.progress * 100)}%` }}>
                <div className="xp-shine absolute inset-0" />
              </div>
            </div>
          </div>

          <TimerBar />
          <NavLink
            to="/sync"
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-full border no-underline transition-colors hover:bg-accent hover:no-underline',
              sync.status === 'off' && 'text-muted-foreground',
              sync.status === 'idle' && 'text-success',
              sync.status === 'syncing' && 'text-primary animate-pulse',
              sync.status === 'error' && 'text-destructive',
            )}
            title={sync.status === 'off' ? '雲端同步：未連線' : sync.status === 'error' ? `同步出錯：${sync.error}` : '雲端同步：已連線'}
            data-testid="sync-indicator"
            data-status={sync.status}
          >
            {sync.status === 'off' || sync.status === 'error' ? <CloudOff className="size-4" /> : <Cloud className="size-4" />}
          </NavLink>
        </div>

        <nav className="mt-3 flex gap-1 rounded-xl bg-muted p-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium no-underline transition-colors hover:no-underline',
                  isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
