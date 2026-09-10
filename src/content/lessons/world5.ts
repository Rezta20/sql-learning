import type { Exercise, Lesson } from '../../types'

/**
 * 世界 5「落地」：關 11、12、13、14，加隱藏關 15。
 * 這裡開始用 Node.js + Prisma；DATABASE_URL 指向關 0 的 Docker PostgreSQL：
 * postgresql://postgres:secret@localhost:5432/learning_db
 */
export const world5: Record<number, Lesson[]> = {
  11: [
    {
      id: '11-1',
      title: 'Prisma 初始化與第一個 migration',
      focus: 'Migration = 資料庫的版本紀錄',
      check: 'prisma migrate dev 跑完，TablePlus 看到新表',
      concept: 'Migration 是資料庫的版本紀錄。Prisma 用 schema.prisma 描述表，再生成 SQL。',
      explain: [
        'Migration｜資料庫版本紀錄：每次改結構就多一個 SQL 檔，照順序跑一遍就能在任何電腦重建。像 git commit 但對象是資料庫結構。',
        'schema.prisma｜Prisma 的設計圖檔：用文字寫 model（= 表）和欄位，Prisma 幫你翻成 CREATE TABLE。',
        'Seed｜練習資料：表建好後灌進去的假資料。',
        '指令只有三個：npx prisma init（生設定檔）→ 寫 model → npx prisma migrate dev --name init（生 SQL 並執行）。',
        '.env 裡的 DATABASE_URL 要指到 Docker 那台：postgresql://postgres:secret@localhost:5432/learning_db',
      ],
      cards: [52, 53, 54],
      exercises: [
        {
          task: '在一個新資料夾（例如 ~/pet-db）執行：npm init -y && npm install prisma @prisma/client && npx prisma init   然後把 .env 的 DATABASE_URL 改成 postgresql://postgres:secret@localhost:5432/learning_db',
          hint: '三個指令用 && 串起來一次跑。.env 用 Cursor 打開改。',
          expect: '資料夾裡多了 prisma/schema.prisma 和 .env。schema.prisma 裡 provider 是 "postgresql"。',
          answer: 'npm init -y && npm install prisma @prisma/client && npx prisma init\n# .env\nDATABASE_URL="postgresql://postgres:secret@localhost:5432/learning_db"',
          pitfalls: ['npm: command not found → 開新的終端機視窗（nvm 還沒載入）。', 'OrbStack 沒開 → 之後 migrate 會連不上 5432。'],
        },
        {
          task: '在 schema.prisma 寫 model Owner { id Int @id @default(autoincrement())  name String  email String @unique  createdAt DateTime @default(now()) }',
          hint: '每個欄位一行：欄名 型別 @修飾。Int + @id + autoincrement = SERIAL PRIMARY KEY。',
          expect: 'schema.prisma 底部有一段 model Owner {...}，4 個欄位。存檔沒有紅字。',
          answer: 'model Owner {\n  id        Int      @id @default(autoincrement())\n  name      String\n  email     String   @unique\n  createdAt DateTime @default(now())\n}',
        },
        {
          task: 'npx prisma migrate dev --name init   然後在 TablePlus（或 psql \\dt）看到新表。',
          hint: '它會問要不要建立資料庫之類的問題，按 Enter 就好。',
          expect: '終端機出現 "Your database is now in sync with your schema"。prisma/migrations/ 多一個資料夾，裡面 migration.sql 是 CREATE TABLE "Owner"。psql \\dt 會看到 Owner 和 _prisma_migrations。',
          answer: 'npx prisma migrate dev --name init',
          pitfalls: ["Can't reach database server at localhost:5432 → OrbStack 沒開或容器沒 start：docker start learning-pg。"],
        },
      ],
      project: {
        task: '把你的 owners、pets 寫成 Prisma model 並 migrate（先不寫關聯，下一關做）。',
        hint: 'Pet 有 id、name、species、birthDate DateTime?（問號 = 可以空）、ownerId Int。',
        expect: 'schema.prisma 有 Owner 和 Pet 兩個 model；migrate dev --name add_pet 成功；\\dt 看到 Pet 表。',
        answer: 'model Pet {\n  id        Int       @id @default(autoincrement())\n  name      String\n  species   String\n  birthDate DateTime?\n  ownerId   Int\n}',
      },
      teachKeys: ['migration 是結構的版本紀錄', 'schema.prisma 描述表', 'migrate dev 生 SQL 並執行'],
    },
    {
      id: '11-2',
      title: '變更、還原、重建',
      focus: '改結構就開一支新 migration；新環境靠 migrate + seed 重建',
      check: 'prisma migrate reset 後資料完整回來',
      concept: '改結構要再開一支新 migration，不改舊檔。新環境跑 migrate + seed 就能完整重建。',
      explain: [
        '鐵律：舊的 migration 檔永遠不改。要加欄就改 schema.prisma，再 migrate dev --name 描述，會多一支新檔。',
        'prisma migrate reset｜砍掉重練：把資料庫清空、照順序跑所有 migration、再跑 seed。用來證明「別台電腦也能重建」。',
        'Seed 腳本放 prisma/seed.ts（或 .js），在 package.json 加 "prisma": { "seed": "node prisma/seed.js" }。',
        '流程圖：改 schema → migrate dev → 檢查 → 需要假資料就 seed。',
      ],
      cards: [],
      exercises: [
        {
          task: '在 model Owner 加一欄 city String?，跑 npx prisma migrate dev --name add_owner_city',
          hint: '問號代表可為空，加欄到既有表時一定要可為空或有預設值。',
          expect: 'prisma/migrations/ 多第二個資料夾，裡面是 ALTER TABLE "Owner" ADD COLUMN "city" TEXT。',
          answer: 'model Owner { … city String? }\nnpx prisma migrate dev --name add_owner_city',
        },
        {
          task: '寫 prisma/seed.js 灌入 2 個 owner，在 package.json 加 "prisma": { "seed": "node prisma/seed.js" }，然後 npx prisma db seed',
          hint: 'seed.js 用 new PrismaClient() 然後 await prisma.owner.createMany({ data: [...] })。',
          expect: '終端機顯示 seed 成功；psql SELECT * FROM "Owner"; 有 2 列（Prisma 表名有大寫，psql 要加雙引號）。',
          answer:
            "// prisma/seed.js\nconst { PrismaClient } = require('@prisma/client')\nconst prisma = new PrismaClient()\nasync function main() {\n  await prisma.owner.createMany({ data: [{ name: 'Sasha', email: 'sasha@example.com', city: 'Taipei' }, { name: 'Amy', email: 'amy@example.com' }] })\n}\nmain().finally(() => prisma.$disconnect())",
        },
        {
          task: 'npx prisma migrate reset   觀察它從頭重建（會問你確定嗎，輸入 y）。',
          hint: '這會清空資料庫！練習庫沒關係。它會自動跑 seed。',
          expect: '看到它 drop、apply 2 支 migration、然後 "Running seed command"。SELECT * FROM "Owner"; 還是 2 列。',
          answer: 'npx prisma migrate reset',
          pitfalls: ['reset 也會把關 0 匯入的 users、products 等表清掉。要再用就重跑關 0 第 5 步的匯入指令。'],
        },
      ],
      project: {
        task: '為你的專案寫 seed：2 個飼主、3 隻寵物、10 筆體重紀錄（先在 schema 加 model WeightLog）。',
        hint: 'WeightLog：id、petId Int、weightKg Decimal 或 Float、measuredAt DateTime。先 migrate 再改 seed。',
        expect: 'migrate reset 後三張表都有資料：Owner 2、Pet 3、WeightLog 10。',
        answer: 'model WeightLog {\n  id         Int      @id @default(autoincrement())\n  petId      Int\n  weightKg   Float\n  measuredAt DateTime\n}\n// seed 用 createMany 各灌一批',
      },
      teachKeys: ['舊 migration 不改，開新的', 'reset = 清空重跑全部 + seed', '新環境靠 migrate + seed'],
    },
  ],
  12: [
    {
      id: '12-1',
      title: 'ORM 關聯',
      focus: 'hasMany／belongsTo 是一對多的兩個方向',
      check: '用 include 一次撈出使用者和他的訂單',
      concept: 'hasMany／belongsTo 是 1 對多的兩個方向。Prisma 用 @relation。',
      explain: [
        'ORM（Object-Relational Mapping）｜物件關聯對應：用 JS 物件操作表，Prisma 幫你寫 SQL。',
        'hasMany／belongsTo｜有很多／屬於：Owner hasMany Pet（pets Pet[]）；Pet belongsTo Owner（owner Owner @relation(fields: [ownerId], references: [id])）。',
        '這兩行就是 ER 圖上的那條線。fields 是 FK 欄、references 是對方的 PK。',
        'include: { pets: true }｜一次撈齊：查飼主時把他的寵物一起帶回來，Prisma 會幫你 JOIN。',
        '對照：Laravel Eloquent 是 hasMany()／belongsTo()，Prisma 是 [] 和 @relation。',
      ],
      cards: [55, 56],
      exercises: [
        {
          task: '在 schema.prisma 把 Owner 加 pets Pet[]，Pet 加 owner Owner @relation(fields: [ownerId], references: [id])，跑 migrate dev --name relate_pet_owner',
          hint: '兩邊都要寫：Owner 那邊是陣列，Pet 那邊是單一物件 + @relation。',
          expect: 'migration.sql 裡有 ALTER TABLE "Pet" ADD CONSTRAINT … FOREIGN KEY ("ownerId") REFERENCES "Owner"("id")。',
          answer: 'model Owner {\n  …\n  pets Pet[]\n}\nmodel Pet {\n  …\n  ownerId Int\n  owner   Owner @relation(fields: [ownerId], references: [id])\n}',
          pitfalls: ['已有 Pet 資料但 ownerId 指到不存在的 Owner → migrate 會失敗。先 reset 再 seed。'],
        },
        {
          task: '寫一個 test.js：const owners = await prisma.owner.findMany({ include: { pets: true } }); console.log(JSON.stringify(owners, null, 2))',
          hint: 'include 放在 findMany 的物件裡。',
          expect: '印出每個 owner，裡面有 pets 陣列，Sasha 的 pets 有你 seed 的那幾隻。',
          answer: "const { PrismaClient } = require('@prisma/client')\nconst prisma = new PrismaClient()\nprisma.owner.findMany({ include: { pets: true } }).then((r) => console.log(JSON.stringify(r, null, 2))).finally(() => prisma.$disconnect())",
        },
        {
          task: '寫 4 組對照表：Node.js→Prisma、PHP／Laravel→Eloquent、Python→Django ORM、Ruby→ActiveRecord，各寫「一對多怎麼宣告」。',
          hint: '重點是「概念一樣，語法不同」，不用會寫，抄下來就好。',
          expect: '4 行，每行有 hasMany 對應的寫法。',
          answer: 'Prisma：pets Pet[] / owner Owner @relation　Eloquent：hasMany(Pet::class) / belongsTo(Owner::class)　Django：ForeignKey(Owner)（反向自動 owner.pet_set）　ActiveRecord：has_many :pets / belongs_to :owner',
        },
      ],
      project: {
        task: 'Owner hasMany Pet、Pet hasMany WeightLog，用 Prisma 寫出來並 migrate。',
        hint: 'WeightLog 加 pet Pet @relation(fields: [petId], references: [id])；Pet 加 weightLogs WeightLog[]。',
        expect: '兩條線都在 schema 裡；migrate 成功；\\d "WeightLog" 有 FK 到 Pet。',
        answer: 'model Pet {\n  …\n  weightLogs WeightLog[]\n}\nmodel WeightLog {\n  …\n  petId Int\n  pet   Pet @relation(fields: [petId], references: [id])\n}',
      },
      teachKeys: ['hasMany 是陣列、belongsTo 是 @relation', 'fields 是 FK、references 是 PK', 'include 一次撈齊'],
    },
    {
      id: '12-2',
      title: 'N+1 與預先載入',
      focus: 'N+1 = 多跑 N 次查詢；include 一次撈齊',
      check: '寫出一段 N+1 和它的修正版',
      concept: '先查 N 隻寵物、再各查一次飼主 = N+1 次。include 一次撈齊。',
      explain: [
        'N+1 problem｜多一次查詢問題：先 1 次查所有寵物（N 隻），再在迴圈裡每隻查 1 次飼主 → 1 + N 次查詢。100 隻就 101 次。',
        'Eager loading｜預先載入：include 讓 Prisma 一次把關聯撈齊（1～2 次查詢），解 N+1。',
        'Lazy loading｜用到才載入：需要時才查。方便但容易掉進 N+1。',
        '怎麼抓：在 PrismaClient 開 log: ["query"]，數終端機印出幾句 SQL。',
        '對照：Laravel 是 with(\'owner\')，Prisma 是 include: { owner: true }。',
      ],
      cards: [57, 58],
      exercises: [
        {
          task: '故意寫一段 N+1：const pets = await prisma.pet.findMany(); for (const p of pets) { const o = await prisma.owner.findUnique({ where: { id: p.ownerId } }) }   PrismaClient 開 log: ["query"]。',
          hint: 'new PrismaClient({ log: ["query"] })。',
          expect: '終端機印出 1 句 SELECT "Pet" + N 句 SELECT "Owner"（3 隻寵物就是 4 句）。',
          answer: "const prisma = new PrismaClient({ log: ['query'] })\nconst pets = await prisma.pet.findMany()\nfor (const p of pets) {\n  const o = await prisma.owner.findUnique({ where: { id: p.ownerId } })\n}",
        },
        {
          task: '改成 prisma.pet.findMany({ include: { owner: true } })，比較查詢次數。',
          hint: '刪掉迴圈裡的查詢，用 p.owner 直接拿。',
          expect: '終端機只剩 2 句 SQL（一句 Pet、一句 Owner WHERE id IN (…)），不管幾隻寵物都是 2 句。',
          answer: "const pets = await prisma.pet.findMany({ include: { owner: true } })\nfor (const p of pets) console.log(p.name, p.owner.name)",
        },
        {
          task: "寫下 Laravel 的對應寫法：Pet::with('owner')->get()，並用一句話說它跟 include 是同一件事。",
          hint: 'with = include。',
          expect: '一行 PHP、一句中文：「都是先把關聯一次撈齊，避免迴圈裡再查」。',
          answer: "Pet::with('owner')->get();   // 同 Prisma 的 include: { owner: true }，都是 eager loading。",
        },
      ],
      project: {
        task: '寫一段「所有飼主 → 每隻寵物 → 最新體重」一次撈齊的 Prisma 查詢。',
        hint: 'include 可以巢狀；最新一筆用 orderBy + take: 1。',
        expect: '一個 findMany，include 兩層，終端機 SQL 不超過 3～4 句。',
        answer: "prisma.owner.findMany({\n  include: {\n    pets: {\n      include: {\n        weightLogs: { orderBy: { measuredAt: 'desc' }, take: 1 },\n      },\n    },\n  },\n})",
      },
      teachKeys: ['迴圈裡查 = N+1', 'include 一次撈齊', '開 query log 數句數'],
    },
  ],
  13: [
    {
      id: '13-1',
      title: '設計審查',
      focus: '用 1NF、2NF、FK、索引四個問題檢查一張表',
      check: '對自己的專案列出 3 個改善點',
      concept: '拿一張舊表，用 1NF、2NF、FK、索引四個問題檢查它。',
      explain: [
        '四個問題，每張表問一遍：① 有沒有一格多值？（1NF）② 有沒有欄位只靠一半主鍵？（2NF）③ 每條線都有 FK 嗎？④ 常查的欄有索引嗎？',
        'ON DELETE CASCADE｜連帶刪除：刪飼主時他的寵物一起刪。方便但危險：刪錯一個父列會帶走一堆子列。',
        '什麼時候用：子資料「離開父就沒意義」（order_items 離開 orders）→ 可以 CASCADE。寵物離開飼主還有意義 → 不要，改成 RESTRICT 或先轉移。',
        '審查結果寫成一頁：表名｜問題｜改法。',
      ],
      cards: [59],
      exercises: [
        {
          task: "找一張你以前設計過（或同事給的）表，檢查：有多值欄嗎？有部分依賴嗎？沒有的話用這張：members(id, name, phones='0912,0933', plan_name, plan_price, vendor_ids='3,5')。",
          hint: '逗號 = 1NF 問題；plan_price 只靠 plan_name = 2NF 問題。',
          expect: 'phones、vendor_ids 違反 1NF；plan_price 跟著 plan_name 走（該搬去 plans 表）。',
          answer: 'phones → member_phones(member_id, phone)；vendor_ids → member_vendors(member_id, vendor_id)；plan_name/plan_price → plans(id, name, price)，members 放 plan_id FK。',
        },
        {
          task: '列出至少 3 個改善點，格式：表名｜問題｜改法。',
          hint: '從上一題的發現直接寫。',
          expect: '≥ 3 行，每行三段。',
          answer: 'members｜phones 多值｜拆 member_phones　members｜plan_price 部分依賴｜拆 plans　members｜vendor_ids 多值且是多對多｜拆 member_vendors 中間表',
        },
        {
          task: '補上缺的 FK 或索引，決定哪裡該用 ON DELETE CASCADE。',
          hint: 'member_phones 離開 member 沒意義 → CASCADE。plans 被 members 指著 → 不能 CASCADE（刪方案不該刪會員）。',
          expect: 'member_phones.member_id REFERENCES members(id) ON DELETE CASCADE；members.plan_id REFERENCES plans(id)（預設 RESTRICT）；索引在 member_phones(member_id)。',
          answer: 'CREATE TABLE member_phones (id SERIAL PRIMARY KEY, member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE, phone VARCHAR(20));\nCREATE INDEX idx_member_phones_member_id ON member_phones(member_id);',
        },
      ],
      project: {
        task: '審查你自己的寵物營養 DB，寫一頁設計文件：Schema、ER、正規化理由、索引策略。',
        hint: '四個小標題各 3～5 行。ER 圖貼 10-1 那張。',
        expect: '一頁文件有 4 個標題；索引策略至少列 2 個索引和原因；有一句關於 CASCADE 的決定。',
        answer: '範例段落：「weight_logs.pet_id ON DELETE CASCADE：體重紀錄離開寵物沒有意義。pets.owner_id 不 CASCADE：刪飼主前要先轉移寵物。索引：weight_logs(pet_id, measured_at) 因為最常查某隻寵物最新體重。」',
      },
      teachKeys: ['四個問題：1NF、2NF、FK、索引', 'CASCADE 只給離開父就沒意義的子表', '寫成表名｜問題｜改法'],
    },
  ],
  14: [
    {
      id: '14-1',
      title: '最終驗收：交出你的 side project 資料庫',
      focus: '交出自己的資料庫 v1',
      check: 'Git repo 有 README、ER 圖、10 句查詢',
      concept: '≥ 6 張表、達 2NF、10 句常用查詢、EXPLAIN 檢查、migration + seed、README。',
      explain: [
        '這關沒有新東西，是把 14 關的成果收進一個 repo。',
        'README 結構：專案一句話 → ER 圖 → 表格說明（每表一行）→ 怎麼跑（migrate + seed）→ 10 句常用查詢 → 學習回顧。',
        '檢查清單：≥ 6 張表、每條線有 FK、沒有多值欄、沒有部分依賴、常查欄有索引。',
        '完成後你就有一個可以放在履歷上的東西。',
      ],
      cards: [],
      exercises: [
        {
          task: '確認你的寵物營養 DB ≥ 6 張表、PK／FK 完整：psql \\dt 和每張 \\d 截圖。',
          hint: '用 13-1 的四個問題再掃一次。',
          expect: '\\dt ≥ 6 張你的表；每張有 PRIMARY KEY；有 FK 的表在 Foreign-key constraints 看得到。',
          answer: '\\dt\n\\d pets\n\\d weight_logs …',
        },
        {
          task: '寫 10 句常用查詢（含 JOIN、GROUP BY、子查詢），用 EXPLAIN 檢查 2 句。',
          hint: '7-2 專案題的 5 句 + 再想 5 句 App 會用到的。',
          expect: '10 句都跑通；2 句 EXPLAIN 的結果貼在 README，說出是 Seq Scan 還是 Index Scan、為什麼。',
          answer: '參考 7-2 專案題；再加：某飼主所有寵物的最新體重、某病歷的寵物名單、每種飼料被幾隻寵物吃、體重上升超過 10% 的寵物、沒有飲食需求紀錄的寵物。',
        },
        {
          task: '整理成 Git repo：README、ER 圖（拍照或 mermaid）、範例查詢、100～200 字學習回顧。',
          hint: 'git init → 加 prisma/、README.md、queries.sql → commit → push 到 GitHub。',
          expect: 'GitHub 上看得到 README 有 ER 圖和 10 句查詢；prisma/migrations 在 repo 裡。',
          answer: 'README.md 目錄：## 專案 / ## ER 圖 / ## 表格 / ## 怎麼跑 / ## 常用查詢 / ## 學習回顧',
        },
      ],
      project: {
        task: '這關的專案題就是全部：交付寵物營養資料庫 v1。',
        hint: '把上面三題的成果放進同一個 repo。',
        expect: 'repo 網址可以打開；README 第一屏看得到 ER 圖。',
        answer: '沒有標準答案。checklist 全勾就是 v1。',
      },
      teachKeys: ['≥ 6 張表、達 2NF', 'migration + seed 能重建', 'README 有 ER 圖和 10 句查詢'],
    },
  ],
  15: [
    {
      id: '15-1',
      title: '反正規化：刻意的冗餘',
      focus: '正規化之後，才「刻意」複製資料',
      check: '講出快照單價和商品現價為什麼能同時存在',
      concept: '先正規化，再為了讀取速度故意複製資料，並寫清楚誰是來源、怎麼同步。',
      explain: [
        'Denormalization｜反正規化：已經做到 2NF 之後，為了「讀得快」或「留住歷史」故意重複存一點資料。',
        '例子：order_items.price 是「下單當時的價格」（快照），products.price 是「現在的價格」。兩個都要，因為商品會漲價但舊訂單金額不能變。',
        '另一種：orders.total_amount 是算出來的（SUM(quantity*price)），存起來是為了列表不用每次 JOIN 加總。',
        '規則：寫清楚「誰是來源、什麼時候同步」。沒有規則的重複 = bug 溫床。',
        '「還沒正規化」是不小心重複；「反正規化」是想清楚才重複。',
      ],
      cards: [60],
      exercises: [
        {
          task: '解釋 order_items.price 和 products.price 為什麼可以同時存在。用 SQL 證明：SELECT oi.order_id, p.name, oi.price AS then_price, p.price AS now_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.price <> p.price;',
          hint: '找「當時價格 ≠ 現在價格」的列。',
          expect: '3 列：order 4 Rain Gloves G2（300 vs 900）、order 6 Rain Gloves G2（300 vs 900）、order 8 Rain Gloves G2（500 vs 900）。這就是價格變過的證據。',
          answer: 'order_items.price 是快照（歷史），products.price 是現價。來源：下單當下複製 products.price；之後永不同步。',
        },
        {
          task: '為訂單模型列 2 個可考慮的冗餘欄位，寫更新策略。',
          hint: 'orders.total_amount 已經是一個。再想「列表頁常顯示但要 JOIN 才拿到」的東西。',
          expect: '2 個欄位，各一句「什麼時候更新」。',
          answer: 'orders.total_amount：order_items 增刪改時重算。orders.item_count：同上。users.order_count：每次建訂單 +1（或用排程重算）。',
        },
        {
          task: '寫 3 個不該反正規化的理由。',
          hint: '想「重複之後會發生什麼壞事」。',
          expect: '3 句。',
          answer: '① 兩處不一致時不知道信哪個。② 每次改都要記得同步，忘了就是 bug。③ 資料量小、查詢不慢時根本不需要，先正規化就夠。',
        },
      ],
      project: {
        task: 'pets 表要不要放 latest_weight_kg 快取欄？寫出要／不要的理由和同步策略。',
        hint: '列表頁要顯示最新體重，每次 JOIN + ORDER BY + LIMIT 1 很煩；但體重一新增就要同步。',
        expect: '一個決定 + 一句理由 + 一句同步策略（例如「新增 weight_log 時同時 UPDATE pets.latest_weight_kg」）。',
        answer: '可以放，理由：列表頁最常用。同步：新增 weight_log 的同一個 transaction 裡 UPDATE pets SET latest_weight_kg = …。來源永遠是 weight_logs，快取欄壞了可以重算。',
      },
      teachKeys: ['先正規化再刻意重複', '寫清楚來源與同步時機', '快照 vs 現價'],
    },
  ],
}

