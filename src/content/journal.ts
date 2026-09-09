/**
 * 學習日誌：老師每次「結算」後寫在 study/journal/YYYY-MM-DD.md，
 * App 在 build／dev 時自動讀進來。
 */
const files = import.meta.glob<string>('../../study/journal/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export type JournalEntry = { date: string; body: string }

export const journal: JournalEntry[] = Object.entries(files)
  .map(([path, body]) => {
    const match = path.match(/(\d{4}-\d{2}-\d{2})\.md$/)
    return { date: match?.[1] ?? path, body }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function entryFor(date: string): JournalEntry | undefined {
  return journal.find((e) => e.date === date)
}

/** 找「那天或那天之前」最近的一篇 */
export function entryOnOrBefore(date: string): JournalEntry | undefined {
  return journal.find((e) => e.date <= date)
}
