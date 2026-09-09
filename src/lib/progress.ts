import type { Card, CardProgress, StoredState } from '../types'
import { SETUP_STEPS, WORLDS, stageMeta } from '../content/lessons'
import { CORE_DAY_COUNT } from '../content/days'
import { addDays, daysBetween, todayKey } from './dates'

/** XP 規則：只有這幾條，好記。 */
export const XP = {
  card: 10,
  exercise: 5,
  project: 5,
  teach: 20,
  boss: 30,
  bigBoss: 60,
  setup: 30,
  quizPerfect: 30,
  review: 2,
  graduate: 5,
  errorLog: 5,
} as const

export const LEVELS = [
  { lv: 1, name: '表格新手', min: 0 },
  { lv: 2, name: '串表學徒', min: 250 },
  { lv: 3, name: '效能獵人', min: 650 },
  { lv: 4, name: '架構師學徒', min: 1100 },
  { lv: 5, name: '資料庫工匠', min: 1700 },
]

export function setupDone(state: StoredState): boolean {
  const required = SETUP_STEPS.filter((s) => !s.label.startsWith('（'))
  return required.every((s) => state.setup[s.id])
}

export function totalXp(state: StoredState): number {
  let xp = 0
  for (const cp of Object.values(state.cards)) {
    xp += XP.card
    if (cp.d1) xp += XP.review
    if (cp.d3) xp += XP.review
    if (cp.d7) xp += XP.review
    if (cp.graduatedAt) xp += XP.graduate
  }
  for (const lp of Object.values(state.lessons)) {
    xp += lp.exercises.filter(Boolean).length * XP.exercise
    if (lp.project) xp += XP.project
    if (lp.teach) xp += XP.teach
  }
  for (const [stageId, done] of Object.entries(state.boss)) {
    if (!done) continue
    xp += stageMeta(Number(stageId)).isBigBoss ? XP.bigBoss : XP.boss
  }
  for (const score of Object.values(state.lastScore)) {
    if (score.total > 0 && score.score === score.total) xp += XP.quizPerfect
  }
  if (setupDone(state)) xp += XP.setup
  xp += state.errorLogCount * XP.errorLog
  return xp
}

export function levelFor(xp: number) {
  let current = LEVELS[0]
  for (const l of LEVELS) if (xp >= l.min) current = l
  const next = LEVELS.find((l) => l.min > current.min)
  return {
    ...current,
    next,
    progress: next ? (xp - current.min) / (next.min - current.min) : 1,
  }
}

export function streak(state: StoredState): number {
  const set = new Set(state.activity)
  let day = todayKey()
  if (!set.has(day)) day = addDays(day, -1)
  let n = 0
  while (set.has(day)) {
    n += 1
    day = addDays(day, -1)
  }
  return n
}

export type StageStatus = 'locked' | 'current' | 'in-progress' | 'done'

export function lessonDone(state: StoredState, lessonId: string, exerciseCount: number): boolean {
  const lp = state.lessons[lessonId]
  if (!lp) return false
  return lp.exercises.slice(0, exerciseCount).every(Boolean) && lp.project
}

export function stageDone(state: StoredState, stageId: number): boolean {
  return Boolean(state.boss[String(stageId)])
}

export function stageStarted(state: StoredState, stageId: number): boolean {
  const meta = stageMeta(stageId)
  return meta.lessons.some((l) => {
    const lp = state.lessons[l.id]
    return lp && (lp.exercises.some(Boolean) || lp.project || lp.teach || lp.concept)
  })
}

/** 目前應該進行的關卡：第一個還沒打贏 Boss 的關（不含 Extra）。 */
export function currentStageId(state: StoredState): number {
  for (let id = 1; id <= CORE_DAY_COUNT; id += 1) {
    if (!stageDone(state, id)) return id
  }
  return CORE_DAY_COUNT
}

export function stageStatus(state: StoredState, stageId: number): StageStatus {
  if (stageDone(state, stageId)) return 'done'
  if (stageStarted(state, stageId)) return 'in-progress'
  if (stageId === currentStageId(state)) return 'current'
  return 'locked'
}

