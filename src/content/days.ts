import type { DayContent } from '../types'
import { isExtraVisible } from '../lib/extraUnlock'
import { loadState } from '../lib/storage'

export const CORE_DAY_COUNT = 14
export const TWO_NF_DAY_ID = 9
export const EXTRA_DAY_ID = 15

export function extraUnlocked(): boolean {
  if (isExtraVisible()) return true
  const score = loadState().lastScore[String(TWO_NF_DAY_ID)]
  return Boolean(score && score.total > 0 && score.score === score.total)
}

export function canAccessDay(dayId: number): boolean {
  if (dayId !== EXTRA_DAY_ID) return true
  return extraUnlocked()
}

export function dayHeading(day: DayContent): string {
  return day.id === EXTRA_DAY_ID ? '隱藏關 Extra' : `關 ${day.id}`
}

export const days: DayContent[] = [
  {
    id: 1,
    title: 'DDL 與基本 CRUD',
    objectives: [
      '能建立 learning_db 與基本資料表',
      '理解 PK、欄位型別與 CRUD',
    ],
    keyPoints: [
      'DDL（CREATE／ALTER／DROP）用來定義結構；DML 的 INSERT／SELECT／UPDATE／DELETE 負責資料本身。',
      'users 至少含 id、name、email、created_at；products 至少含 id、name、price、stock、created_at。本專案練習資料另含 categories。',
      'PK 唯一識別一列；SERIAL／IDENTITY 常用來產生遞增 id。',
      'SELECT * 先看全表，再用 WHERE 篩選；UPDATE／DELETE 務必加條件以免誤改全表。',
    ],
    tasks: [
      '安裝並啟動 PostgreSQL（可用 Docker，見「本機 PostgreSQL」）。',
      '建立 learning_db 資料庫。',
      '建立 users 與 products 資料表。',
      '各自新增至少 20 筆測試資料（或匯入提供的練習資料）。',
      '練習 SELECT、WHERE、UPDATE、DELETE。',
      '用自己的話整理：PK、欄位型別、CRUD。',
    ],
    relatedTables: ['users', 'products', 'categories'],
  },
  {
    id: 2,
    title: '過濾、排序、聚合',
    objectives: ['熟練 WHERE、ORDER BY、LIMIT 與聚合函數'],
    keyPoints: [
      '比較運算：=、<>、IN、BETWEEN、LIKE。LIKE \'%Helmet%\' 可找商品名稱關鍵字。',
      'ORDER BY 可單欄或多欄；DESC 由高到低，例如依 price 排序商品。',
      'LIMIT 取前幾筆，常搭配 ORDER BY。',
      'COUNT／SUM／AVG／MIN／MAX 對一組列做彙總，沒有 GROUP BY 時視為整張結果集。',
    ],
    tasks: [
      '練習 WHERE 搭配 =、<>、IN、BETWEEN、LIKE。',
      '練習 ORDER BY 與 LIMIT。',
      '練習 COUNT、SUM、AVG、MIN、MAX。',
      '查出價格落在某區間的商品、名稱含關鍵字的商品，以及商品總數與平均價格。',
      '統計某一天新增的使用者數量。',
      '整理 5 個常用查詢模板。',
    ],
    relatedTables: ['users', 'products'],
  },
  {
    id: 3,
    title: 'GROUP BY 與 HAVING',
    objectives: ['能依使用者彙總訂單，並用 HAVING 篩選分組結果'],
    keyPoints: [
      'GROUP BY user_id 把同一使用者的訂單收成一組，再對每組做 COUNT 或 SUM(total_amount)。',
      'WHERE 在分組前過濾列；HAVING 在分組後過濾組（例如訂單總額大於某值）。',
      'SELECT 中非聚合欄位通常要出現在 GROUP BY。',
    ],
    tasks: [
      '建立 orders 表並新增至少 30 筆測試資料。',
      'GROUP BY user_id 統計訂單數量與總金額。',
      '用 HAVING 篩選總額大於指定值的使用者。',
      '比較 WHERE 與 HAVING，寫成 3 句筆記。',
      '自擬 3 題聚合查詢並完成。',
    ],
    relatedTables: ['users', 'orders'],
  },
  {
    id: 4,
    title: 'JOIN 基礎',
    objectives: ['能用 INNER JOIN 與 LEFT JOIN 串起訂單系統'],
    keyPoints: [
      'INNER JOIN 只保留兩邊都匹配的列，例如 orders JOIN users ON orders.user_id = users.id。',
      'order_items 透過 order_id、product_id 連接訂單與商品。',
      'LEFT JOIN 保留左表全部列；右表沒有匹配時欄位為 NULL（例如沒下過單的使用者）。',
    ],
    tasks: [
      '建立 order_items 並新增至少 50 筆明細。',
      'INNER JOIN orders 與 users、order_items 與 products。',
      '查出每張訂單包含哪些商品。',
      'LEFT JOIN 查出所有使用者（含無訂單）。',
      '理解結果中 NULL 的原因。',
      '完成至少 5 題 JOIN 練習。',
    ],
    relatedTables: ['users', 'orders', 'order_items', 'products'],
  },
  {
    id: 5,
    title: '子查詢',
    objectives: ['能用 IN／比較子查詢，並判斷何時改寫 JOIN'],
    keyPoints: [
      'IN (SELECT user_id FROM orders) 可找有下過單的使用者。',
      '找出從未下單的使用者，可用 NOT IN、NOT EXISTS 或 LEFT JOIN ... WHERE orders.id IS NULL。',
      '子查詢可算平均：total_amount > (SELECT AVG(total_amount) FROM orders)。',
      '許多子查詢可改寫成 JOIN；可讀性與執行計畫都要比較。',
    ],
    tasks: [
      'IN 子查詢找出有下過單的使用者。',
      '找出從未下單的使用者。',
      '找出高於平均訂單金額的訂單。',
      '把子查詢改寫成 JOIN。',
      '整理適用情境並自擬 3 題。',
    ],
    relatedTables: ['users', 'orders'],
  },
  {
    id: 6,
    title: '索引與查詢效能',
    objectives: ['理解 PK／UNIQUE／INDEX 與常見失效原因'],
    keyPoints: [
      'PK 本身就是一種 INDEX，並保證唯一，常作為查找起點；UNIQUE 約束通常也會建立 UNIQUE INDEX。',
      '練習資料已有 idx_orders_user_created_at 與 idx_order_items_order_product。',
      'EXPLAIN 觀察是否走 index scan。對欄位做函數、前置萬用字元 LIKE \'%xx\'、型別不一致都可能讓索引失效。',
      '寫多、讀少的欄，或選擇性極低的欄，不該隨意加 INDEX。',
    ],
    tasks: [
      '分辨 PK、INDEX、UNIQUE。',
      '在 orders(user_id, created_at) 與 order_items(order_id, product_id) 建立 INDEX。',
      '用 EXPLAIN 觀察至少 2 個查詢。',
      '比較加 INDEX 前後的差異。',
      '整理 3 個索引失效原因，以及何時不該加 INDEX。',
    ],
    relatedTables: ['orders', 'order_items', 'products'],
  },
  {
    id: 7,
    title: '第一週整合實作',
    objectives: ['把 CRUD、JOIN、GROUP BY、子查詢串成訂單模型'],
    keyPoints: [
      '最小訂單模型：users、products、orders、order_items（本練習資料另有 categories）。',
      '匯出 schema、寫 10 個實用查詢。ORM 實作依語言而異，不必在本週寫出某套框架程式；常見對照見 Day 12。',
      '自我驗收：列出仍寫不順的 SQL，作為補強清單。',
    ],
    tasks: [
      '確認練習資料的五張表模型完整。',
      '匯出 schema 或整理成 SQL 檔。',
      '寫出至少 10 個實用查詢。',
      '整理「語言／框架 → ORM」對照至少 4 組（細節見 Day 12），不必實作。',
      '列出 SQL 補強清單。',
    ],
    relatedTables: ['users', 'categories', 'products', 'orders', 'order_items'],
  },
  {
    id: 8,
    title: '1NF 基礎',
    objectives: ['能判斷原子性並把多值欄位拆成明細表'],
    keyPoints: [
      '1NF：每個欄位值必須是原子值，不可把多個商品名塞在同一欄（例如 \'A1, M2\'）。',
      '正確做法是拆出 order_items，一列一項商品與 quantity、price。',
      '拆完後較能獨立更新數量、不必解析字串，也方便 JOIN 統計。',
    ],
    tasks: [
      '理解 1NF 核心。',
      '準備未正規化範例並找出違反原子性的欄位。',
      '把多值欄位拆成 order_items。',
      '寫下分解前後 Schema 差異與原因。',
    ],
    relatedTables: ['orders', 'order_items', 'products'],
  },
  {
    id: 9,
    title: '2NF 基礎',
    objectives: ['能找出部分依賴並拆表'],
    keyPoints: [
      '2NF 先滿足 1NF，且非 PK 欄位必須完全依賴整個 PK。',
      'CPK 範例 enrollments(student_id, course_id, instructor, instructor_phone, grade)：instructor 只依賴 course_id 時即部分依賴。',
      '應拆出 courses 或 instructors，留下真正依賴整組鍵的欄位（如 grade）。',
      '本日前測驗滿分後，總覽結尾會解鎖 Extra Day（反正規化設計）。',
    ],
    tasks: [
      '理解 2NF。',
      '建立 CPK 範例並判斷部分依賴。',
      '將部分依賴欄位拆到新表。',
      '寫出函數依賴說明與 1NF／2NF 差異。',
    ],
    relatedTables: ['products', 'categories', 'order_items'],
  },
  {
    id: 10,
    title: 'ER 圖與 Schema 設計',
    objectives: ['能畫訂單系統 ER 並決定 PK／FK／索引'],
    keyPoints: [
      '練習資料只有 5 張表：users、categories、products、orders、order_items，沒有地址表。完整訂單系統還需要「地址」等實體；第 6 張表（建議 addresses：使用者 1 對多地址）須自行設計並新增。',
      '使用者 1 對多 訂單；訂單 1 對多 明細；商品與訂單透過明細形成多對多。',
      '每張表要有 PK；FK 對應關聯；常查欄位（user_id、category_id）考慮索引。',
    ],
    tasks: [
      '列出主要實體（含練習資料沒有的地址）。',
      '畫 ER 圖並標示基數。',
      '自己寫出第 6 張表（例如 addresses）的 DDL，含 PK／FK。',
      '決定必要索引，檢查多值／重複後對應成完整 Schema。',
    ],
    relatedTables: ['users', 'categories', 'products', 'orders', 'order_items'],
  },
  {
    id: 11,
    title: 'Migration 與練習資料',
    objectives: ['能用 migration 重建 schema 並變更欄位'],
    keyPoints: [
      'Migration 把 DDL 納入版本控制；up 建立、down／rollback 還原。',
      '提供的練習資料只有 5 張表；Day 10 設計的第 6 張（例如 addresses）要自行寫進 migration 與練習資料，檔名仍為 data/learning-db-seed.sql。',
      'schema 變更（例如新增 coupon_code、status）應再開一支 migration，而非直接改已上線的舊檔。',
      '新環境應能 migrate 並載入練習資料後完整重建（含自建表）。',
    ],
    tasks: [
      '用 SQL 檔（或你已熟悉的框架 migration）實作 Day 10 schema，含自行新增的第 6 張表。',
      '準備練習資料（5 張表之外，自建表也要有測試列）。',
      '練習 migrate、rollback、重新 migrate。',
      '新增欄位並確認可完整重建。',
      '整理命名與拆分策略。',
    ],
    relatedTables: ['users', 'products', 'orders', 'order_items'],
  },
  {
    id: 12,
    title: 'ORM 關聯與 N+1',
    objectives: ['理解 ORM 關聯與 N+1，並能對照常見語言／框架的 ORM'],
    keyPoints: [
      'ORM 把資料表對應成程式物件；語法依語言與框架而異，本課程不強制跑通某一套專案。',
      '常見對照：PHP／Laravel → Eloquent；PHP／Yii → ActiveRecord；Node.js → Prisma、TypeORM、Sequelize；Python → Django ORM、SQLAlchemy；Java → Hibernate／JPA；Ruby／Rails → ActiveRecord；C# → Entity Framework。',
      '關聯語意共通：User hasMany Orders；Order belongsTo User；Order hasMany OrderItems；OrderItem belongsTo Product。',
      'N+1：先查 10 張訂單，再各查一次使用者，變成 11 次查詢。',
      '預載（eager loading）一次載入關聯，延遲載入（lazy loading）用到才查。名稱因框架而異：Laravel with、Prisma include、Django select_related／prefetch_related、SQLAlchemy joinedload／selectinload。',
    ],
    tasks: [
      '寫出至少 4 組「語言／框架 → ORM」對照。',
      '用自己的話寫出訂單模型的 hasMany／belongsTo（不必寫程式）。',
      '說明 N+1 如何發生，以及預載如何避免。',
      '任選一個框架，查文件記下其預載寫法名稱。',
      '比較 lazy 與 eager 的差異，並記下 1 個 N+1 情境。',
    ],
    relatedTables: ['users', 'orders', 'order_items', 'products'],
  },
  {
    id: 13,
    title: '正規化複習與設計審查',
    objectives: ['能審查既有表是否違反 1NF／2NF 並提出改善'],
    keyPoints: [
      '用自己的話重寫 1NF（原子值）與 2NF（無部分依賴）。',
      '檢查過去設計：多值欄位、重複的講師電話、缺少 FK 或索引。',
      '產出短文件：Schema、ER、正規化理由、索引策略。',
    ],
    tasks: [
      '回顧並重寫 1NF／2NF 定義。',
      '審查舊表並列出至少 3 個改善點。',
      '補 FK、索引或拆表。',
      '整理簡短設計文件。',
    ],
    relatedTables: ['users', 'products', 'orders', 'order_items'],
  },
  {
    id: 14,
    title: '最終驗收',
    objectives: ['完成小型專案資料庫設計並能說明掌握程度'],
    keyPoints: [
      '驗收要至少 6 張表。練習資料只有 5 張，缺少的那張必須自行新增（建議 addresses），匯入練習資料不會自動變成 6 張。',
      'PK／FK 完整、設計達 2NF、主要查詢有適當索引。',
      '寫 10 個常用 SQL（JOIN、GROUP BY、子查詢）並用 EXPLAIN 檢查關鍵查詢；自建表也要能 JOIN。',
      '完成 migration、練習資料；ORM 能對照說明即可（不強制寫框架程式）。整理 Git、README、ER 與學習回顧。',
    ],
    tasks: [
      '在 5 張練習資料表之外自行新增至少 1 張表，使總數 ≥ 6，並確認達到 2NF。',
      '寫出至少 10 個常用查詢並檢查索引與 EXPLAIN。',
      '完成 migration 與練習資料（含自建表）；ORM 關聯用對照表說明即可。',
      '整理 Git repository 與 100–200 字學習回顧。',
    ],
    relatedTables: ['users', 'categories', 'products', 'orders', 'order_items'],
  },
  {
    id: EXTRA_DAY_ID,
    title: '反正規化設計',
    objectives: [
      '能在已達 2NF 的前提下，說明何時、為何刻意引入冗餘',
      '能舉出常見反正規手法與必須同步更新的代價',
    ],
    keyPoints: [
      '反正規化是在正規化之後的刻意取捨，不是跳過 2NF。先有正確依賴，再為讀取效能或報表複製資料。',
      '常見手法：明細列快照商品名／單價、使用者列快取訂單數、報表專用彙總表、物化視圖。',
      '代價是寫入變多、易不一致；必須約定誰是來源、如何回填（交易內更新、排程、觸發器）。',
      '適合讀多寫少、延遲可接受或歷史不可變的場景；不適合把反正規當偷懶、也不該無文件地複製欄位。',
    ],
    tasks: [
      '用自己的話區分「還沒正規化」與「刻意反正規」。',
      '為訂單模型列出 2 個可考慮的冗餘欄，並寫更新策略。',
      '說明快照單價與商品表現價為什麼可以同時存在。',
      '整理 3 個不該反正規的理由。',
    ],
    relatedTables: ['users', 'products', 'orders', 'order_items'],
  },
]

export function getDay(id: number): DayContent | undefined {
  return days.find((d) => d.id === id)
}
