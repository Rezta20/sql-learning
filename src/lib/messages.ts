import type { Exercise, Lesson, StoredState } from '../types'
import { cards } from '../content/cards'
import { getDay } from '../content/days'
import { errorEntries } from '../content/errors'
import { stageMeta } from '../content/lessons'
import { todayKey } from './dates'
import { dueCards, levelFor, streak, totalXp } from './progress'

function pad(n: number): string {
  return `#${String(n).padStart(2, '0')}`
}

export function lessonIndex(lesson: Lesson): number {
  const stage = Number(lesson.id.split('-')[0])
  return stageMeta(stage).lessons.findIndex((l) => l.id === lesson.id) + 1
}

export function whereText(stageId: number, lesson?: Lesson): string {
  const title = getDay(stageId)?.title ?? ''
  return lesson ? `關 ${stageId} 第 ${lessonIndex(lesson)} 課「${lesson.title}」` : `關 ${stageId}「${title}」`
}

/** 今天在 /stuck 查過的錯誤（給日誌草稿用） */
function stuckToday(state: StoredState): string[] {
  const today = todayKey()
  const ids = (state.stuckLog ?? []).filter((s) => s.startsWith(today + ':')).map((s) => s.slice(today.length + 1))
  return Array.from(new Set(ids)).map((id) => errorEntries.find((e) => e.id === id)?.looksLike ?? '（字典查不到的錯）')
}

/** App 自動產生的日誌草稿：老師只要潤一下、存檔。 */
export function journalDraft(state: StoredState, stageId: number, lesson?: Lesson): string {
  const today = todayKey()
  const lp = lesson ? state.lessons[lesson.id] : undefined
  const doneEx = lp?.exercises.filter(Boolean).length ?? 0
  const todayCards = Object.entries(state.cards)
    .filter(([, cp]) => cp.writtenAt === today)
    .map(([n]) => pad(Number(n)))
    .sort()
  const stuck = stuckToday(state)
  return [
    `# ${today} · ${whereText(stageId, lesson)}`,
    '',
    `- 今天的概念：${lesson?.concept ?? '—'}`,
    `- 卡片：${todayCards.length ? todayCards.join('、') : '今天沒有新卡'}`,
    `- 練習：${doneEx}/${lesson?.exercises.length ?? 0}、專案題 ${lp?.project ? '✅' : '❌'}、講出來 ${lp?.teach ? '✅' : '❌'}`,
    `- 卡住的地方：${stuck.length ? stuck.join('；') : '沒有卡住'}`,
    '- 一句話心得：（Sasha 填）',
    `- 明天第一件事：${nextThing(stageId, lesson)}`,
  ].join('\n')
}

function nextThing(stageId: number, lesson?: Lesson): string {
  if (!lesson) return '看今天頁的卡'
  const meta = stageMeta(stageId)
  const next = meta.lessons[lessonIndex(lesson)]
  if (next) return `關 ${stageId} 第 ${lessonIndex(next)} 課「${next.title}」：${next.focus}`
  return `關 ${stageId + 1} 第 1 課`
}

/** 貼給老師的訊息。全部集中在這裡，方便改。 */
export const messages = {
  start(state: StoredState, stageId: number, lesson?: Lesson): string {
    const due = dueCards(state, cards).map((d) => pad(d.card.n))
    return (
      `開始今天的課：${whereText(stageId, lesson)}。` +
      (lesson ? `\n今天只要學會：${lesson.focus}。` : '') +
      `\n請照默契：先暖身抽問 1 張到期卡${due.length ? `（今天到期：${due.join('、')}）` : '（今天沒有到期卡，跳過）'}，然後只講一個概念、5 行內。` +
      `\n練習題、專案題、Boss 我會自己對 App 裡的預期結果與參考答案，不用逐題判定；我卡住會先查 App 的錯誤字典。`
    )
  },
  tooMuch: '太多了。請把剛剛講的濃縮成 3 行，然後只給我「下一步一件事」。',
  stuck: '卡住了。App 的錯誤字典查不到。錯誤訊息／截圖在下面。只告訴我「哪一個字錯了」和怎麼改，不要重講概念。\n',
  exercise(stageId: number, lesson: Lesson, i: number): string {
    const ex = lesson.exercises[i]
    return `${whereText(stageId, lesson)} 第 ${i + 1} 題，我對過預期結果和參考答案還是不懂。只回我對／錯 + 一句原因。\n題目：${ex.task}\n預期：${ex.expect}\n我的結果：`
  },
  project(stageId: number, lesson: Lesson): string {
    return `${whereText(stageId, lesson)} 的專案題（寵物版），我對過參考答案但不確定。只回我對／錯 + 一句原因。\n題目：${lesson.project.task}\n我寫的：`
  },
  teach(stageId: number, lesson: Lesson): string {
    return `${whereText(stageId, lesson)}：我用自己的話講今天的概念，請聽聽看我講對了沒，一句話回我（關鍵字應該有：${lesson.teachKeys.join('、')}）：\n`
  },
  boss(stageId: number, boss: Exercise): string {
    return `關 ${stageId} 的 Boss 題我做了，對過參考答案但不確定過不過。只回過／不過 + 一句原因。\n題目：${boss.task}\n我的答案：`
  },
  settle(state: StoredState, stageId: number, lesson?: Lesson): string {
    const xp = totalXp(state)
    const lv = levelFor(xp)
    const today = todayKey()
    const written = Object.keys(state.cards)
      .map(Number)
      .sort((a, b) => a - b)
      .map(pad)
    return (
      `結算。今天是 ${today}。目前 ${whereText(stageId, lesson)}。` +
      `\n卡片累計已寫：${written.length ? written.join('、') : '（還沒有）'}。XP 總計 ${xp}（Lv${lv.lv} ${lv.name}）、連續 ${streak(state)} 天。` +
      `\n\nApp 已經幫我寫好日誌草稿（下面）。請：1) 把草稿存成 study/journal/${today}.md（心得那行等我補）；2) 更新 study/progress.md；3) 給我今天的手寫卡總表。不用重寫內容。\n\n` +
      journalDraft(state, stageId, lesson)
    )
  },
}
