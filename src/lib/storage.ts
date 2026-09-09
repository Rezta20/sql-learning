import type { QuizAttempt, StoredState } from '../types'
import { hideExtra } from './extraUnlock'
import { todayKey } from './dates'

export const STORAGE_KEY = 'sql-learning:v1'
const QUIZ_PREFIX = 'sql-learning:quiz:'

function empty(): StoredState {
  return {
    checklists: {},
    lastScore: {},
    lessons: {},
    boss: {},
    setup: {},
    cards: {},
    errorLogCount: 0,
    activity: [],
    routine: { date: '', checks: [] },
    timer: null,
  }
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Partial<StoredState>
    const base = empty()
    return {
      ...base,
      ...parsed,
      checklists: parsed.checklists ?? {},
      lastScore: Object.fromEntries(
        Object.entries(parsed.lastScore ?? {}).map(([key, value]) => [
          key,
          {
            score: value.score,
            total: value.total,
            wrong: value.wrong ?? Math.max(0, value.total - value.score),
            at: value.at,
          },
        ]),
      ),
      lessons: parsed.lessons ?? {},
      boss: parsed.boss ?? {},
      setup: parsed.setup ?? {},
      cards: parsed.cards ?? {},
      errorLogCount: parsed.errorLogCount ?? 0,
      activity: parsed.activity ?? [],
      routine: parsed.routine ?? base.routine,
      timer: parsed.timer ?? null,
    }
  } catch {
    return empty()
  }
}

/** 進度一改就廣播，讓 Layout 的 XP 條／夥伴即時更新。 */
export const PROGRESS_EVENT = 'sql-progress-changed'

export function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROGRESS_EVENT))
}

/** 讀取、修改、存回，並把今天記進 activity（算連續天數用）。 */
export function updateState(mutate: (state: StoredState) => void): StoredState {
  const state = loadState()
  mutate(state)
  const today = todayKey()
  if (!state.activity.includes(today)) state.activity = [...state.activity, today]
  saveState(state)
  return state
}

export function quizKey(dayId: number): string {
  return `${QUIZ_PREFIX}${dayId}`
}

export function loadQuiz(dayId: number): QuizAttempt | null {
  try {
    const raw = sessionStorage.getItem(quizKey(dayId))
    if (!raw) return null
    return JSON.parse(raw) as QuizAttempt
  } catch {
    return null
  }
}

export function saveQuiz(attempt: QuizAttempt): void {
  sessionStorage.setItem(quizKey(attempt.dayId), JSON.stringify(attempt))
}

export function clearQuiz(dayId: number): void {
  sessionStorage.removeItem(quizKey(dayId))
}

export function clearAllProgress(): void {
  hideExtra()
  localStorage.removeItem(STORAGE_KEY)
  const toRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(QUIZ_PREFIX)) toRemove.push(key)
  }
  toRemove.forEach((key) => sessionStorage.removeItem(key))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROGRESS_EVENT))
}
