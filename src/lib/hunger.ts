import { daysBetween, todayKey } from './dates'
import type { StoredState } from '../types'

/**
 * 夥伴的飽食度：只看「最後一次學習是幾天前」。
 * 今天有做任何一步 = 餵飽（100）。每多一天沒學掉 25。
 * 不會死：最低是「餓昏躺平」，回來做一步就滿血。
 */
export const HUNGER_PER_DAY = 25

export type HungerStage = 'full' | 'ok' | 'hungry' | 'faint' | 'new'

export function lastStudyDay(state: StoredState): string | undefined {
  return [...state.activity].sort().at(-1)
}

export function daysSinceStudy(state: StoredState): number | null {
  const last = lastStudyDay(state)
  if (!last) return null
  return Math.max(0, daysBetween(todayKey(), last))
}

export function fullness(state: StoredState): number {
  const days = daysSinceStudy(state)
  if (days === null) return 50
  return Math.max(0, 100 - days * HUNGER_PER_DAY)
}

export function hungerStage(state: StoredState): HungerStage {
  const days = daysSinceStudy(state)
  if (days === null) return 'new'
  if (days === 0) return 'full'
  if (days === 1) return 'ok'
  if (days === 2) return 'hungry'
  return 'faint'
}

export const HUNGER_TEXT: Record<HungerStage, { label: string; line: string }> = {
  new: { label: '剛領養', line: '嗨，我是你的學習夥伴。做一步就算餵我一口。' },
  full: { label: '吃飽了', line: '今天餵過了，我很滿足。再做一步也可以，不勉強。' },
  ok: { label: '有點餓', line: '一天沒吃了。今天做一步，我就會滿血。' },
  hungry: { label: '很餓', line: '兩天沒吃了……做一小步就好，我等你。' },
  faint: { label: '餓昏了', line: '三天沒吃，我躺平了。不會死，但只有你回來學一步才會醒。' },
}
