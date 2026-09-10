import { Bug, Check, ChevronLeft, ChevronRight, Eye, Lightbulb, MessageCircleMore, PawPrint, PenLine, Skull, Sparkles, Speech, Target, Terminal, type LucideIcon } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Buddy } from '../components/Buddy'
import { hungerStage } from '../lib/hunger'
import { CopyButton, MiniCommands } from '../components/CommandPanel'
import { ExtraLockedNotice } from '../components/ExtraLockedNotice'
import { RoutineChecklist } from '../components/RoutineChecklist'
import { useToast } from '../components/Toast'
import { getCard } from '../content/cards'
import { canAccessDay, dayHeading, getDay } from '../content/days'
import { stageMeta } from '../content/lessons'
import { copyText } from '../lib/clipboard'
import { todayKey } from '../lib/dates'
import { messages, lessonIndex } from '../lib/messages'
import { XP, currentLessonId, lessonDone, levelFor, totalXp } from '../lib/progress'
import { loadState, updateState } from '../lib/storage'
import type { Exercise, Lesson, LessonProgress, StoredState } from '../types'

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

const STEP_ICON: Record<Step['kind'], LucideIcon> = {
  focus: Target,
  concept: Lightbulb,
  card: PenLine,
  exercise: Terminal,
  project: PawPrint,
  teach: Speech,
  boss: Skull,
  done: Sparkles,
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="m-0 text-sm font-semibold text-primary">{children}</p>
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('mt-1 mb-5 text-2xl leading-snug font-bold tracking-tight text-balance sm:text-3xl', className)}>{children}</h2>
}

function NextButton({
  done,
  label,
  doneLabel = '已完成，下一步',
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
      {done ? <Check className="size-5" /> : null}
      {done ? doneLabel : label}
    </Button>
  )
}

/**
 * 三層漸進揭露：提示 → 預期結果 → 看答案。
 * 一次只多開一層，避免一口氣看到全部。
 */
function Reveal({ ex, id }: { ex: Exercise; id: string }) {
  const [level, setLevel] = useState(0)
  const LABELS = ['提示', '預期結果', '看答案']
  const box = (title: string, body: ReactNode, tone: string) => (
    <div className={cn('w-full rounded-xl border px-4 py-3 text-left text-sm', tone)}>
      <p className="m-0 mb-1 text-xs font-bold text-muted-foreground">{title}</p>
      {body}
    </div>
  )
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2" data-testid={`reveal-${id}`} data-level={level}>
      {level >= 1 ? box('提示', <p className="m-0">{ex.hint}</p>, 'bg-accent/60') : null}
      {level >= 2 ? box('預期結果（跟你螢幕上的比）', <p className="m-0 leading-relaxed">{ex.expect}</p>, 'bg-sky/10 border-sky/40') : null}
      {level >= 3
        ? box(
            '參考答案',
            <>
              <pre className="m-0 overflow-x-auto rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed text-background whitespace-pre-wrap">
                <code>{ex.answer}</code>
              </pre>
              {ex.pitfalls?.length ? (
                <ul className="mt-2 mb-0 list-disc pl-4 text-xs text-muted-foreground">
                  {ex.pitfalls.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : null}
            </>,
            'bg-gold/10 border-gold/50',
          )
        : null}
      {level < 3 ? (
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setLevel(level + 1)} data-testid={`reveal-next-${id}`}>
          <Eye className="size-4" /> {LABELS[level]}
        </Button>
      ) : null}
    </div>
  )
}