/** 目前應該上的課：該關第一個沒完成的課。 */
export function currentLessonId(state: StoredState, stageId: number): string | undefined {
  const meta = stageMeta(stageId)
  return meta.lessons.find((l) => !lessonDone(state, l.id, l.exercises.length))?.id ?? meta.lessons.at(-1)?.id
}

export function worldDone(state: StoredState, worldId: number): boolean {
  const w = WORLDS.find((x) => x.id === worldId)
  return Boolean(w && w.stageIds.every((s) => stageDone(state, s)))
}

export type ReviewSlot = 'd1' | 'd3' | 'd7'

/** 1-3-7 複習：回傳今天到期（含逾期）的複習 slot。 */
export function dueSlot(cp: CardProgress, today = todayKey()): ReviewSlot | null {
  if (cp.graduatedAt) return null
  const age = daysBetween(today, cp.writtenAt)
  if (!cp.d1 && age >= 1) return 'd1'
  if (!cp.d3 && age >= 3) return 'd3'
  if (!cp.d7 && age >= 7) return 'd7'
  return null
}

export function dueCards(state: StoredState, cards: Card[]): Array<{ card: Card; slot: ReviewSlot }> {
  const out: Array<{ card: Card; slot: ReviewSlot }> = []
  for (const card of cards) {
    const cp = state.cards[String(card.n)]
    if (!cp) continue
    const slot = dueSlot(cp)
    if (slot) out.push({ card, slot })
  }
  return out
}

export function readyToGraduate(cp: CardProgress): boolean {
  return Boolean(cp.d1 && cp.d3 && cp.d7 && !cp.graduatedAt)
}

export type Badge = { id: string; emoji: string; name: string; hint: string; earned: boolean }

export function badges(state: StoredState): Badge[] {
  const cardsWritten = Object.keys(state.cards).length
  const graduated = Object.values(state.cards).filter((c) => c.graduatedAt).length
  const anyProject = Object.values(state.lessons).some((l) => l.project)
  const s = streak(state)
  return [
    { id: 'setup', emoji: '🛠️', name: '環境勇者', hint: '關 0 全部打勾', earned: setupDone(state) },
    { id: 'first-card', emoji: '✍️', name: '第一張卡', hint: '寫下第一張手寫卡', earned: cardsWritten >= 1 },
    { id: 'first-project', emoji: '🐾', name: '翻譯成自己的專案', hint: '完成第一題「換成你的專案」', earned: anyProject },
    { id: 'first-bug', emoji: '🐛', name: '自己抓到 bug', hint: '寫下第一筆錯誤日誌', earned: state.errorLogCount >= 1 },
    { id: 'join', emoji: '🔗', name: '第一次 JOIN 成功', hint: '打贏關 4 Boss', earned: stageDone(state, 4) },
    { id: 'world1', emoji: '🧩', name: '世界 1 通關', hint: '關 1–2 Boss 全過', earned: worldDone(state, 1) },
    { id: 'world2', emoji: '🔗', name: '世界 2 通關', hint: '關 3–5 Boss 全過', earned: worldDone(state, 2) },
    { id: 'week1', emoji: '⚡', name: '第一週 Boss', hint: '打贏關 7', earned: stageDone(state, 7) },
    { id: 'er', emoji: '📐', name: '第一張 ER 圖', hint: '打贏關 10 Boss', earned: stageDone(state, 10) },
    { id: 'streak7', emoji: '🔥', name: '連續 7 天', hint: '連續 7 天有學習動作', earned: s >= 7 },
    { id: 'grad10', emoji: '🎓', name: '畢業卡 ×10', hint: '10 張卡撕下放進信封', earned: graduated >= 10 },
    { id: 'final', emoji: '🏆', name: '資料庫工匠', hint: '打贏關 14 最終 Boss', earned: stageDone(state, 14) },
  ]
}

/** 今日流程 checklist（每天重置） */
export const ROUTINE_STEPS = [
  '打開 OrbStack',
  '筆記本、筆',
  '按「開始 45 分鐘」',
  '複習到期的卡',
  '按「開始」貼給老師',
  '照畫面一步一步做',
  '最後按「結算」貼給老師',
]

export function routineChecks(state: StoredState): boolean[] {
  const today = todayKey()
  if (state.routine.date !== today) return ROUTINE_STEPS.map(() => false)
  return ROUTINE_STEPS.map((_, i) => state.routine.checks[i] ?? false)
}
