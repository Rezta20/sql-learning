import type { Card } from '../types'
import raw from '../../study/cards.json'

export const cards: Card[] = (raw as Card[]).slice().sort((a, b) => a.n - b.n)

export function getCard(n: number): Card | undefined {
  return cards.find((c) => c.n === n)
}

export function cardsForStage(stageId: number): Card[] {
  return cards.filter((c) => c.stage === stageId)
}

export function cardLabel(c: Card): string {
  return `#${String(c.n).padStart(2, '0')} ${c.en}｜${c.zh}`
}