export const world5Boss: Record<number, Exercise> = {
  11: {
    task: '在乾淨的資料庫用 migrate + seed 完整重建，TablePlus 看到所有表和資料。',
    hint: 'npx prisma migrate reset 就是「乾淨重建」。',
    expect: 'reset 後 \\dt 看到 Owner、Pet、WeightLog、_prisma_migrations；每張表都有 seed 的資料。',
    answer: 'npx prisma migrate reset',
  },
  12: {
    task: '交出一段 N+1 程式碼和修正版，並解釋差異。',
    hint: '12-2 第 1、2 題貼在一起，加一句「查詢次數從 N+1 變 2」。',
    expect: '兩段程式碼、兩個數字（例如 4 句 vs 2 句）、一句解釋。',
    answer: '參考 12-2 第 1、2 題。差異：迴圈裡查 vs include 一次撈齊。',
  },
  13: {
    task: '交出一頁設計文件（Schema、ER、正規化理由、索引策略）。',
    hint: '13-1 專案題就是這份。',
    expect: '4 個標題都有內容；提到至少一個 CASCADE 決定和兩個索引。',
    answer: '沒有標準答案。四段齊全就過。',
  },
  14: {
    task: '★ 最終 Boss：同事的 15 題測驗 ≥ 12 分，且寵物營養資料庫 v1 交付（Git repo + README）。',
    hint: '先考測驗，再確認 repo 網址打得開。',
    expect: '測驗 ≥ 12/15；repo README 有 ER 圖、10 句查詢、怎麼跑。',
    answer: '沒有標準答案。兩個條件達成就是畢業。',
  },
  15: {
    task: '用自己的話區分「還沒正規化」與「刻意反正規化」，並各舉一例。',
    hint: '差別在「有沒有想清楚、有沒有寫下來源和同步規則」。',
    expect: '兩句定義 + 兩個例子。',
    answer: "還沒正規化：pets.diseases = '糖尿病,腎病'（不小心塞一格）。刻意反正規化：pets.latest_weight_kg（來源是 weight_logs，新增時同步）。",
  },
}
