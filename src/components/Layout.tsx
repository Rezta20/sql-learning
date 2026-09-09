import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { levelFor, streak, totalXp } from '../lib/progress'
import { useProgress } from '../lib/useProgress'
import { Buddy } from './Buddy'
import { TimerBar } from './TimerBar'

const NAV = [
  { to: '/', label: '今天', emoji: '🎯', end: true },
  { to: '/map', label: '地圖', emoji: '🗺' },
  { to: '/cards', label: '卡片', emoji: '📝' },
  { to: '/journal', label: '日誌', emoji: '📓' },
]

export function Layout() {
  const state = useProgress()
  const xp = totalXp(state)
  const lv = levelFor(xp)
  const days = streak(state)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 sm:px-6">
      <header className="sticky top-0 z-30 -mx-4 mb-6 border-b bg-background/85 px-4 pt-3 pb-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 no-underline hover:no-underline" data-testid="brand">
            <Buddy level={lv.lv} size="sm" />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-black text-foreground">Sasha 的 SQL 冒險</span>
              <span className="text-xs text-muted-foreground">
                Lv{lv.lv} {lv.name}
              </span>
            </span>
          </NavLink>

          <div className="min-w-0 flex-1" data-testid="xp-bar">
            <div className="mb-1 flex items-center justify-between text-xs font-bold">
              <span className="text-primary">{xp} XP</span>
              <span className="text-muted-foreground">
                {lv.next ? `→ Lv${lv.next.lv} 還差 ${lv.next.min - xp}` : '滿級'}
                {days > 0 ? ` · 🔥 ${days}` : ''}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-primary/15 ring-1 ring-primary/20">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-primary to-gold transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(2, lv.progress * 100)}%` }}
              >
                <div className="xp-shine absolute inset-0" />
              </div>
            </div>
          </div>

          <TimerBar />
        </div>

        <nav className="mt-3 flex gap-1 rounded-full bg-muted p-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-sm font-semibold no-underline transition-colors hover:no-underline',
                  isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <span aria-hidden="true">{n.emoji}</span>
              {n.label}
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
