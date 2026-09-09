import { cn } from '@/lib/utils'
import type { HungerStage } from '../lib/hunger'

/**
 * 學習夥伴：手繪風 SVG 小狗。
 * - 表情看飽食度：full 笑／ok 平靜／hungry 垂眼流汗／faint 躺平閉眼
 * - 配件看等級：Lv2 項圈、Lv3 領巾、Lv4 眼鏡、Lv5 皇冠
 */
type Props = {
  level: number
  stage: HungerStage
  size?: 'sm' | 'md' | 'lg'
  cheer?: boolean
  className?: string
}

const SIZE = { sm: 44, md: 96, lg: 140 }

const FUR = '#F1D3A6'
const FUR_DARK = '#C9894A'
const INK = '#3B2A1E'

export function Buddy({ level, stage, size = 'md', cheer, className }: Props) {
  const px = SIZE[size]
  const faint = stage === 'faint'
  const hungry = stage === 'hungry'
  const happy = stage === 'full' || stage === 'new'

  return (
    <div
      className={cn('relative inline-block shrink-0', cheer ? 'animate-bounce' : faint ? '' : 'animate-float', className)}
      style={{ width: px, height: px }}
      data-testid="buddy"
      data-level={level}
      data-stage={stage}
      aria-label={`學習夥伴（Lv${level}）`}
      role="img"
    >
      <svg viewBox="0 0 120 120" width={px} height={px} className={cn('transition-all duration-500', faint && 'rotate-[18deg] opacity-80 grayscale-[0.5]')}>
        {/* 耳朵 */}
        <path d="M30 40 C14 34 8 60 18 78 C24 88 34 84 36 72 Z" fill={FUR_DARK} className={cn('origin-[30px_45px] transition-transform', hungry || faint ? 'rotate-[10deg]' : '')} />
        <path d="M90 40 C106 34 112 60 102 78 C96 88 86 84 84 72 Z" fill={FUR_DARK} className={cn('origin-[90px_45px] transition-transform', hungry || faint ? '-rotate-[10deg]' : '')} />
        {/* 頭 */}
        <ellipse cx="60" cy="64" rx="36" ry="32" fill={FUR} />
        {/* 眼睛上的斑 */}
        <ellipse cx="78" cy="54" rx="13" ry="14" fill={FUR_DARK} opacity="0.9" />
        {/* 眼睛 */}
        {faint ? (
          <>
            <path d="M40 56 q6 -4 12 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M72 56 q6 -4 12 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : happy ? (
          <>
            <path d="M40 58 q6 -8 12 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M72 58 q6 -8 12 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="46" cy="56" r={hungry ? 3.2 : 4} fill={INK} />
            <circle cx="78" cy="56" r={hungry ? 3.2 : 4} fill={INK} />
            <circle cx="47.5" cy="54.5" r="1.2" fill="#fff" />
            <circle cx="79.5" cy="54.5" r="1.2" fill="#fff" />
            {hungry ? (
              <>
                <path d="M37 53 l17 -4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M87 53 l-17 -4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : null}
          </>
        )}
        {/* 鼻子與嘴 */}
        <ellipse cx="60" cy="70" rx="6" ry="4.5" fill={INK} />
        {faint ? (
          <path d="M50 82 q5 -4 10 0 q5 4 10 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : happy ? (
          <>
            <path d="M60 74 v5 M52 80 q8 8 16 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M56 81 q4 9 8 0 Z" fill="#E9707E" />
          </>
        ) : hungry ? (
          <path d="M52 84 q8 -6 16 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M60 74 v5 M53 80 q7 5 14 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {/* 流汗／暈 */}
        {hungry ? <path d="M96 40 q-6 8 0 12 q6 -4 0 -12 Z" fill="#7BB7E8" /> : null}
        {faint ? (
          <>
            <circle cx="100" cy="30" r="2.5" fill={INK} opacity="0.5" />
            <circle cx="108" cy="22" r="1.8" fill={INK} opacity="0.4" />
          </>
        ) : null}
        {/* 配件 */}
        {level >= 2 && level < 3 ? (
          <>
            <path d="M28 88 q32 14 64 0 v6 q-32 14 -64 0 Z" fill="#E0554A" />
            <circle cx="60" cy="99" r="4" fill="#F5C542" />
          </>
        ) : null}
        {level >= 3 && level < 4 ? <path d="M26 86 q34 12 68 0 l-20 10 l-14 12 l-14 -12 Z" fill="#E0554A" /> : null}
        {level >= 4 && level < 5 ? (
          <g stroke={INK} strokeWidth="2.5" fill="none">
            <circle cx="46" cy="56" r="9" />
            <circle cx="78" cy="56" r="9" />
            <path d="M55 56 h14 M37 55 l-8 -3 M87 55 l8 -3" />
          </g>
        ) : null}
        {level >= 5 ? <path d="M42 34 l6 -14 l8 9 l4 -12 l4 12 l8 -9 l6 14 Z" fill="#F5C542" stroke="#D9A21B" strokeWidth="1.5" /> : null}
      </svg>
    </div>
  )
}
