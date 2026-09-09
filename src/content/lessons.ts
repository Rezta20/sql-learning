import type { Lesson, StageMeta, World } from '../types'

export const WORLDS: World[] = [
  { id: 1, name: '一張表', emoji: '🧩', stageIds: [1, 2], blurb: '跟一張表講話：SELECT … FROM … WHERE …' },
  { id: 2, name: '多張表', emoji: '🔗', stageIds: [3, 4, 5], blurb: '把兩張表串起來：JOIN … ON …（SQL 最核心的一件事）' },
  { id: 3, name: '跑得快', emoji: '⚡', stageIds: [6, 7], blurb: '加索引，用 EXPLAIN 看有沒有用到' },
  { id: 4, name: '設計', emoji: '📐', stageIds: [8, 9, 10], blurb: '自己設計表：一格一個值、靠整組主鍵、畫 ER 圖' },
  { id: 5, name: '落地', emoji: '🚀', stageIds: [11, 12, 13, 14], blurb: '把設計放進程式：Prisma migration + 關聯' },
]

export const BOSS_STAGE_IDS = [7, 14]

/**
 * 每關拆成幾課。一課 = 一個概念 + 手寫卡 + 3 題 + 1 題「換成你的專案」。
 * exercises 用電商練習資料；project 用寵物營養（你的 side project）。
 */
