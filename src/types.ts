export type DayContent = {
  id: number
  title: string
  objectives: string[]
  keyPoints: string[]
  tasks: string[]
  relatedTables: string[]
}

export type Question = {
  id: string
  prompt: string
  choices: string[]
  answerIndex: number
  explanation: string
}

export type Lesson = {
  id: string
  title: string
  /** 今天只要學會這一件事（一句） */
  focus: string
  /** 你能……就算會了（一句） */
  check: string
  concept: string
  /** 卡片編號（對應 study/cards.json 的 n） */
  cards: number[]
  exercises: string[]
  /** 「換成你的專案」題（寵物營養） */
  project: string
}

export type StageMeta = {
  id: number
  world: number
  lessons: Lesson[]
  boss: string
  isBigBoss: boolean
}

export type World = {
  id: number
  name: string
  emoji: string
  stageIds: number[]
  blurb: string
}

export type Card = {
  n: number
  stage: number
  en: string
  zh: string
  line: string
  example: string
  draw: string
}

export type CardProgress = {
  writtenAt: string
  d1?: string
  d3?: string
  d7?: string
  graduatedAt?: string
}

export type LessonProgress = {
  concept: boolean
  exercises: boolean[]
  project: boolean
  teach: boolean
}

export type StoredState = {
  checklists: Record<string, boolean[]>
  lastScore: Record<string, { score: number; total: number; wrong?: number; at: string }>
  lessons: Record<string, LessonProgress>
  boss: Record<string, boolean>
  setup: Record<string, boolean>
  cards: Record<string, CardProgress>
  errorLogCount: number
  /** 有任何學習動作的日期（YYYY-MM-DD），用來算連續天數 */
  activity: string[]
  routine: { date: string; checks: boolean[] }
  timer: { startedAt: string } | null
  /** 最後一次存檔時間（ISO），雲端同步比新舊用 */
  savedAt?: string
}

export type QuizAttempt = {
  dayId: number
  questions: Question[]
  answers: Array<number | null>
  submitted: boolean
}
