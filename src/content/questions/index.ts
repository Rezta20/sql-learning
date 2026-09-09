import type { Question } from '../../types'
import { day1, day2, day3 } from './days1-3'
import { day4, day5, day6 } from './days4-6'
import { day7, day8 } from './days7-8'
import { day9, day10 } from './days9-10'
import { day11, day12 } from './days11-12'
import { day13, day14 } from './days13-14'
import { dayExtra } from './day-extra'

const banks: Record<number, Question[]> = {
  1: day1,
  2: day2,
  3: day3,
  4: day4,
  5: day5,
  6: day6,
  7: day7,
  8: day8,
  9: day9,
  10: day10,
  11: day11,
  12: day12,
  13: day13,
  14: day14,
  15: dayExtra,
}

export const QUIZ_SIZE = 15

export function getQuestionBank(dayId: number): Question[] {
  return banks[dayId] ?? []
}