const lessons: Record<number, Lesson[]> = {
  1: [
    {
      id: '1-1',
      title: '資料庫長什麼樣',
      focus: '認出「表、列、欄、PK」四個東西',
      check: '打開 users 表，指得出哪裡是列、哪裡是欄、哪欄是 PK',
      concept: '資料庫是檔案櫃，表是一張 Excel，一列是一筆資料，一欄是一種屬性。id 那欄是 PK。',
      cards: [6, 7, 1],
      exercises: [
        '在 TablePlus（或 psql）打開 users 表，數一數：幾列？幾欄？欄名各是什麼？',
        '在 psql 打：SELECT * FROM users;  截圖結果。',
        '在 psql 打：SELECT * FROM products;  找出最貴的商品叫什麼（先用眼睛找）。',
      ],
      project: '在筆記本畫一張「飼主 owners」表：你覺得需要哪些欄？至少 4 欄，圈出哪一欄是 PK。',
    },
    {
      id: '1-2',
      title: 'SELECT 與 WHERE',
      focus: '用 SELECT 挑欄、用 WHERE 挑列',
      check: '寫出一句有 WHERE 的 SELECT，跑出你想要的那幾列',
      concept: 'SELECT 決定「看哪幾欄」，WHERE 決定「留哪幾列」。',
      cards: [9, 10],
      exercises: [
        'SELECT name, email FROM users;',
        "SELECT * FROM users WHERE city = 'Taipei';",
        'SELECT name, price FROM products WHERE price > 3000;',
      ],
      project: "假設有 pets 表（欄：id, name, species, owner_id）。寫一句「找出所有狗」的 SQL（species = 'dog'）。先寫在筆記本，再貼給老師。",
    },
    {
      id: '1-3',
      title: 'INSERT／UPDATE／DELETE',
      focus: '新增、修改、刪除一列，而且 UPDATE／DELETE 一定帶 WHERE',
      check: '自己 INSERT 一筆、UPDATE 它、再 DELETE 它，表沒被弄壞',
      concept: '新增、修改、刪除。UPDATE 和 DELETE 一定要有 WHERE，否則整張表都會被改／刪。',
      cards: [8, 11, 12, 13],
      exercises: [
        "INSERT INTO users (name, email, city) VALUES ('Sasha', 'sasha@example.com', 'Taipei');  然後 SELECT 確認。",
        'UPDATE products SET price = 3999 WHERE id = 1;  然後 SELECT 確認。',
        "DELETE FROM users WHERE email = 'sasha@example.com';  然後 SELECT 確認消失。",
      ],
      project: '寫一句 INSERT，把你的（或想像中的）寵物放進 pets 表：名字、品種、飼主 id。',
    },
    {
      id: '1-4',
      title: 'CREATE TABLE：自己蓋一張表',
      focus: '自己蓋一張表（CREATE TABLE）',
      check: '寫出一張 pets 表，INSERT 兩筆，SELECT 得出來',
      concept: 'DDL 是蓋房子。CREATE TABLE 宣告表名、欄名、型別、約束。SERIAL 讓 id 自己長。',
      cards: [14, 15, 16, 17, 18],
      exercises: [
        '打開 data/learning-db-seed.sql，看 CREATE TABLE users 那一段，逐欄說出型別是什麼。',
        'CREATE TABLE pets (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, species VARCHAR(20) NOT NULL, birth_date DATE);',
        'INSERT 兩隻寵物進 pets，然後 SELECT * FROM pets;',
      ],
      project: '恭喜：pets 就是你 side project 的第一張表。把它的 CREATE TABLE 抄進筆記本「我的專案」頁。',
    },
  ],
  2: [
    {
      id: '2-1',
      title: '比較運算子與 LIKE',
      focus: 'WHERE 裡除了 = 還有 IN／BETWEEN／LIKE',
      check: '用 LIKE 找出名字含某個字的商品',
      concept: 'WHERE 不只有 =。IN 是名單、BETWEEN 是範圍、LIKE 是模糊比對（% 任意字）。',
      cards: [19, 20],
      exercises: [
        "SELECT name, city FROM users WHERE city IN ('Taipei', 'Taoyuan');",
        'SELECT name, price FROM products WHERE price BETWEEN 2000 AND 5000;',
        "SELECT name FROM products WHERE name LIKE '%Helmet%';",
      ],
      project: "假設 foods 表有 name 欄。寫一句找出名字含「雞」的飼料：LIKE '%雞%'。",
    },
    {
      id: '2-2',
      title: 'ORDER BY 與 LIMIT',
      focus: '先排序（ORDER BY），再取前幾筆（LIMIT）',
      check: '查出最貴的 3 個商品',
      concept: '先排序，再取前幾筆。DESC 由大到小。',
      cards: [21, 22],
      exercises: [
        'SELECT name, price FROM products ORDER BY price DESC;',
        'SELECT name, category_id, price FROM products ORDER BY category_id, price DESC;',
        'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
      ],
      project: '假設 weight_logs 表有 pet_id, weight_kg, measured_at。寫一句「某隻寵物最新 5 筆體重」。',
    },
    {
      id: '2-3',
      title: '聚合函數',
      focus: '用 COUNT／AVG／MIN／MAX 把很多列算成一個數字',
      check: '算出商品的平均價和最高價',
      concept: 'COUNT／SUM／AVG／MIN／MAX 把很多列算成一個數字。NULL 不會被算進去。',
      cards: [23, 24],
      exercises: [
        'SELECT COUNT(*) FROM users;',
        'SELECT AVG(price), MIN(price), MAX(price) FROM products;',
        "SELECT COUNT(*) FROM users WHERE created_at::date = '2026-08-01';",
      ],
      project: '寫一句「某隻寵物的平均體重」（AVG(weight_kg) WHERE pet_id = 1）。',
    },
  ],
  3: [
    {
      id: '3-1',
      title: 'GROUP BY',
      focus: 'GROUP BY 把同類收成一組，每組算一個數',
      check: '算出每位使用者各有幾張訂單',
      concept: '把同一類的列收成一組，每組算一個數字。SELECT 裡沒被聚合的欄要出現在 GROUP BY。',
      cards: [25, 28],
      exercises: [
        'SELECT user_id, COUNT(*) AS order_count FROM orders GROUP BY user_id;',
        'SELECT user_id, SUM(total_amount) AS total FROM orders GROUP BY user_id;',
        'SELECT category_id, COUNT(*) FROM products GROUP BY category_id;',
      ],
      project: '寫一句「每隻寵物有幾筆體重紀錄」（GROUP BY pet_id）。',
    },
    {
      id: '3-2',
      title: 'HAVING 與 WHERE 的差別',
      focus: 'HAVING 是「分組之後」的篩選；WHERE 是「分組之前」',
      check: '篩出總消費 > 5000 的使用者',
      concept: 'WHERE 在分組前過濾「列」，HAVING 在分組後過濾「組」。',
      cards: [26, 27],
      exercises: [
        'SELECT user_id, SUM(total_amount) FROM orders GROUP BY user_id HAVING SUM(total_amount) > 5000;',
        'SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) >= 2;',
        "SELECT user_id, COUNT(*) FROM orders WHERE status = 'paid' GROUP BY user_id HAVING COUNT(*) >= 1;",
      ],
      project: '寫一句「體重紀錄 ≥ 3 筆的寵物」。',
    },
  ],
  4: [
    {
      id: '4-1',
      title: 'FK 與一對多',
      focus: 'FK 是表與表之間的線；「多」的那邊放 FK',
      check: '指出 orders 裡哪一欄是 FK、指向哪張表',
      concept: 'FK 是指向另一張表 PK 的欄位。「一個使用者有很多訂單」→ orders 放 user_id。',
      cards: [29, 30, 33],
      exercises: [
        'SELECT id, user_id FROM orders;  對照 users 表，user_id=1 是誰？',
        '在筆記本畫 users ──< orders，線的兩端寫 1 和 多。',
        'SELECT * FROM orders WHERE user_id = 1;',
      ],
      project: '畫 owners ──< pets ──< weight_logs，並寫出每張表的 FK 欄名。',
    },
    {
      id: '4-2',
      title: 'INNER JOIN',
      focus: 'JOIN … ON 把兩張表對起來',
      check: '查出「每張訂單 + 下單者名字」',
      concept: '用 ON 把 FK 和 PK 對起來，兩邊都配得到才保留。',
      cards: [31],
      exercises: [
        'SELECT o.id, u.name, o.total_amount FROM orders o JOIN users u ON o.user_id = u.id;',
        'SELECT oi.order_id, p.name, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.id;',
        'SELECT o.id, u.name, p.name FROM orders o JOIN users u ON o.user_id = u.id JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id;',
      ],
      project: '寫一句「每筆體重紀錄 + 寵物名字」（weight_logs JOIN pets）。',
    },
    {
      id: '4-3',
      title: 'LEFT JOIN 與 NULL',
      focus: 'LEFT JOIN 會保留左邊全部，配不到的補 NULL',
      check: '找出沒下過單的使用者',
      concept: '左表全留，右邊沒配到補 NULL。這就是找「沒有」的方法。多對多要靠中間表。',
      cards: [32, 34],
      exercises: [
        'SELECT u.name, o.id FROM users u LEFT JOIN orders o ON o.user_id = u.id;',
        'SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;',
        '在筆記本畫 orders ──< order_items >── products，說出為什麼需要 order_items。',
      ],
      project: '寫一句「所有寵物，含沒有體重紀錄的」（LEFT JOIN）。',
    },
  ],
  5: [
    {
      id: '5-1',
      title: 'IN 子查詢與比較子查詢',
      focus: '括號裡先跑一個小查詢，結果給外面用',
      check: '查出金額高於平均的訂單',
      concept: '括號裡先跑小查詢，結果給外面用。',
      cards: [35, 36],
      exercises: [
        'SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);',
        'SELECT * FROM orders WHERE total_amount > (SELECT AVG(total_amount) FROM orders);',
        'SELECT name FROM products WHERE category_id IN (SELECT id FROM categories WHERE name = \'Helmets\');',
      ],
      project: '假設 medical_history 表有 pet_id。寫一句「有病歷的寵物」。',
    },
    {
      id: '5-2',
      title: '找「沒有」的三種寫法',
      focus: '找「沒有」的三種寫法，結果一樣',
      check: '用兩種寫法找出從未下單的使用者',
      concept: 'NOT IN、NOT EXISTS、LEFT JOIN … IS NULL 結果一樣，讀起來不同。要欄位就用 JOIN。',
      cards: [37, 38],
      exercises: [
        'SELECT name FROM users WHERE id NOT IN (SELECT user_id FROM orders);',
        'SELECT name FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);',
        'SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;',
      ],
      project: '用三種寫法各寫一句「從未量過體重的寵物」。',
    },
  ],
  6: [
    {
      id: '6-1',
      title: 'INDEX 與 EXPLAIN',
      focus: '索引 = 目錄；EXPLAIN 看它有沒有被用到',
      check: 'EXPLAIN 一句查詢，說出它是 Index Scan 還是 Seq Scan',
      concept: '索引是書的目錄。EXPLAIN 讓資料庫告訴你它打算怎麼找。',
      cards: [39, 40, 41],
      exercises: [
        'EXPLAIN SELECT * FROM orders WHERE user_id = 1;  找到 Index Scan 或 Seq Scan 這幾個字。',
        'DROP INDEX idx_orders_user_created_at;  再 EXPLAIN 一次，比較差異。',
        'CREATE INDEX idx_orders_user_created_at ON orders(user_id, created_at);  把索引加回來。',
      ],
      project: 'weight_logs 最常用 pet_id + measured_at 查。寫出那一行 CREATE INDEX。',
    },
    {
      id: '6-2',
      title: '索引失效的三個原因',
      focus: '三種寫法會讓索引失效',
      check: '講出三個原因，各舉一句 SQL',
      concept: '對欄位套函數、LIKE 開頭 %、型別不一致，索引就用不到。',
      cards: [42],
      exercises: [
        "EXPLAIN SELECT * FROM products WHERE name LIKE '%Helmet';",
        "EXPLAIN SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';",
        "EXPLAIN SELECT * FROM orders WHERE user_id = '1';",
      ],
      project: '列出你專案 3 個最常拿來查的欄位，判斷哪些值得加索引、哪些不值得。',
    },
  ],
  7: [
    {
      id: '7-1',
      title: '匯出 schema、畫關係圖',
      focus: 'Schema 就是設計圖，可以存成 SQL 檔',
      check: '畫出五張表的關係圖，每條線標 1 或多',
      concept: 'Schema 是設計圖。把它存成 SQL 檔，任何電腦都能重建。',
      cards: [43],
      exercises: [
        'docker exec learning-pg pg_dump -U postgres -d learning_db --schema-only  看輸出。',
        '在筆記本畫五張表的關係圖（users、categories、products、orders、order_items）。',
        '用自己的話說出每一條線是 1 對多還是多對多。',
      ],
      project: '畫你的寵物營養 DB 全圖：owners、pets、weight_logs、medical_history、diet_needs、foods、food_types。',
    },
    {
      id: '7-2',
      title: '10 個實用查詢',
      focus: '把第一週學的混在一起用',
      check: '10 句查詢全部在 psql 跑通',
      concept: '把第一週的 CRUD、GROUP BY、JOIN、子查詢混在一起用。',
      cards: [],
      exercises: [
        '寫 4 句 CRUD（各一句）。',
        '寫 3 句 GROUP BY／HAVING。',
        '寫 3 句 JOIN 或子查詢。',
      ],
      project: '為你的寵物 DB 寫 5 句你「真的會用到」的查詢。',
    },
  ],
  8: [
    {
      id: '8-1',
      title: '1NF：一格一個值',
      focus: '一格只放一個值（1NF）',
      check: '看到 \'A1, M2\' 這種欄位，知道要拆成子表',
      concept: '一個欄位只放一個值。多值欄位要拆成子表。',
      cards: [44, 45],
      exercises: [
        "看這張壞表：orders(id, products='A1, M2', quantities='1, 2')。指出哪兩欄違反 1NF。",
        '寫出拆完後的兩張表 DDL（orders、order_items）。',
        '用自己的話寫 2 句：拆完之後為什麼比較好。',
      ],
      project: "你的 pets 表若有 diseases='糖尿病,腎病' 欄，把它拆成 medical_history 表。寫出 DDL。",
    },
  ],
  9: [
    {
      id: '9-1',
      title: '2NF：靠整組主鍵',
      focus: '非鍵欄位要靠「整組」主鍵（2NF）',
      check: '看 enrollments 例子，指出哪個欄位該搬走',
      concept: '複合主鍵下，非鍵欄位不能只靠主鍵的一部分就被決定。',
      cards: [46, 47, 48],
      exercises: [
        '看 enrollments(student_id, course_id, instructor, instructor_phone, grade)，PK 是 (student_id, course_id)。哪些欄只靠 course_id？',
        '拆出 courses(course_id, instructor, instructor_phone)，寫出兩張表 DDL。',
        '寫出函數依賴：course_id → instructor；(student_id, course_id) → grade。',
      ],
      project: '看 feedings(pet_id, food_id, food_kcal_per_100g, grams)。food_kcal_per_100g 靠誰？該搬去哪張表？',
    },
  ],
  10: [
    {
      id: '10-1',
      title: 'ER 圖與基數',
      focus: '方框是表、線是關係、叉子是「多」',
      check: '畫出自己專案的 ER 圖（≥ 6 張表）',
      concept: '方框是實體（表），線是關係，叉子端是「多」。',
      cards: [49, 50, 51],
      exercises: [
        '畫電商 5 張表的 ER 圖，每條線標 1 或 多。',
        '加上第 6 張表 addresses（使用者 1 對多 地址），畫進圖裡。',
        '為每張表寫出 PK、FK。',
      ],
      project: '正式畫你的寵物營養 ER 圖（≥ 6 張表），每條線標基數。這張圖之後會進你的 README。',
    },
    {
      id: '10-2',
      title: '把 ER 圖變成 DDL',
      focus: '每個方框 → CREATE TABLE，每條線 → REFERENCES',
      check: '自己專案的 DDL 在 psql 跑通',
      concept: '每個方框 → CREATE TABLE；每條線 → 一個 FK（REFERENCES）。',
      cards: [],
      exercises: [
        'CREATE TABLE addresses (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), city VARCHAR(100), street VARCHAR(200));',
        'INSERT 3 筆地址，然後 users LEFT JOIN addresses。',
        '為 addresses(user_id) 建索引。',
      ],
      project: '把你的寵物 ER 圖全部寫成 CREATE TABLE，在 psql 跑通。',
    },
  ],
  11: [
    {
      id: '11-1',
      title: 'Prisma 初始化與第一個 migration',
      focus: 'Migration = 資料庫的版本紀錄',
      check: 'prisma migrate dev 跑完，TablePlus 看到新表',
      concept: 'Migration 是資料庫的版本紀錄。Prisma 用 schema.prisma 描述表，再生成 SQL。',
      cards: [52, 53, 54],
      exercises: [
        'npm init -y && npm install prisma @prisma/client && npx prisma init',
        '在 schema.prisma 寫 model User（id, name, email, createdAt）。',
        'npx prisma migrate dev --name init  然後在 TablePlus 看到新表。',
      ],
      project: '把你的 owners、pets 寫成 Prisma model 並 migrate。',
    },
    {
      id: '11-2',
      title: '變更、還原、重建',
      focus: '改結構就開一支新 migration；新環境靠 migrate + seed 重建',
      check: 'prisma migrate reset 後資料完整回來',
      concept: '改結構要再開一支新 migration，不改舊檔。新環境跑 migrate + seed 就能完整重建。',
      cards: [],
      exercises: [
        '在 model Order 加 status 欄，跑 migrate dev --name add_status。',
        'npx prisma migrate reset  觀察它從頭重建。',
        '寫一個 seed 腳本灌入 3 筆使用者。',
      ],
      project: '為你的專案寫 seed：2 個飼主、3 隻寵物、10 筆體重紀錄。',
    },
  ],
  12: [
    {
      id: '12-1',
      title: 'ORM 關聯',
      focus: 'hasMany／belongsTo 是一對多的兩個方向',
      check: '用 include 一次撈出使用者和他的訂單',
      concept: 'hasMany／belongsTo 是 1 對多的兩個方向。Prisma 用 @relation。',
      cards: [55, 56],
      exercises: [
        '在 schema.prisma 寫 User hasMany Order（orders Order[]）與 Order belongsTo User。',
        'prisma.user.findMany({ include: { orders: true } })',
        '寫 4 組對照：Node.js→Prisma、PHP／Laravel→Eloquent、Python→Django ORM、Ruby→ActiveRecord。',
      ],
      project: 'Owner hasMany Pet、Pet hasMany WeightLog，用 Prisma 寫出來。',
    },
    {
      id: '12-2',
      title: 'N+1 與預先載入',
      focus: 'N+1 = 多跑 N 次查詢；include 一次撈齊',
      check: '寫出一段 N+1 和它的修正版',
      concept: '先查 N 隻寵物、再各查一次飼主 = N+1 次。include 一次撈齊。',
      cards: [57, 58],
      exercises: [
        '故意寫一段 N+1：for 迴圈裡對每個 order 再查 user。',
        '改成 findMany({ include: { user: true } })，比較查詢次數。',
        '寫下 Laravel 的對應寫法：with(\'user\')。',
      ],
      project: '寫一段「所有飼主 → 每隻寵物 → 最新體重」一次撈齊的 Prisma 查詢。',
    },
  ],
  13: [
    {
      id: '13-1',
      title: '設計審查',
      focus: '用 1NF、2NF、FK、索引四個問題檢查一張表',
      check: '對自己的專案列出 3 個改善點',
      concept: '拿一張舊表，用 1NF、2NF、FK、索引四個問題檢查它。',
      cards: [59],
      exercises: [
        '找一張你以前設計過（或同事給的）表，檢查：有多值欄嗎？有部分依賴嗎？',
        '列出至少 3 個改善點。',
        '補上缺的 FK 或索引，決定哪裡該用 ON DELETE CASCADE。',
      ],
      project: '審查你自己的寵物營養 DB，寫一頁設計文件：Schema、ER、正規化理由、索引策略。',
    },
  ],
  14: [
    {
      id: '14-1',
      title: '最終驗收：交出你的 side project 資料庫',
      focus: '交出自己的資料庫 v1',
      check: 'Git repo 有 README、ER 圖、10 句查詢',
      concept: '≥ 6 張表、達 2NF、10 句常用查詢、EXPLAIN 檢查、migration + seed、README。',
      cards: [],
      exercises: [
        '確認你的寵物營養 DB ≥ 6 張表、PK／FK 完整。',
        '寫 10 句常用查詢（含 JOIN、GROUP BY、子查詢），用 EXPLAIN 檢查 2 句。',
        '整理成 Git repo：README、ER 圖、範例查詢、100–200 字學習回顧。',
      ],
      project: '這關的專案題就是全部：交付寵物營養資料庫 v1。',
    },
  ],
  15: [
    {
      id: '15-1',
      title: '反正規化：刻意的冗餘',
      focus: '正規化之後，才「刻意」複製資料',
      check: '講出快照單價和商品現價為什麼能同時存在',
      concept: '先正規化，再為了讀取速度故意複製資料，並寫清楚誰是來源、怎麼同步。',
      cards: [60],
      exercises: [
        '解釋 order_items.price 和 products.price 為什麼可以同時存在。',
        '為訂單模型列 2 個可考慮的冗餘欄位，寫更新策略。',
        '寫 3 個不該反正規化的理由。',
      ],
      project: 'pets 表要不要放 latest_weight_kg 快取欄？寫出要／不要的理由和同步策略。',
    },
  ],
}

