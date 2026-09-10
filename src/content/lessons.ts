import type { Exercise, Lesson, StageMeta, World } from '../types'
import { bossByStage, lessonsByStage } from './lessons/index'

/**
 * 課綱入口。
 * - 世界／關卡結構、關 0 步驟在這裡。
 * - 每一課的內容（概念、卡片、3 題、專案題、Boss）分檔在 src/content/lessons/world1～5.ts。
 * - 暖身影片：每個世界 1 支，可跳過、不給 XP。長度與標題已用 YouTube 頁面實際確認過。
 */
export const WORLDS: World[] = [
  {
    id: 1,
    name: '一張表',
    emoji: '🧩',
    stageIds: [1, 2],
    blurb: '跟一張表講話：SELECT … FROM … WHERE …',
    video: {
      title: '關聯式資料庫到底是什麼｜生活中怎麼表達資料庫概念（上班了啊哈）',
      url: 'https://www.youtube.com/watch?v=7yYbbKyyHvw',
      minutes: 8,
      note: '用生活例子講「表、列、欄、關聯」。看完再打開 users 表會很有感。',
    },
  },
  {
    id: 2,
    name: '多張表',
    emoji: '🔗',
    stageIds: [3, 4, 5],
    blurb: '把兩張表串起來：JOIN … ON …（SQL 最核心的一件事）',
    video: {
      title: 'SQL 十四分鐘速成班（PAPAYA 電腦教室）— 從 06:45 彙總函數看到最後',
      url: 'https://www.youtube.com/watch?v=G_zGBR0mQmE&t=405',
      minutes: 7,
      note: '連結已跳到 06:45：彙總函數 → 資料分組 → 跨表格查詢。前面 6 分鐘是世界 1 的複習，有空再看。',
    },
  },
  {
    id: 3,
    name: '跑得快',
    emoji: '⚡',
    stageIds: [6, 7],
    blurb: '加索引，用 EXPLAIN 看有沒有用到',
    video: {
      title: 'MySQL 索引，一個動畫就了解了（轩辕的编程宇宙）',
      url: 'https://www.youtube.com/watch?v=93f0xoqR2aU',
      minutes: 5,
      note: '簡體中文、純動畫。只要看懂「索引 = 目錄、B+ 樹 = 一層一層翻」就夠，MySQL 和 PostgreSQL 在這點一樣。',
    },
  },
  {
    id: 4,
    name: '設計',
    emoji: '📐',
    stageIds: [8, 9, 10],
    blurb: '自己設計表：一格一個值、靠整組主鍵、畫 ER 圖',
    video: {
      title: 'EP04 資料庫正規化：不加班的整理術（工程師下班不加班）',
      url: 'https://www.youtube.com/watch?v=R9k_gihWOpA',
      minutes: 9,
      note: '用「收納」比喻 1NF／2NF／3NF。我們只練到 2NF，3NF 聽過就好。',
    },
  },
  {
    id: 5,
    name: '落地',
    emoji: '🚀',
    stageIds: [11, 12, 13, 14],
    blurb: '把設計放進程式：Prisma migration + 關聯',
    video: {
      title: 'What is an ORM and what does it do?（Code With Bubb）',
      url: 'https://www.youtube.com/watch?v=EwpT466EyP4',
      minutes: 9,
      note: '英文，開自動字幕。中文的 Prisma 短片都超過 15 分鐘，這支只講「ORM 是什麼、關聯怎麼寫」，夠用。',
    },
  },
]

export const BOSS_STAGE_IDS = [7, 14]

const EMPTY_BOSS: Exercise = { task: '', hint: '', expect: '', answer: '' }

export function stageMeta(stageId: number): StageMeta {
  return {
    id: stageId,
    world: WORLDS.find((w) => w.stageIds.includes(stageId))?.id ?? 0,
    lessons: lessonsByStage[stageId] ?? [],
    boss: bossByStage[stageId] ?? EMPTY_BOSS,
    isBigBoss: BOSS_STAGE_IDS.includes(stageId),
  }
}

export function allLessons(): Lesson[] {
  return Object.values(lessonsByStage).flat()
}

export function findLesson(lessonId: string): Lesson | undefined {
  return allLessons().find((l) => l.id === lessonId)
}

/** 關 0：環境設定。每一項可打勾，command 可一鍵複製。 */
export const SETUP_STEPS: Array<{ id: string; label: string; hint?: string; command?: string }> = [
  { id: 'orbstack', label: '打開 OrbStack App（Docker 的引擎）', hint: '右上角選單列出現 OrbStack 圖示就算開了。以後每次上課第一步都是這個。' },
  { id: 'terminal', label: '開一個新的終端機視窗，確認 node 可以用', command: 'node -v', hint: '看到 v22.23.1 就 OK。如果找不到，把舊終端機關掉重開。' },
  {
    id: 'docker-run',
    label: '啟動 PostgreSQL 容器（只需做一次）',
    command:
      'docker run --name learning-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=learning_db -p 5432:5432 -d postgres:16',
    hint: '會看到一長串亂碼 ID，那是正常的。之後電腦重開只要 docker start learning-pg。',
  },
  { id: 'docker-ps', label: '確認容器在跑', command: 'docker ps', hint: '看到 learning-pg 那一行，STATUS 是 Up。' },
  {
    id: 'seed',
    label: '匯入練習資料（在 sql-learning 資料夾裡執行）',
    command: 'cat data/learning-db-seed.sql | docker exec -i learning-pg psql -U postgres -d learning_db',
    hint: '會跑出很多 CREATE TABLE、INSERT 0 10 之類的字，沒有 ERROR 就成功。',
  },
  {
    id: 'psql',
    label: '走進資料庫（psql）',
    command: 'docker exec -it learning-pg psql -U postgres -d learning_db',
    hint: '提示符號變成 learning_db=# 就代表你在資料庫裡面了。離開打 \\q。',
  },
  { id: 'first-select', label: '人生第一句 SQL', command: 'SELECT * FROM users;', hint: '看到 10 個人的名單 → 關 0 過關，+30 XP。' },
  { id: 'tableplus', label: '（晚點做）安裝 TablePlus，用這些資料連線', hint: 'Host 127.0.0.1｜Port 5432｜User postgres｜Password secret｜Database learning_db' },
  { id: 'dev', label: '（可選）讓這個學習 App 在瀏覽器跑起來', command: 'npm run dev', hint: '在 sql-learning 資料夾裡執行，然後打開它顯示的網址。' },
]
