import { CircleHelp, Cloud, LifeBuoy, ListChecks, MessageSquareText, Play, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTINE_STEPS } from '../lib/progress'

/** 每天流程的 7 條，對應 ROUTINE_STEPS 的順序，補一句「在哪裡按」 */
const ROUTINE_WHERE = [
  '桌面上的 OrbStack 開著就好，資料庫才會活著',
  '卡片區（可撕小卡）＋錯誤日誌區',
  '頁首計時器：45 分鐘會照「暖身 → 概念 → 抄卡 → 動手 → Boss → 結算」提醒',
  '今天頁有藍色那行「今天有 N 張卡要複習」才需要；沒有就跳過',
  '今天頁的大橘鈕，會複製一句話 → 到 Cursor 聊天框 Cmd+V、Enter',
  '關卡頁一次只給一步：概念 → 手寫卡 → 3 題 → 專案題 → 講出來 →（最後一課）Boss',
  '關卡頁最後一步的紫色鈕，老師會幫你寫日誌、更新進度',
]

function Section({ icon, title, children, testId }: { icon: ReactNode; title: string; children: ReactNode; testId?: string }) {
  return (
    <section className="rounded-2xl border bg-card p-5" data-testid={testId}>
      <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function GuidePage() {
  return (
    <div className="flex flex-col gap-4" data-testid="guide-page">
      <p className="crumbs m-0">
        <Link to="/">← 今天</Link>
      </p>
      <div className="flex items-center gap-2">
        <CircleHelp className="size-6 text-primary" />
        <h1 className="m-0 text-2xl font-bold tracking-tight">怎麼用</h1>
      </div>
      <p className="m-0 text-sm text-muted-foreground">忘了就回來看這頁。每天只要記住一件事：打開 App，按畫面上唯一那顆大按鈕。</p>

      <Section icon={<ListChecks className="size-4" />} title="1. 每天的 45 分鐘（平日 14:00）" testId="guide-routine">
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {ROUTINE_STEPS.map((step, i) => (
            <li key={step} className="flex gap-3" data-testid={`guide-routine-${i}`}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
              <div>
                <p className="m-0 font-medium">{step}</p>
                <p className="m-0 text-sm text-muted-foreground">{ROUTINE_WHERE[i]}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 mb-0 text-sm text-muted-foreground">週末不上新課，只複習到期的卡。</p>
      </Section>

      <Section icon={<MessageSquareText className="size-4" />} title="2. 只在三個時刻找老師" testId="guide-teacher">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <li className="flex gap-2">
            <Play className="mt-1 size-4 shrink-0 text-primary" />
            <span>
              <b>開始</b>：今天頁大橘鈕。老師會抽問 1 張到期卡、講一個概念、給今天的手寫卡。
            </span>
          </li>
          <li className="flex gap-2">
            <LifeBuoy className="mt-1 size-4 shrink-0 text-sky-700" />
            <span>
              <b>卡住，而且字典查不到</b>：右下角「卡住」→ 貼錯誤那一行 → 沒命中才按「問老師」。
            </span>
          </li>
          <li className="flex gap-2">
            <Target className="mt-1 size-4 shrink-0 text-boss" />
            <span>
              <b>結算</b>：關卡頁最後一步的紫色鈕。老師存日誌、更新進度、給今天的手寫卡總表。
            </span>
          </li>
        </ul>
        <p className="mt-3 mb-0 rounded-xl bg-muted px-3 py-2 text-sm">
          這三顆按鈕都只是「複製一句話」。按完到 Cursor 聊天框 <kbd>Cmd+V</kbd>、<kbd>Enter</kbd>，老師就知道該做什麼。其他時間都在 App 裡自己做，不用一直問。
        </p>
      </Section>

      <Section icon={<Target className="size-4" />} title="3. 每一題都自己對答案" testId="guide-answer">
        <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
          <li>先自己寫、在 psql 跑。</li>
          <li>卡了 → 點「提示」。</li>
          <li>跑出來了 → 點「預期結果」，跟螢幕一樣就按「結果跟預期一樣 ✓」。</li>
          <li>還是不一樣 → 點「看答案」，找出哪個字打錯。</li>
        </ol>
        <p className="mt-3 mb-0 text-sm text-muted-foreground">「講出來」要自己勾滿 3 個關鍵字才能過；Boss 題自己判定過不過。真的不懂再用小字「問老師」。</p>
      </Section>

      <Section icon={<MessageSquareText className="size-4" />} title="4. 對老師只需要這幾句" testId="guide-phrases">
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
          <li>
            <code>開始今天的課</code> — 今天頁按鈕會幫你複製好
          </li>
          <li>
            <code>太多了</code> — 右下角紅鈕；老師會濃縮成 3 行、只給一件事
          </li>
          <li>
            <code>卡住了</code> — 卡住頁「問老師」會幫你複製好，再補一張截圖
          </li>
          <li>
            <code>結算</code> — 關卡頁最後一步會幫你複製好，日誌草稿已經附在裡面
          </li>
        </ul>
        <p className="mt-3 mb-0 text-sm text-muted-foreground">貼截圖或結果時，老師只回「對／錯 + 一句原因」。</p>
      </Section>

      <Section icon={<Cloud className="size-4" />} title="5. 進度不會弄丟" testId="guide-sync">
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm">
          <li>打勾、XP 都存在這台電腦的瀏覽器裡，關機重開不會消失。</li>
          <li>
            換電腦或怕清掉：頁首雲朵 → <Link to="/sync">雲端同步</Link>，貼一次 GitHub token 就會自動備份。
          </li>
          <li>
            老師的紀錄（<code>study/progress.md</code>、<code>study/journal/</code>）在 repo 裡，開新對話老師會自己讀。
          </li>
        </ul>
      </Section>

      <Button asChild variant="go" size="xl" className="w-full max-w-sm self-center">
        <Link to="/" className="no-underline hover:no-underline" data-testid="guide-back">
          <Play className="size-5 fill-current" /> 回今天
        </Link>
      </Button>
    </div>
  )
}