const bossByStage: Record<number, string> = {
  1: '建立 owners 表（id、name、email、city），INSERT 你自己，UPDATE 你的 city，最後 SELECT 出來給老師看。',
  2: "一句 SQL 查出 2026-08-01 建立的商品有幾個、平均價格、最高價格。",
  3: '每個城市有幾位使用者？只列出 ≥ 2 人的城市。',
  4: '每位使用者的名字 + 訂單數，沒下單的人也要出現（顯示 0）。',
  5: '找出高於平均訂單金額的訂單，並顯示下單者名字（子查詢 + JOIN）。',
  6: '為 order_items(product_id) 建立索引，用 EXPLAIN 證明查詢有走索引。',
  7: '★ 第一週 Boss：同事的 15 題測驗 ≥ 12 分，且 10 句實用查詢全部在 psql 跑通。',
  8: '把一張多值欄位的壞表拆成兩張表，寫出 DDL 並說明原因。',
  9: '★ 同事的 15 題測驗滿分（解鎖隱藏關 Extra）。',
  10: '交出完整寵物營養 ER 圖（≥ 6 張表）＋ 可在 psql 跑通的 DDL。',
  11: '在乾淨的資料庫用 migrate + seed 完整重建，TablePlus 看到所有表和資料。',
  12: '交出一段 N+1 程式碼和修正版，並解釋差異。',
  13: '交出一頁設計文件（Schema、ER、正規化理由、索引策略）。',
  14: '★ 最終 Boss：同事的 15 題測驗 ≥ 12 分，且寵物營養資料庫 v1 交付（Git repo + README）。',
  15: '用自己的話區分「還沒正規化」與「刻意反正規化」，並各舉一例。',
}

export function stageMeta(stageId: number): StageMeta {
  return {
    id: stageId,
    world: WORLDS.find((w) => w.stageIds.includes(stageId))?.id ?? 0,
    lessons: lessons[stageId] ?? [],
    boss: bossByStage[stageId] ?? '',
    isBigBoss: BOSS_STAGE_IDS.includes(stageId),
  }
}

export function allLessons(): Lesson[] {
  return Object.values(lessons).flat()
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
  { id: 'first-select', label: '人生第一句 SQL', command: 'SELECT * FROM users;', hint: '看到 10 個人的名單 → 關 0 過關，+30 XP。截圖給老師！' },
  { id: 'tableplus', label: '（晚點做）安裝 TablePlus，用這些資料連線', hint: 'Host 127.0.0.1｜Port 5432｜User postgres｜Password secret｜Database learning_db' },
  { id: 'dev', label: '（可選）讓這個學習 App 在瀏覽器跑起來', command: 'npm run dev', hint: '在 sql-learning 資料夾裡執行，然後打開它顯示的網址。' },
]
