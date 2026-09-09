import type { Lesson, StoredState } from '../types'
import { cards } from '../content/cards'
import { getDay } from '../content/days'
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

/** 貼給老師的訊息。全部集中在這裡，方便改。 */
export const messages = {
  start(state: StoredState, stageId: number, lesson?: Lesson): string {
    const due = dueCards(state, cards).map((d) => pad(d.card.n))
    return (
      `開始今天的課：${whereText(stageId, lesson)}。` +
      (lesson ? `\n今天只要學會：${lesson.focus}。` : '') +
      `\n請照默契：先暖身抽問 1 張到期卡${due.length ? `（今天到期：${due.join('、')}）` : '（今天沒有到期卡，跳過）'}，再講一個概念，5 行內就讓我動手。`
    )
  },
  tooMuch: '太多了。請把剛剛講的濃縮成 3 行，然後只給我「下一步一件事」。',
  stuck: '卡住了。錯誤訊息／截圖在下面。只告訴我「哪一個字錯了」和怎麼改，不要重講概念。\n',
  exercise(stageId: number, lesson: Lesson, i: number): string {
    return `${whereText(stageId, lesson)} 第 ${i + 1} 題我做了，結果截圖在下面。只回我對／錯 + 一句原因。\n題目：${lesson.exercises[i]}\n`
  },
  project(stageId: number, lesson: Lesson): string {
    return `${whereText(stageId, lesson)} 的專案題（寵物版）我寫了，在下面。只回我對／錯 + 一句原因。\n題目：${lesson.project}\n`
  },
  teach(stageId: number, lesson: Lesson): string {
    return `${whereText(stageId, lesson)}：我用自己的話講今天的概念，請聽聽看我講對了沒，一句話回我：\n`
  },
  boss(stageId: number): string {
    return `驗收。請出關 ${stageId} 的 Boss 題，我答完你再判定過不過。`
  },
  settle(state: StoredState, stageId: number, lesson?: Lesson): string {
    const xp = totalXp(state)
    const lv = levelFor(xp)
    const today = todayKey()
    const lp = lesson ? state.lessons[lesson.id] : undefined
    const doneEx = lp?.exercises.filter(Boolean).length ?? 0
    const written = Object.keys(state.cards)
      .map(Number)
      .sort((a, b) => a - b)
      .map(pad)
    return (
      `結算。今天是 ${today}。目前 ${whereText(stageId, lesson)}。` +
      `\n今日完成：練習 ${doneEx}/${lesson?.exercises.length ?? 0}、專案題 ${lp?.project ? '✅' : '❌'}、用自己的話講 ${lp?.teach ? '✅' : '❌'}。` +
      `\n卡片已寫：${written.length ? written.join('、') : '（還沒有）'}。` +
      `\nXP 總計 ${xp}（Lv${lv.lv} ${lv.name}）、連續 ${streak(state)} 天。` +
      `\n請：1) 用 5 行以內寫今日摘要到 study/journal/${today}.md；2) 更新 study/progress.md；3) 給我今天的手寫卡總表。`
    )
  },
}