/** 次要動作：還是不懂才問老師（複製訊息）。 */
function AskTeacher({ text, label = '還是不懂？問老師' }: { text: string; label?: string }) {
  const toast = useToast()
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      className="text-muted-foreground"
      onClick={async () => {
        const ok = await copyText(text)
        toast(ok ? '已複製 → 聊天框 Cmd+V，補上截圖' : '複製失敗')
      }}
    >
      <MessageCircleMore className="size-4" /> {label}
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
  /** 「講出來」自評勾選（只在畫面上，不存檔） */
  const [teachChecks, setTeachChecks] = useState<Record<number, boolean>>({})

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
  const StepIcon = STEP_ICON[step.kind]

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
            <CopyButton text={messages.start(state, stageId, lesson)} label="開始" after="貼到聊天框，老師開始上課。然後按「下一步」。" testId="step-start" />
            <Button type="button" variant="ghost" className="mt-3" onClick={next} data-testid="step-next">
              下一步 <ChevronRight className="size-4" />
            </Button>
          </>
        )
      case 'concept':
        return (
          <>
            <Kicker>概念（一句話）</Kicker>
            <Title className="text-xl sm:text-2xl">{lesson.concept}</Title>
            {lesson.explain.length ? (
              <details className="group mb-5 w-full max-w-md rounded-xl border bg-accent/50 text-left" data-testid="concept-explain">
                <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-semibold select-none">
                  展開看 {lesson.explain.length} 行講解
                  <span className="float-right text-muted-foreground group-open:rotate-180">▾</span>
                </summary>
                <ol className="m-0 flex list-decimal flex-col gap-1.5 px-4 pb-3 pl-8 text-sm leading-relaxed">
                  {lesson.explain.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </details>
            ) : null}
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
              <Check className="size-5" /> 聽懂了
            </Button>
            <p className="mt-3 mb-0 text-sm text-muted-foreground">看不懂？先抄下面的卡，做完題目常常就懂了。還是不懂再按右下角「太多了」。</p>
          </>
        )
      case 'card': {
        const card = getCard(step.n)
        if (!card) return null
        const written = Boolean(state.cards[String(card.n)])
        return (
          <>
            <Kicker>抄這張卡到筆記本</Kicker>
            <div className="my-4 w-full rounded-xl border bg-[oklch(0.99_0.02_90)] p-5 text-left shadow-[0_2px_0_0_var(--border)]" style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 27px, oklch(0.9 0.02 80) 27px 28px)' }}>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded bg-gold px-1.5 py-0.5 text-xs font-bold text-gold-foreground">#{String(card.n).padStart(2, '0')}</span>
                <strong className="text-xl">{card.en}</strong>
                <span className="text-muted-foreground">｜{card.zh}</span>
              </div>
              <p className="mt-3 mb-2 text-lg leading-snug font-medium">{card.line}</p>
              <pre className="m-0 overflow-x-auto rounded-lg bg-foreground px-3 py-2 text-sm text-background">
                <code>{card.example}</code>
              </pre>
              <p className="mt-3 mb-0 flex items-start gap-1.5 text-sm text-muted-foreground">
                <PenLine className="mt-0.5 size-4 shrink-0" /> {card.draw}
              </p>
            </div>
            {written ? (
              <Button type="button" variant="soft" size="xl" className="w-full max-w-sm" onClick={next} data-testid="step-card-next">
                <Check className="size-5" /> 已抄，下一步
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
                <PenLine className="size-5" /> 抄好了
              </Button>
            )}
          </>
        )
      }
      case 'exercise': {
        const done = Boolean(lp.exercises[step.i])
        const ex = lesson.exercises[step.i]
        return (
          <>
            <Kicker>
              第 {step.i + 1} 題 / {lesson.exercises.length}
            </Kicker>
            <pre className="my-4 w-full overflow-x-auto rounded-2xl bg-foreground p-4 text-left text-base leading-relaxed text-background whitespace-pre-wrap">
              <code>{ex.task}</code>
            </pre>
            <p className="mt-0 mb-4 text-sm text-muted-foreground">親手打進 psql，不要複製貼上。做完把結果跟「預期結果」比。</p>
            <div className="flex w-full flex-col items-center gap-3">
              <Reveal ex={ex} id={`${lesson.id}-${step.i}`} />
              <NextButton
                done={done}
                label="結果跟預期一樣 ✓"
                testId={`ex-${lesson.id}-${step.i}`}
                onClick={() => {
                  if (!done) patchLesson((p) => (p.exercises[step.i] = true))
                  if (!done) toast(`+${XP.exercise} XP`)
                  next()
                }}
              />
              <AskTeacher text={messages.exercise(stageId, lesson, step.i)} />
            </div>
          </>
        )
      }
      case 'project':
        return (
          <>
            <Kicker>換成你的專案</Kicker>
            <Title className="text-xl sm:text-2xl">{lesson.project.task}</Title>
            <p className="mt-0 mb-4 text-sm text-muted-foreground">先寫在筆記本，再打開參考答案比。意思一樣就算對，欄名不同沒關係。</p>
            <div className="flex w-full flex-col items-center gap-3">
              <Reveal ex={lesson.project} id={`${lesson.id}-project`} />
              <NextButton
                done={lp.project}
                label="跟參考答案意思一樣 ✓"
                testId={`project-${lesson.id}`}
                onClick={() => {
                  if (!lp.project) patchLesson((p) => (p.project = true))
                  if (!lp.project) toast(`+${XP.project} XP`)
                  next()
                }}
              />
              <AskTeacher text={messages.project(stageId, lesson)} label="不確定？問老師" />
            </div>
          </>
        )
      case 'teach': {
        const allKeys = lesson.teachKeys.every((_, i) => teachChecks[i])
        return (
          <>
            <Kicker>用自己的話講一次</Kicker>
            <Title className="text-xl sm:text-2xl">「{lesson.title}」是什麼？大聲講出來（對著夥伴講也可以）。</Title>
            <p className="mt-0 mb-3 text-sm text-muted-foreground">講完後勾：你有講到這 3 件事嗎？</p>
            <ul className="m-0 mb-4 flex w-full max-w-md list-none flex-col gap-2 p-0 text-left" data-testid="teach-keys">
              {lesson.teachKeys.map((k, i) => (
                <li key={k}>
                  <label className={cn('flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium', teachChecks[i] && 'border-success/40 bg-success/10')}>
                    <input
                      type="checkbox"
                      checked={Boolean(teachChecks[i]) || lp.teach}
                      disabled={lp.teach}
                      onChange={() => setTeachChecks((c) => ({ ...c, [i]: !c[i] }))}
                      className="size-5 accent-[var(--success)]"
                      data-testid={`teach-key-${i}`}
                    />
                    {k}
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex w-full flex-col items-center gap-3">
              <Button
                type="button"
                variant={lp.teach ? 'soft' : 'success'}
                size="xl"
                className="w-full max-w-sm"
                disabled={!lp.teach && !allKeys}
                data-testid={`teach-${lesson.id}`}
                onClick={() => {
                  if (!lp.teach) patchLesson((p) => (p.teach = true))
                  if (!lp.teach) toast(`+${XP.teach} XP`)
                  next()
                }}
              >
                {lp.teach ? <Check className="size-5" /> : <Speech className="size-5" />}
                {lp.teach ? '已完成，下一步' : allKeys ? '三個都講到了 ✓' : '勾滿 3 個才能過'}
              </Button>
              <AskTeacher text={messages.teach(stageId, lesson)} label="想讓老師聽？複製開頭，接著打你的話" />
            </div>
          </>
        )
      }
      case 'boss': {
        const done = Boolean(state.boss[String(stageId)])
        return (
          <>
            <Kicker>
              <span className="text-boss">{meta.isBigBoss ? '大 Boss' : 'Boss 題'}</span>
            </Kicker>
            <Title className="text-xl sm:text-2xl">{meta.boss.task}</Title>
            <p className="mt-0 mb-4 text-sm text-muted-foreground">自己做完，再看參考答案。跟預期一樣就是過關。</p>
            <div className="flex w-full flex-col items-center gap-3">
              <Reveal ex={meta.boss} id={`boss-${stageId}`} />
              <NextButton
                done={done}
                label="過關 ✓（我自己判定）"
                doneLabel="已過關，下一步"
                variant="boss"
                testId="boss-check"
                onClick={() => {
                  if (!done) {
                    mutate((s) => {
                      s.boss[String(stageId)] = true
                    }, `過關！+${meta.isBigBoss ? XP.bigBoss : XP.boss} XP`)
                  }
                  next()
                }}
              />
              <AskTeacher text={messages.boss(stageId, meta.boss)} label="不確定過不過？貼給老師判" />
            </div>
          </>
        )
      }
      case 'done': {
        const nextLesson = meta.lessons[lessonIndex(lesson)]
        return (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-around" aria-hidden="true">
              {['bg-primary', 'bg-success', 'bg-boss', 'bg-gold', 'bg-sky', 'bg-primary'].map((c, i) => (
                <span key={i} className={cn('block size-3 animate-confetti', i % 2 ? 'rounded-full' : 'rotate-45', c)} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <Buddy level={lv.lv} stage={hungerStage(state)} size="md" cheer className="mx-auto mb-3" />
            <Kicker>這一課完成</Kicker>
            <Title>{lesson.title}</Title>
            <CopyButton
              text={messages.settle(state, stageId, lesson)}
              label="結算，貼給老師"
              after="訊息裡已附上 App 寫好的日誌草稿；老師只要存檔、更新進度、給手寫卡總表。"
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
                }, `+${XP.errorLog} XP`)
              }
            >
              <Bug className="size-4" /> 今天有卡住，錯誤日誌寫了 3 行（+{XP.errorLog}）
            </Button>
            <div className="mt-2">
              {nextLesson ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setLessonId(nextLesson.id)
                    setStepIdx(0)
                    setTeachChecks({})
                  }}
                >
                  明天：第 {lessonIndex(nextLesson)} 課 {nextLesson.title} <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button asChild variant="link">
                  <Link to="/map">回地圖</Link>
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
      <h1 className="m-0 text-xl font-bold tracking-tight" data-testid="day-title">
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
                'pill inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                on ? 'border-primary bg-primary text-primary-foreground' : done ? 'border-success/40 bg-success/10 text-success' : 'bg-card text-muted-foreground hover:bg-accent',
              )}
              onClick={() => {
                setLessonId(l.id)
                setStepIdx(null)
                setTeachChecks({})
              }}
            >
              {done ? <Check className="size-3.5" /> : null}第 {i + 1} 課
            </button>
          )
        })}
      </div>

      <RoutineChecklist />

      <section className="step-card-shadow relative overflow-hidden rounded-2xl border bg-card" data-testid="step" data-kind={step.kind}>
        <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => goto(idx - 1)} disabled={idx === 0} aria-label="上一步">
            <ChevronLeft />
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
            <ChevronRight />
          </Button>
        </div>
        <p className="m-0 flex items-center justify-center gap-1.5 border-b px-4 py-1.5 text-xs text-muted-foreground">
          第 {lessonIndex(lesson)} 課 · <StepIcon className="size-3.5" /> {STEP_LABEL[step.kind]} · 步 {idx + 1}/{steps.length}
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
