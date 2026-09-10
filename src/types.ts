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

/**
 * 一題練習：她自己對答案，不用問老師。
 * 三層漸進揭露：hint（卡住先看）→ expect（跟自己的結果比）→ answer（真的不會再看）。
 */
export type Exercise = {
  /** 題目（要打的 SQL 或要做的事） */
  task: string
  /** 提示：一句話，指方向不給答案 */
  hint: string
  /** 預期結果：筆數＋前幾列，用實際跑 seed 的結果寫的 */
  expect: string
  /** 參考答案（SQL 或文字） */
  answer: string
  /** 常見錯法（可省略） */
  pitfalls?: string[]
}

export type Lesson = {
  id: string
  title: string
  /** 今天只要學會這一件事（一句） */
  focus: string
  /** 你能……就算會了（一句） */
  check: string
  /** 一句話概念（畫面上最大的字） */
  concept: string
  /** 展開講解：≤5 行，比喻＋英文｜中文｜一句話｜例子 */
  explain: string[]
  /** 卡片編號（對應 study/cards.json 的 n） */
  cards: number[]
  exercises: Exercise[]
  /** 「換成你的專案」題（寵物營養） */
  project: Exercise
  /** 「用自己的話講」自評：講出來的內容要碰到這 3 個關鍵字 */
  teachKeys: string[]
}

export type StageMeta = {
  id: number
  world: number
  lessons: Lesson[]
  boss: Exercise
  isBigBoss: boolean
}

export type World = {
  id: number
  name: string
  emoji: string
  stageIds: number[]
  blurb: string
  /** 暖身影片（可跳過、不給 XP）：沒精神時看 ≤10 分鐘 */
  video?: { title: string; url: string; minutes: number; note?: string }
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
  /** 在 /stuck 查過的錯誤：`YYYY-MM-DD:errorId`，結算時附進日誌草稿 */
  stuckLog?: string[]
}

export type QuizAttempt = {
  dayId: number
  questions: Question[]
  answers: Array<number | null>
  submitted: boolean
}
