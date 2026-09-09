import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Buddy } from '../components/Buddy'
import { CopyButton, MiniCommands } from '../components/CommandPanel'
import { ExtraLockedNotice } from '../components/ExtraLockedNotice'
import { RoutineChecklist } from '../components/RoutineChecklist'
import { useToast } from '../components/Toast'
import { getCard } from '../content/cards'
import { canAccessDay, dayHeading, getDay } from '../content/days'
import { stageMeta } from '../content/lessons'
import { todayKey } from '../lib/dates'
import { messages, lessonIndex } from '../lib/messages'
import { XP, currentLessonId, lessonDone, levelFor, totalXp } from '../lib/progress'
import { loadState, updateState } from '../lib/storage'
import type { Lesson, LessonProgress, StoredState } from '../types'

type Step =
  | { kind: 'focus' }
  | { kind: 'concept' }
  | { kind: 'card'; n: number }
  | { kind: 'exercise'; i: number }
  | { kind: 'project' }
  | { kind: 'teach' }
  | { kind: 'boss' }
  | { kind: 'done' }

function emptyLesson(l: Lesson): LessonProgress {
  return { concept: false, exercises: l.exercises.map(() => false), project: false, teach: false }
}

function buildSteps(lesson: Lesson, isLast: boolean): Step[] {
  return [
    { kind: 'focus' },
    { kind: 'concept' },
    ...lesson.cards.map((n) => ({ kind: 'card', n }) as Step),
    ...lesson.exercises.map((_, i) => ({ kind: 'exercise', i }) as Step),
    { kind: 'project' },
    { kind: 'teach' },
    ...(isLast ? [{ kind: 'boss' } as Step] : []),
    { kind: 'done' },
  ]
}

function stepDone(step: Step, state: StoredState, lesson: Lesson, stageId: number): boolean {
  const lp = state.lessons[lesson.id] ?? emptyLesson(lesson)
  switch (step.kind) {
    case 'focus':
      return lp.concept || lp.exercises.some(Boolean)
    case 'concept':
      return lp.concept
    case 'card':
      return Boolean(state.cards[String(step.n)])
    case 'exercise':
      return Boolean(lp.exercises[step.i])
    case 'project':
      return lp.project
    case 'teach':
      return lp.teach
    case 'boss':
      return Boolean(state.boss[String(stageId)])
    case 'done':
      return false
  }
}

const STEP_LABEL: Record<Step['kind'], string> = {
  focus: '今天',
  concept: '概念',
  card: '手寫卡',
  exercise: '動手',
  project: '你的專案',
  teach: '講出來',
  boss: 'Boss',
  done: '完成',
}

const STEP_EMOJI: Record<Step['kind'], string> = {
  focus: '🎯',
  concept: '💡',
  card: '✍️',
  exercise: '⌨️',
  project: '🐾',
  teach: '🗣',
  boss: '👾',
  done: '🎉',
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">{children}</p>
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('mt-2 mb-5 text-2xl leading-snug font-black text-balance sm:text-3xl', className)}>{children}</h2>
}

function NextButton({
  done,
  label,
  doneLabel = '已完成 ✓ 下一步 ›',
  variant = 'success',
  testId,
  onClick,
}: {
  done: boolean
  label: string
  doneLabel?: string
  variant?: 'success' | 'go' | 'boss' | 'gold'
  testId: string
  onClick: () => void
}) {
  return (
    <Button type="button" variant={done ? 'soft' : variant} size="xl" className="w-full max-w-sm" data-testid={testId} onClick={onClick}>
      {done ? doneLabel : label}
    </Button>
  )
}

