/**
 * 常見錯誤字典：卡住時先來這裡查，查不到再問老師。
 * 每一條：pattern（比對錯誤訊息或症狀）→ where（哪一個字錯了）→ fix（怎麼改）→ cards（回去看哪張卡）。
 * 說明維持鐵律：只講「哪個字錯了、怎麼改」，不重講概念。
 */
export type ErrorEntry = {
  id: string
  /** 顯示用的錯誤訊息樣子 */
  looksLike: string
  /** 比對用（不分大小寫） */
  pattern: RegExp
  /** 哪一個字錯了（一句） */
  where: string
  /** 怎麼改（一句，可含要打的指令） */
  fix: string
  /** 相關卡片編號 */
  cards?: number[]
  /** 分類，只拿來分組顯示 */
  group: 'SQL 語法' | 'SQL 邏輯' | 'psql／終端機' | 'Docker／環境' | 'Prisma'
}

export const errorEntries: ErrorEntry[] = [
  // ── SQL 語法 ─────────────────────────────────────────────
  {
    id: 'syntax-near',
    looksLike: 'ERROR:  syntax error at or near "xxx"',
    pattern: /syntax error at or near/i,
    where: '引號裡那個字的「前面一個字」打錯或漏了：常見是少逗號、少空格、關鍵字拼錯（SELCT、FORM、WEHRE）。',
    fix: '看引號裡的字，往前看一個字。逐字對照題目的 SQL 重打一次；不要複製貼上，但可以一個字一個字對。',
    cards: [7, 9],
    group: 'SQL 語法',
  },
  {
    id: 'syntax-end',
    looksLike: 'ERROR:  syntax error at end of input',
    pattern: /syntax error at end of input/i,
    where: '句子還沒寫完就結束了：括號沒關、或 VALUES 後面少了東西。',
    fix: '數一下 ( 和 ) 是不是一樣多；CREATE TABLE 最後一欄後面不要逗號。',
    cards: [15],
    group: 'SQL 語法',
  },
  {
    id: 'waiting-semicolon',
    looksLike: '提示符號變成 learning_db-#（減號）或 learning_db(#，按 Enter 沒反應',
    pattern: /learning_db-#|learning_db\(#|沒反應|no response|還在等|減號/i,
    where: '上一句沒有結尾分號（-#），或括號／引號沒關（(# 或 \'#）。psql 還在等你把句子寫完。',
    fix: '直接打一個 ; 再 Enter。如果還是卡著，按 Ctrl+C 取消，重打整句。',
    cards: [7],
    group: 'SQL 語法',
  },
  {
    id: 'double-quote-value',
    looksLike: 'ERROR:  column "Taipei" does not exist',
    pattern: /column "[^"]+" does not exist/i,
    where: '文字值用了雙引號 "Taipei"，PostgreSQL 把它當欄名找。或者欄名真的打錯了。',
    fix: "文字值改用單引號 'Taipei'。如果是欄名打錯，用 \\d 表名 看正確欄名（注意大小寫）。",
    cards: [9, 10],
    group: 'SQL 語法',
  },
  {
    id: 'relation-not-exist',
    looksLike: 'ERROR:  relation "xxx" does not exist',
    pattern: /relation "[^"]+" does not exist/i,
    where: '表名打錯（user vs users）、還沒建這張表、或連到錯的資料庫。',
    fix: '打 \\dt 看有哪些表。沒有的話回關 0 第 5 步重新匯入 seed，或先 CREATE TABLE。Prisma 建的表名有大寫，psql 要加雙引號："Owner"。',
    cards: [6, 15],
    group: 'SQL 語法',
  },
  {
    id: 'relation-exists',
    looksLike: 'ERROR:  relation "pets" already exists',
    pattern: /relation "[^"]+" already exists/i,
    where: '這張表之前已經建過了。',
    fix: '要重建就先 DROP TABLE pets; 再 CREATE。只是想看它長怎樣就 \\d pets。',
    cards: [15],
    group: 'SQL 語法',
  },
  {
    id: 'unterminated-quote',
    looksLike: 'ERROR:  unterminated quoted string',
    pattern: /unterminated quoted string/i,
    where: '單引號沒成對，例如 \'Taipei 少了右邊那個。',
    fix: '數單引號是不是偶數個。中文輸入法的「’」也會出事，改成英文的 \'。',
    cards: [9],
    group: 'SQL 語法',
  },
  {
    id: 'ambiguous',
    looksLike: 'ERROR:  column reference "id" is ambiguous',
    pattern: /is ambiguous/i,
    where: 'JOIN 的兩張表都有這個欄名，資料庫不知道你要哪一個。',
    fix: '欄名前面加「誰的」：o.id 或 u.id。',
    cards: [31, 28],
    group: 'SQL 語法',
  },
  // ── SQL 邏輯 ─────────────────────────────────────────────
  {
    id: 'group-by-missing',
    looksLike: 'ERROR:  column "orders.user_id" must appear in the GROUP BY clause or be used in an aggregate function',
    pattern: /must appear in the GROUP BY clause/i,
    where: 'SELECT 裡有一個欄沒被聚合（COUNT／SUM…）包住，也沒寫進 GROUP BY。',
    fix: '把那個欄加進 GROUP BY，或把它拿掉，或用聚合函數包起來。',
    cards: [25],
    group: 'SQL 邏輯',
  },
  {
    id: 'aggregate-in-where',
    looksLike: 'ERROR:  aggregate functions are not allowed in WHERE',
    pattern: /aggregate functions are not allowed in WHERE/i,
    where: 'WHERE 裡放了 COUNT／SUM／AVG。分組後的條件不能寫在 WHERE。',
    fix: '改成 GROUP BY … HAVING COUNT(*) > …；要跟平均比就包成子查詢 (SELECT AVG(…) FROM …)。',
    cards: [26, 27, 35],
    group: 'SQL 邏輯',
  },
  {
    id: 'update-all',
    looksLike: 'UPDATE 10 或 DELETE 10（本來只想改一列）',
    pattern: /UPDATE \d{2,}|DELETE \d{2,}|全部被改|全部被刪|改到全表|刪光/i,
    where: 'UPDATE／DELETE 沒有 WHERE，整張表都被動到了。',
    fix: '重新匯入 seed 救回（關 0 第 5 步那句 cat data/… | docker exec …）。以後先寫 WHERE 再寫前面。',
    cards: [12, 13],
    group: 'SQL 邏輯',
  },
  {
    id: 'null-equals',
    looksLike: 'WHERE xxx = NULL 回 0 列（明明有 NULL）',
    pattern: /= ?NULL|0 rows.*NULL|NULL.*0 rows/i,
    where: '= NULL 永遠不成立。NULL 不是一個可以「等於」的值。',
    fix: '改成 IS NULL（或 IS NOT NULL）。',
    cards: [24, 32],
    group: 'SQL 邏輯',
  },
  {
    id: 'like-no-percent',
    looksLike: "LIKE 'Helmet' 回 0 列",
    pattern: /LIKE '[^%']+'|LIKE 沒有 ?%|模糊.*0 rows/i,
    where: "LIKE 後面沒有 %，變成「整個字剛好等於」。",
    fix: "要「含有」就兩邊加 %：LIKE '%Helmet%'。大小寫不同可用 ILIKE。",
    cards: [20],
    group: 'SQL 邏輯',
  },
  {
    id: 'duplicate-key',
    looksLike: 'ERROR:  duplicate key value violates unique constraint "users_email_key"',
    pattern: /duplicate key value violates unique constraint/i,
    where: 'INSERT 的值撞到 UNIQUE 欄（引號裡有欄名，例如 email）。',
    fix: '換一個沒用過的值；或先 SELECT 看那個值是不是已經在表裡。',
    cards: [18],
    group: 'SQL 邏輯',
  },
  {
    id: 'fk-violation',
    looksLike: 'ERROR:  insert or update on table "orders" violates foreign key constraint',
    pattern: /violates foreign key constraint/i,
    where: 'FK 欄填的 id 在父表裡不存在（例如 user_id = 99 但沒有 id 99 的使用者）。',
    fix: '先 SELECT id FROM 父表; 確認存在的 id，再 INSERT。這是 FK 在保護你，不是壞事。',
    cards: [29],
    group: 'SQL 邏輯',
  },
  {
    id: 'not-null',
    looksLike: 'ERROR:  null value in column "name" violates not-null constraint',
    pattern: /violates not-null constraint/i,
    where: 'INSERT 少給了一個 NOT NULL 的欄（引號裡那個）。',
    fix: '把那個欄和值補進 INSERT 的欄名清單與 VALUES。',
    cards: [18, 11],
    group: 'SQL 邏輯',
  },
  {
    id: 'limit-order',
    looksLike: 'syntax error at or near "ORDER"（LIMIT 寫在 ORDER BY 前面）',
    pattern: /near "ORDER"|LIMIT.*ORDER BY/i,
    where: 'LIMIT 放在 ORDER BY 前面了。',
    fix: '順序固定：WHERE → GROUP BY → HAVING → ORDER BY → LIMIT。LIMIT 永遠最後。',
    cards: [21, 22],
    group: 'SQL 邏輯',
  },
  {
    id: 'invalid-date',
    looksLike: 'ERROR:  invalid input syntax for type date / integer',
    pattern: /invalid input syntax for type/i,
    where: '值的型別跟欄位不合：日期要 \'YYYY-MM-DD\'、數字不能有引號或逗號。',
    fix: "日期寫 '2024-03-01'；數字寫 3000 不寫 '3,000'。看錯誤訊息最後說的 type 是哪一種。",
    cards: [16],
    group: 'SQL 邏輯',
  },
  // ── psql／終端機 ─────────────────────────────────────────────
  {
    id: 'backslash-cmd',
    looksLike: '打 /d users 或 \\d users; 沒反應或報錯',
    pattern: /^\/d|\\d .*;|invalid command \\/i,
    where: '\\d 是 psql 指令：要用反斜線 \\（Enter 上面那顆），而且結尾不要分號。',
    fix: '打 \\d users 然後直接 Enter。所有反斜線指令都不加分號。',
    cards: [5],
    group: 'psql／終端機',
  },
  {
    id: 'not-in-psql',
    looksLike: 'zsh: command not found: SELECT',
    pattern: /command not found: (SELECT|INSERT|UPDATE|DELETE|CREATE)/i,
    where: '你在終端機（zsh），不在 psql 裡。SQL 要在 learning_db=# 提示符號後面打。',
    fix: '先 docker exec -it learning-pg psql -U postgres -d learning_db 進去，看到 learning_db=# 再打 SQL。',
    cards: [4, 5],
    group: 'psql／終端機',
  },
  {
    id: 'in-psql-shell-cmd',
    looksLike: '在 psql 裡打 docker … 或 npm … 出現 syntax error',
    pattern: /near "docker"|near "npm"|near "cat"|near "node"/i,
    where: '你在 psql 裡，但這是終端機指令。',
    fix: '先 \\q 離開 psql，回到 % 提示符號再打。',
    cards: [4, 5],
    group: 'psql／終端機',
  },
  {
    id: 'npm-not-found',
    looksLike: 'zsh: command not found: npm（或 node）',
    pattern: /command not found: (npm|node|npx)/i,
    where: '這個終端機視窗是舊的，還沒載入 nvm。',
    fix: '關掉這個終端機視窗，開一個新的，再打 node -v。',
    cards: [3],
    group: 'psql／終端機',
  },
  // ── Docker／環境 ─────────────────────────────────────────────
  {
    id: 'docker-not-running',
    looksLike: 'Cannot connect to the Docker daemon / docker: command not found',
    pattern: /Cannot connect to the Docker daemon|command not found: docker|Is the docker daemon running/i,
    where: 'OrbStack（Docker 的引擎）沒開。',
    fix: '打開 OrbStack App，等右上角圖示出現，再重打指令。',
    cards: [2],
    group: 'Docker／環境',
  },
  {
    id: 'container-not-running',
    looksLike: 'Error response from daemon: container xxx is not running',
    pattern: /is not running|No such container/i,
    where: '容器 learning-pg 停了（電腦重開過），或還沒建。',
    fix: 'docker start learning-pg。如果說 No such container，回關 0 第 3 步重跑 docker run。',
    cards: [2],
    group: 'Docker／環境',
  },
  {
    id: 'port-in-use',
    looksLike: 'Bind for 0.0.0.0:5432 failed: port is already allocated',
    pattern: /port is already allocated|address already in use/i,
    where: '5432 這個門牌已經有別的東西在用（可能是之前建過的容器）。',
    fix: 'docker ps -a 看看是不是 learning-pg 已經存在 → docker start learning-pg 就好，不用再 run。',
    cards: [2],
    group: 'Docker／環境',
  },
  {
    id: 'password-auth',
    looksLike: 'FATAL:  password authentication failed for user "postgres"',
    pattern: /password authentication failed/i,
    where: 'TablePlus 或 .env 的密碼打錯。',
    fix: '密碼是 secret，使用者 postgres，資料庫 learning_db，Port 5432。',
    cards: [5],
    group: 'Docker／環境',
  },
  // ── Prisma ─────────────────────────────────────────────
  {
    id: 'prisma-cant-reach',
    looksLike: "Error: P1001: Can't reach database server at `localhost:5432`",
    pattern: /P1001|Can't reach database server/i,
    where: '資料庫沒在跑，或 .env 的 DATABASE_URL 打錯。',
    fix: '① 開 OrbStack、docker start learning-pg。② .env 要是 postgresql://postgres:secret@localhost:5432/learning_db',
    cards: [2, 54],
    group: 'Prisma',
  },
  {
    id: 'prisma-drift',
    looksLike: 'Drift detected: Your database schema is not in sync with your migration history',
    pattern: /Drift detected|not in sync with your migration history/i,
    where: '你直接在 psql 改了表，跟 migration 檔對不上。',
    fix: '練習庫可以直接 npx prisma migrate reset（會清空重建）。以後改結構只改 schema.prisma。',
    cards: [52],
    group: 'Prisma',
  },
  {
    id: 'prisma-fk-migrate',
    looksLike: 'migrate 失敗：foreign key constraint … 已有資料對不上',
    pattern: /Foreign key constraint failed|violates foreign key.*Prisma|ERROR: insert or update on table "Pet"/i,
    where: '已經有 Pet 資料，但 ownerId 指到不存在的 Owner。',
    fix: 'npx prisma migrate reset 清掉重來，再 seed。',
    cards: [29, 52],
    group: 'Prisma',
  },
]

/** 比對錯誤訊息，回傳命中的條目（可能多條，最多 3）。 */
export function matchErrors(text: string): ErrorEntry[] {
  const t = text.trim()
  if (!t) return []
  return errorEntries.filter((e) => e.pattern.test(t)).slice(0, 3)
}
