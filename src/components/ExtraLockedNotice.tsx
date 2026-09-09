import { Link } from 'react-router-dom'
import { TWO_NF_DAY_ID } from '../content/days'

export function ExtraLockedNotice() {
  return (
    <p className="rounded-2xl bg-card px-4 py-6 text-center ring-1 ring-border" data-testid="extra-locked">
      隱藏關在 <Link to={`/day/${TWO_NF_DAY_ID}`}>關 {TWO_NF_DAY_ID}（2NF）</Link> 測驗滿分後解鎖。
    </p>
  )
}
