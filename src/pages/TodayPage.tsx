import { ArrowRight, Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BuddyCard } from '../components/BuddyCard'
import { CopyButton, MiniCommands } from '../components/CommandPanel'
import { cards } from '../content/cards'
import { findLesson, stageMeta } from '../content/lessons'
import { messages, lessonIndex } from '../lib/messages'
import { currentLessonId, currentStageId, dueCards, levelFor, setupDone, streak, totalXp } from '../lib/progress'
import { useProgress } from '../lib/useProgress'

export function TodayPage() {
  const state = useProgress()
  const navigate = useNavigate()
  const xp = totalXp(state)
  const lv = levelFor(xp)
  const due = dueCards(state, cards)
  const ready = setupDone(state)
  const sid = currentStageId(state)
  const lid = currentLessonId(state, sid)
  const lesson = lid ? findLesson(lid) : undefined
  const meta = stageMeta(sid)

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="sr-only" data-testid="home-title">
        Sasha 的 SQL 冒險
      </h1>

      <BuddyCard state={state} />

      {!ready ? (
        <section className="step-card-shadow w-full rounded-2xl border bg-card p-6 text-center sm:p-8" data-testid="today-card">
          <p className="m-0 text-sm font-semibold text-primary">今天</p>
          <h2 className="mt-1 mb-3 text-2xl font-bold tracking-tight sm:text-3xl">關 0：把資料庫跑起來</h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            只要做到：在 psql 打 <code>SELECT * FROM users;</code> 看到 10 個人
          </p>
          <Button asChild variant="go" size="xl" className="w-full max-w-sm">
            <Link to="/setup" data-testid="today-go" className="no-underline hover:no-underline">
              <Play className="size-5 fill-current" /> 去做關 0
            </Link>
          </Button>
          <p className="mt-3 mb-0 text-sm text-muted-foreground">9 個步驟，每個指令都能一鍵複製</p>
        </section>
      ) : lesson ? (
        <section className="step-card-shadow w-full rounded-2xl border bg-card p-6 text-center sm:p-8" data-testid="today-card">
          <p className="m-0 text-sm font-semibold text-primary">
            今天 · 關 {sid} · 第 {lessonIndex(lesson)}/{meta.lessons.length} 課
          </p>
          <h2 className="mt-1 mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h2>
          <div className="mx-auto mb-6 max-w-md rounded-xl bg-muted px-4 py-3 text-left">
            <p className="m-0 text-xs font-semibold text-muted-foreground">只要學會</p>
            <p className="m-0 mt-0.5 font-medium">{lesson.focus}</p>
          </div>
          <CopyButton
            text={messages.start(state, sid, lesson)}
            label="開始"
            icon={<Play className="size-5 fill-current" />}
            after="會複製一句話。到聊天框 Cmd+V、Enter，老師就開始上課；畫面會帶你一步一步做。"
            testId="today-go"
            onCopied={() => navigate(`/day/${sid}`)}
          />
        </section>
      ) : (
        <section className="step-card-shadow w-full rounded-2xl border bg-card p-8 text-center" data-testid="today-card">
          <h2 className="mt-0 mb-4 text-3xl font-bold">14 關全部通關</h2>
          <Button asChild variant="gold" size="xl">
            <Link to="/map" className="no-underline hover:no-underline">
              看地圖
            </Link>
          </Button>
        </section>
      )}

      {due.length > 0 ? (
        <Link
          to="/cards"
          className="flex w-full items-center justify-between rounded-xl border border-sky/40 bg-sky/10 px-4 py-3 font-medium text-foreground no-underline hover:bg-sky/20 hover:no-underline"
          data-testid="due-line"
        >
          <span>今天有 {due.length} 張卡要複習</span>
          <ArrowRight className="size-4" />
        </Link>
      ) : null}

      <p className="m-0 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground" data-testid="xp-text">
        <span>
          Lv{lv.lv} {lv.name}
        </span>
        <span>{xp} XP</span>
        <span>連續 {streak(state)} 天</span>
        <span>關 {sid}</span>
      </p>

      <Link to="/guide" className="text-sm text-muted-foreground" data-testid="today-guide-link">
        忘了怎麼用？看說明 →
      </Link>

      <MiniCommands />
    </div>
  )
}
