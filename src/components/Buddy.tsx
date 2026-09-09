import { cn } from '@/lib/utils'

/** 學習夥伴：依等級長大的小狗。Lv1 幼犬 → Lv5 戴皇冠。 */
const STAGES = [
  { emoji: '🐶', title: '幼犬', bg: 'from-orange-100 to-amber-50' },
  { emoji: '🐕', title: '小狗', bg: 'from-orange-200 to-amber-100' },
  { emoji: '🦮', title: '導盲犬', bg: 'from-amber-200 to-yellow-100' },
  { emoji: '🐕‍🦺', title: '工作犬', bg: 'from-violet-200 to-fuchsia-100' },
  { emoji: '🐕', title: '犬王', bg: 'from-yellow-300 to-amber-200', crown: true },
]

type Props = {
  level: number
  size?: 'sm' | 'md' | 'lg'
  mood?: 'idle' | 'happy' | 'cheer'
  say?: string
  className?: string
}

const SIZE = {
  sm: { box: 'size-11 text-2xl', crown: 'text-sm -top-2' },
  md: { box: 'size-20 text-5xl', crown: 'text-xl -top-3' },
  lg: { box: 'size-28 text-7xl', crown: 'text-3xl -top-4' },
}

export function Buddy({ level, size = 'md', mood = 'idle', say, className }: Props) {
  const s = STAGES[Math.min(STAGES.length, Math.max(1, level)) - 1]
  const sz = SIZE[size]
  return (
    <div className={cn('flex items-center gap-3', className)} data-testid="buddy" data-level={level}>
      <div
        className={cn(
          'relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br shadow-inner ring-4 ring-white',
          s.bg,
          sz.box,
          mood === 'idle' && 'animate-float',
          mood === 'happy' && 'animate-wiggle',
          mood === 'cheer' && 'animate-bounce',
        )}
        aria-label={`夥伴：${s.title}`}
      >
        {s.crown ? <span className={cn('absolute left-1/2 -translate-x-1/2', sz.crown)}>👑</span> : null}
        <span aria-hidden="true">{s.emoji}</span>
      </div>
      {say ? (
        <div className="relative max-w-xs rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-sm leading-snug shadow-sm ring-1 ring-border animate-in fade-in slide-in-from-left-2">
          {say}
        </div>
      ) : null}
    </div>
  )
}
