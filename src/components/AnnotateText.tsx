import type { ReactNode } from 'react'
import type { NumberedNote } from '../content/glossary'
import { noteId } from '../content/glossary'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function AnnotateText({
  text,
  notes,
}: {
  text: string
  notes: NumberedNote[]
}) {
  if (notes.length === 0) return text

  const sorted = [...notes].sort((a, b) => b.abbr.length - a.abbr.length)
  const pattern = new RegExp(
    `(^|[^A-Za-z0-9])(${sorted.map((n) => escapeRegExp(n.abbr)).join('|')})(?![A-Za-z0-9])`,
    'g',
  )
  const byAbbr = new Map(notes.map((n) => [n.abbr, n]))
  const parts: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text)) !== null) {
    const prefix = match[1]
    const abbr = match[2]
    const note = byAbbr.get(abbr)
    const start = match.index + prefix.length
    if (!note) continue
    if (start > last) parts.push(text.slice(last, start))
    parts.push(
      <span key={`ab-${key}`}>
        {abbr}
        <a
          className="fn-ref"
          href={`#${noteId(note.n)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {note.n}
        </a>
      </span>,
    )
    key += 1
    last = start + abbr.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