export function StagePage() {
  const { id } = useParams()
  const stageId = Number(id)
  const day = getDay(stageId)
  const meta = stageMeta(stageId)
  const toast = useToast()
  const initial = useMemo(() => loadState(), [stageId])
  const [state, setState] = useState(initial)
  const [lessonId, setLessonId] = useState<string | undefined>(() => currentLessonId(initial, stageId))
  const lesson = meta.lessons.find((l) => l.id === lessonId) ?? meta.lessons[0]
  const isLast = lesson ? meta.lessons.at(-1)?.id === lesson.id : false
  const steps = useMemo(() => (lesson ? buildSteps(lesson, isLast) : []), [lesson, isLast])
  const [stepIdx, setStepIdx] = useState<number | null>(null)

  if (!day) return <p>找不到這一關。</p>
  if (!canAccessDay(day.id)) {
    return (
      <article>
        <p className="crumbs">
          <Link to="/map">← 地圖</Link>
        </p>
        <ExtraLockedNotice />
      </article>
    )
  }
  if (!lesson) return <p>這關還沒有課程。</p>

  const firstOpen = steps.findIndex((s) => !stepDone(s, state, lesson, stageId))
  const idx = stepIdx ?? (firstOpen === -1 ? steps.length - 1 : firstOpen)
  const step = steps[idx]
  const goto = (i: number) => setStepIdx(Math.max(0, Math.min(steps.length - 1, i)))
  const next = () => goto(idx + 1)

  const mutate = (fn: (s: StoredState) => void, msg?: string) => {
    setState(updateState(fn))
    if (msg) toast(msg)
  }
  const patchLesson = (fn: (p: LessonProgress) => void) =>
    mutate((s) => {
      const cur = s.lessons[lesson.id] ?? emptyLesson(lesson)
      cur.exercises = lesson.exercises.map((_, i) => cur.exercises[i] ?? false)
      fn(cur)
      s.lessons[lesson.id] = cur
    })

  const lp = state.lessons[lesson.id] ?? emptyLesson(lesson)
  const lv = levelFor(totalXp(state))

  const renderStep = () => {
    switch (step.kind) {
      case 'focus':
        return (
          <>
            <Kicker>今天只要學會這一件事</Kicker>
            <Title>{lesson.focus}</Title>
            <div className="mb-6 rounded-2xl bg-accent/70 px-4 py-3 text-left text-sm">
              <span className="mr-2 font-bold text-muted-foreground">怎麼算會了</span>
              {lesson.check}
            </div>
            <CopyButton text={messages.start(state, stageId, lesson)} label="▶ 開始" after="貼到聊天框，老師開始上課。然後按「下一步」。" testId="step-start" />
            <Button type="button" variant="ghost" className="mt-3" onClick={next} data-testid="step-next">
              下一步 ›
            </Button>
          </>
        )
      case 'concept':
        return (
          <>
            <Kicker>概念（老師也會在聊天裡講）</Kicker>
            <Title className="text-xl sm:text-2xl">{lesson.concept}</Title>
            <Button
              type="button"
              variant="success"
              size="xl"
              className="w-full max-w-sm"
              data-testid="step-concept-ok"
              onClick={() => {
                patchLesson((p) => (p.concept = true))
                next()
              }}
            >
              聽懂了 ›
            </Button>
            <p className="mt-3 mb-0 text-sm text-muted-foreground">聽不懂？右下角 🛑 太多了。</p>
          </>
        )
      case 'card': {
        const card = getCard(step.n)
        if (!card) return null
        const written = Boolean(state.cards[String(card.n)])
        return (
          <>
            <Kicker>抄這張卡到筆記本</Kicker>
            <div className="my-4 rounded-2xl border-2 border-dashed border-gold bg-[oklch(0.99_0.03_90)] p-5 text-left shadow-[4px_4px_0_0_var(--gold)]">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-black text-gold-foreground">#{String(card.n).padStart(2, '0')}</span>
                <strong className="text-xl">{card.en}</strong>
                <span className="text-muted-foreground">｜{card.zh}</span>
              </div>
              <p className="mt-3 mb-2 text-lg leading-snug font-semibold">{card.line}</p>
              <pre className="m-0 overflow-x-auto rounded-xl bg-foreground px-3 py-2 text-sm text-background">
                <code>{card.example}</code>
              </pre>
              <p className="mt-3 mb-0 text-sm text-muted-foreground">✏️ {card.draw}</p>
            </div>
            {written ? (
              <Button type="button" variant="soft" size="xl" className="w-full max-w-sm" onClick={next} data-testid="step-card-next">
                已抄 ✓ 下一步 ›
              </Button>
            ) : (
              <Button
                type="button"
                variant="gold"
                size="xl"
                className="w-full max-w-sm"
                data-testid={`card-write-${card.n}`}
                onClick={() => {
                  mutate((s) => {
                    s.cards[String(card.n)] = { writtenAt: todayKey() }
                  }, `+${XP.card} XP`)
                  next()
                }}
              >
                ✍️ 抄好了 ›
              </Button>
            )}
          </>
        )
      }
      case 'exercise': {
        const done = Boolean(lp.exercises[step.i])
        return (
          <>
            <Kicker>
              第 {step.i + 1} 題 / {lesson.exercises.length}
            </Kicker>
            <pre className="my-4 overflow-x-auto rounded-2xl bg-foreground p-4 text-left text-base leading-relaxed text-background">
              <code>{lesson.exercises[step.i]}</code>
            </pre>
            <p className="mt-0 mb-5 text-sm text-muted-foreground">親手打進 psql，不要複製貼上。</p>
            <div className="flex flex-col items-center gap-3">
              <CopyButton text={messages.exercise(stageId, lesson, step.i)} label="做完了，貼給老師" after="貼上後把結果截圖一起送出。" tone="plain" />
              <NextButton
                done={done}
                label="✓ 老師說對了 ›"
                testId={`ex-${lesson.id}-${step.i}`}
                onClick={() => {
                  if (!done) patchLesson((p) => (p.exercises[step.i] = true))
                  if (!done) toast(`+${XP.exercise} XP`)
                  next()
                }}
              />
            </div>
          </>
        )
      }
      case 'project':
        return (
          <>
            <Kicker>🐾 換成你的專案</Kicker>
            <Title className="text-xl sm:text-2xl">{lesson.project}</Title>
            <div className="flex flex-col items-center gap-3">
              <CopyButton text={messages.project(stageId, lesson)} label="寫好了，貼給老師" after="把你寫的 SQL 或照片一起送出。" tone="plain" />
              <NextButton
                done={lp.project}
                label="✓ 老師說對了 ›"
                testId={`project-${lesson.id}`}
                onClick={() => {
                  if (!lp.project) patchLesson((p) => (p.project = true))
                  if (!lp.project) toast(`🐾 +${XP.project} XP`)
                  next()
                }}
              />
            </div>
          </>
        )
      case 'teach':
        return (
          <>
            <Kicker>🗣 用自己的話講一次</Kicker>
            <Title className="text-xl sm:text-2xl">「{lesson.title}」是什麼？講給老師聽。</Title>
            <div className="flex flex-col items-center gap-3">
              <CopyButton text={messages.teach(stageId, lesson)} label="複製開頭，接著打你的話" after="不用完美，講錯老師會補一句。" tone="plain" />
              <NextButton
                done={lp.teach}
                label="✓ 老師聽懂了 ›"
                testId={`teach-${lesson.id}`}
                onClick={() => {
                  if (!lp.teach) patchLesson((p) => (p.teach = true))
                  if (!lp.teach) toast(`+${XP.teach} XP`)
                  next()
                }}
              />
            </div>
          </>
        )
      case 'boss': {
        const done = Boolean(state.boss[String(stageId)])
        return (
          <>
            <Kicker>
              <span className="text-boss">👾 {meta.isBigBoss ? '★ 大 Boss' : 'Boss 題'}</span>
            </Kicker>
            <Title className="text-xl sm:text-2xl">{meta.boss}</Title>
            <div className="flex flex-col items-center gap-3">
              <CopyButton text={messages.boss(stageId)} label="驗收，貼給老師" after="老師會出題；你答完他判定。" tone="plain" />
              <NextButton
                done={done}
                label="✓ 老師說過關了 ›"
                doneLabel="已過關 ✓ 下一步 ›"
                variant="boss"
                testId="boss-check"
                onClick={() => {
                  if (!done) {
                    mutate((s) => {
                      s.boss[String(stageId)] = true
                    }, `👾 過關！+${meta.isBigBoss ? XP.bigBoss : XP.boss} XP`)
                  }
                  next()
                }}
              />
            </div>
          </>
        )
      }
      case 'done': {
        const nextLesson = meta.lessons[lessonIndex(lesson)]
        return (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-around text-2xl" aria-hidden="true">
              {['🎉', '⭐', '🐾', '✨', '🎊'].map((e, i) => (
                <span key={i} className="animate-confetti" style={{ animationDelay: `${i * 0.08}s` }}>
                  {e}
                </span>
              ))}
            </div>
            <Buddy level={lv.lv} size="md" mood="cheer" className="mx-auto mb-3 w-fit" />
            <Kicker>🎉 這一課完成</Kicker>
            <Title>{lesson.title}</Title>
            <CopyButton
              text={messages.settle(state, stageId, lesson)}
              label="📊 結算，貼給老師"
              after="老師會寫今天的日誌、給你手寫卡總表。"
              tone="end"
              testId="step-settle"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-4 text-muted-foreground"
              data-testid="error-log"
              onClick={() =>
                mutate((s) => {
                  s.errorLogCount += 1
                }, `🐛 +${XP.errorLog} XP`)
              }
            >
              🐛 今天有卡住，錯誤日誌寫了 3 行（+{XP.errorLog}）
            </Button>
            <div className="mt-2">
              {nextLesson ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setLessonId(nextLesson.id)
                    setStepIdx(0)
                  }}
                >
                  明天：第 {lessonIndex(nextLesson)} 課 {nextLesson.title} ›
                </Button>
              ) : (
                <Button asChild variant="link">
                  <Link to="/map">回地圖 ›</Link>
                </Button>
              )}
            </div>
          </>
        )
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="crumbs m-0">
        <Link to="/">← 今天</Link>
        <Link to="/map">地圖</Link>
      </p>
      <h1 className="m-0 text-xl font-black" data-testid="day-title">
        {dayHeading(day)}
        {meta.isBigBoss ? ' ★' : ''} · {day.title}
      </h1>

      <div className="flex flex-wrap gap-2" data-testid="lesson-pills">
        {meta.lessons.map((l, i) => {
          const done = lessonDone(state, l.id, l.exercises.length)
          const on = l.id === lesson.id
          return (
            <button
              key={l.id}
              type="button"
              className={cn(
                'pill rounded-full px-3 py-1 text-sm font-semibold ring-1 transition-colors',
                on ? 'bg-primary text-primary-foreground ring-primary' : done ? 'bg-success/15 text-success ring-success/30' : 'bg-card text-muted-foreground ring-border hover:bg-accent',
              )}
              onClick={() => {
                setLessonId(l.id)
                setStepIdx(null)
              }}
            >
              {done ? '✅ ' : on ? '▶ ' : ''}第 {i + 1} 課
            </button>
          )
        })}
      </div>

      <RoutineChecklist />

      <section className="step-card-shadow relative overflow-hidden rounded-3xl bg-card ring-1 ring-border" data-testid="step" data-kind={step.kind}>
        <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => goto(idx - 1)} disabled={idx === 0} aria-label="上一步">
            ‹
          </Button>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5" data-testid="step-dots">
            {steps.map((s, i) => {
              const d = stepDone(s, state, lesson, stageId)
              return (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    'sdot size-3 rounded-full transition-all',
                    i === idx ? 'scale-125 bg-primary ring-2 ring-primary/30' : d ? 'bg-success' : 'bg-border hover:bg-muted-foreground/40',
                  )}
                  onClick={() => goto(i)}
                  title={STEP_LABEL[s.kind]}
                  aria-label={`步 ${i + 1} ${STEP_LABEL[s.kind]}`}
                />
              )
            })}
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={next} disabled={idx === steps.length - 1} aria-label="下一步">
            ›
          </Button>
        </div>
        <p className="m-0 border-b px-4 py-1.5 text-center text-xs text-muted-foreground">
          第 {lessonIndex(lesson)} 課 · {STEP_EMOJI[step.kind]} {STEP_LABEL[step.kind]} · 步 {idx + 1}/{steps.length}
        </p>
        <div key={idx} className="flex flex-col items-center px-5 py-7 text-center animate-in fade-in slide-in-from-right-4 duration-300 sm:px-8">
          {renderStep()}
        </div>
      </section>

      <p className="m-0 text-center text-sm">
        <Link to={`/day/${stageId}/detail`} data-testid="to-detail" className="text-muted-foreground">
          同事原版教材與 15 題測驗
        </Link>
      </p>

      <MiniCommands />
    </div>
  )
}
