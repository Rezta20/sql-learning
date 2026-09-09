import type { DayContent } from '../types'

export type GlossaryEntry = {
  abbr: string
  full: string
}

export type NumberedNote = GlossaryEntry & { n: number }

const GLOSSARY: GlossaryEntry[] = [
  { abbr: '1NF', full: 'First Normal Form（第一正規化）' },
  { abbr: '2NF', full: 'Second Normal Form（第二正規化）' },
  { abbr: 'CRUD', full: 'Create, Read, Update, Delete（新增、讀取、更新、刪除）' },
  { abbr: 'CPK', full: 'Composite Primary Key（複合主鍵）' },
  { abbr: 'DDL', full: 'Data Definition Language（資料定義語言）' },
  { abbr: 'DML', full: 'Data Manipulation Language（資料操作語言）' },
  { abbr: 'ORM', full: 'Object-Relational Mapping（物件關聯對應）' },
  { abbr: 'SQL', full: 'Structured Query Language（結構化查詢語言）' },
  { abbr: 'INDEX', full: 'Index（一般／次要索引）' },
  { abbr: 'COUNT', full: 'Count（計數）' },
  { abbr: 'AVG', full: 'Average（平均）' },
  { abbr: 'MAX', full: 'Maximum（最大）' },
  { abbr: 'MIN', full: 'Minimum（最小）' },
  { abbr: 'SUM', full: 'Sum（加總）' },
  { abbr: 'PK', full: 'Primary Key（主鍵）' },
  { abbr: 'FK', full: 'Foreign Key（外鍵）' },
  { abbr: 'ER', full: 'Entity-Relationship（實體關係）' },
  { abbr: 'N+1', full: 'N+1 query problem（多一次查詢問題）' },
]

function dayText(day: DayContent): string {
  return [day.title, ...day.objectives, ...day.keyPoints, ...day.tasks].join('\n')
}

function appears(text: string, abbr: string): boolean {
  if (abbr === 'N+1') return text.includes('N+1')
  const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`).test(text)
}

export function glossaryForDay(day: DayContent): NumberedNote[] {
  const text = dayText(day)
  return GLOSSARY.filter((item) => appears(text, item.abbr)).map((item, i) => ({
    ...item,
    n: i + 1,
  }))
}

export function noteId(n: number): string {
  return `fn-${n}`
}
