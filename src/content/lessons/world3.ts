import type { Exercise, Lesson } from '../../types'

/**
 * 世界 3「跑得快」：關 6、7。
 * 練習表只有 8～10 列，資料庫會覺得「整本翻比查目錄快」，所以索引課先用 generate_series 做一張 10 萬列的大表。
 */
export const world3: Record<number, Lesson[]> = {
  6: [
    {
      id: '6-1',
      title: 'INDEX 與 EXPLAIN',
      focus: '索引 = 目錄；EXPLAIN 看它有沒有被用到',
      check: 'EXPLAIN 一句查詢，說出它是 Index Scan 還是 Seq Scan',
      concept: '索引是書的目錄。EXPLAIN 讓資料庫告訴你它打算怎麼找。',
      explain: [
        'INDEX｜索引：書的目錄。沒目錄要整本翻（Seq Scan），有目錄直接翻到那頁（Index Scan）。',
        'EXPLAIN 你的查詢;｜看執行計畫：資料庫先不跑，只告訴你「打算怎麼找」。',
        '看關鍵字就好：Seq Scan = 整本翻；Index Scan／Bitmap Index Scan = 用了目錄。',
        '小表（10 列）資料庫會直接整本翻，因為比查目錄快。所以我們先做一張 10 萬列的表來看差別。',
        'UNIQUE INDEX｜唯一索引：既是目錄又保證不重複。PK 本身就是一個。',
      ],
      cards: [39, 40, 41],
      exercises: [
        {
          task: "CREATE TABLE big_orders AS SELECT g AS id, (g % 1000) + 1 AS user_id, NOW() - (g || ' minutes')::interval AS created_at FROM generate_series(1, 100000) AS g;   然後 EXPLAIN SELECT * FROM big_orders WHERE user_id = 7;",
          hint: '第一句會跑幾秒做出 10 萬列。第二句最前面加 EXPLAIN，結尾一樣要分號。',
          expect: '第一句回 SELECT 100000。EXPLAIN 第一行是 Seq Scan on big_orders（整本翻，因為還沒有目錄）。',
          answer: 'EXPLAIN SELECT * FROM big_orders WHERE user_id = 7;   → Seq Scan on big_orders',
        },
        {
          task: 'CREATE INDEX idx_big_orders_user_id ON big_orders(user_id);   然後再 EXPLAIN 同一句。',
          hint: 'CREATE INDEX 名字 ON 表(欄)。名字習慣叫 idx_表_欄。',
          expect: '回 CREATE INDEX。再 EXPLAIN 會看到 Bitmap Index Scan on idx_big_orders_user_id（或 Index Scan）。cost 從 1496 左右降到 600 多。',
          answer: 'CREATE INDEX idx_big_orders_user_id ON big_orders(user_id);\nEXPLAIN SELECT * FROM big_orders WHERE user_id = 7;   → Bitmap Index Scan on idx_big_orders_user_id',
        },
        {
          task: '\\d big_orders   看表的 Indexes 段；再 \\d orders 看原本練習表有哪幾個索引。',
          hint: '\\d 表名，最下面 Indexes: 那幾行。',
          expect: 'big_orders 有 idx_big_orders_user_id。orders 有 orders_pkey（PK 自帶的唯一索引）和 idx_orders_user_created_at。',
          answer: '\\d orders → Indexes: "orders_pkey" PRIMARY KEY, "idx_orders_user_created_at" btree (user_id, created_at)',
        },
      ],
      project: {
        task: 'weight_logs 最常用 pet_id + measured_at 查（某隻寵物最新幾筆）。寫出那一行 CREATE INDEX。',
        hint: '兩欄一起放進括號，常當 WHERE 的放前面。',
        expect: 'CREATE INDEX idx_weight_logs_pet_measured ON weight_logs(pet_id, measured_at);',
        answer: 'CREATE INDEX idx_weight_logs_pet_measured ON weight_logs(pet_id, measured_at);',
      },
      teachKeys: ['索引是目錄', 'EXPLAIN 看 Seq Scan 或 Index Scan', '加在常拿來 WHERE／JOIN 的欄'],
    },
    {
      id: '6-2',
      title: '索引失效的三個原因',
      focus: '三種寫法會讓索引失效',
      check: '講出三個原因，各舉一句 SQL',
      concept: '對欄位套函數、LIKE 開頭 %、型別不一致，索引就用不到。',
      explain: [
        'Index not used｜索引失效：有目錄，但你的寫法讓資料庫沒辦法用它。',
        '① 對欄位套函數：LOWER(email) = … → 目錄是照 email 排的，不是照 LOWER(email)。',
        "② LIKE 開頭是 %：'%77' → 不知道從目錄哪一頁開始翻。",
        "③ 型別不一致：user_id::text = '7' → 欄位被轉成文字，目錄是數字的。",
        '口訣：「欄位保持原樣放在左邊」，索引才用得到。',
      ],
      cards: [42],
      exercises: [
        {
          task: "CREATE TABLE big_users AS SELECT g AS id, 'user' || g || '@example.com' AS email FROM generate_series(1, 100000) AS g;   CREATE INDEX idx_big_users_email ON big_users(email);   然後 EXPLAIN SELECT * FROM big_users WHERE LOWER(email) = 'user77@example.com';",
          hint: '三句分開打。最後的 EXPLAIN 看第一行。',
          expect: "Seq Scan on big_users，Filter: (lower(email) = …)。對照組：EXPLAIN … WHERE email = 'user77@example.com'; 會是 Bitmap Index Scan。",
          answer: "LOWER(email) 讓索引失效。要不分大小寫又想用索引：存進去時就轉小寫，或建 CREATE INDEX … ON big_users(LOWER(email));",
        },
        {
          task: "EXPLAIN SELECT * FROM big_users WHERE email LIKE '%77@example.com';",
          hint: '% 在最前面。',
          expect: "Seq Scan on big_users，Filter: (email ~~ '%77@example.com')。~~ 就是 LIKE。",
          answer: "開頭 % 的 LIKE 一定整本翻。真的需要「含有」搜尋要用全文檢索或 pg_trgm，先知道就好。",
        },
        {
          task: "EXPLAIN SELECT * FROM big_orders WHERE user_id::text = '7';",
          hint: '把數字欄轉成文字再比。',
          expect: "Seq Scan on big_orders，Filter: ((user_id)::text = '7')。對照 WHERE user_id = 7 是 Bitmap Index Scan。",
          answer: '欄位型別要保持原樣：WHERE user_id = 7。程式裡傳參數時，數字就傳數字，不要傳字串。',
          pitfalls: ["直接寫 WHERE user_id = '7'（沒有 ::text）PostgreSQL 會自動把 '7' 轉成數字，索引還是用得到；真正出問題的是把「欄位」轉型。"],
        },
      ],
      project: {
        task: '列出你專案 3 個最常拿來查的欄位，判斷哪些值得加索引、哪些不值得。做完可以 DROP TABLE big_orders; DROP TABLE big_users; 收拾。',
        hint: '常出現在 WHERE／JOIN／ORDER BY 的欄值得；很少查、或表很小的不值得。',
        expect: '三個欄位各一行：欄名｜值得／不值得｜一句原因。',
        answer: 'pets.owner_id：值得（JOIN 用）。weight_logs.pet_id + measured_at：值得（最常查）。pets.name：不值得（少用來查、可能模糊搜尋）。',
      },
      teachKeys: ['套函數失效', 'LIKE 開頭 % 失效', '欄位轉型失效'],
    },
  ],
  7: [
    {
      id: '7-1',
      title: '匯出 schema、畫關係圖',
      focus: 'Schema 就是設計圖，可以存成 SQL 檔',
      check: '畫出五張表的關係圖，每條線標 1 或多',
      concept: 'Schema 是設計圖。把它存成 SQL 檔，任何電腦都能重建。',
      explain: [
        'Schema｜資料庫設計圖：有哪幾張表、每張表哪些欄、彼此怎麼連（FK）。',
        'pg_dump --schema-only｜只匯出設計圖不含資料：出來就是一堆 CREATE TABLE，存成 .sql 檔就能在別台電腦重建。',
        '五張練習表的線：users 1─< orders 1─< order_items >─1 products >─1 categories。',
        '每條線都是「1 對多」，叉子畫在放 FK 的那邊。',
        '怎麼畫：五個方框排成一排，照上面的順序連線。',
      ],
      cards: [43],
      exercises: [
        {
          task: '在終端機（不是 psql 裡）打：docker exec learning-pg pg_dump -U postgres -d learning_db --schema-only   看輸出。',
          hint: '如果你在 psql 裡，先 \\q 出來。',
          expect: '一長串文字，裡面有 5 個 CREATE TABLE、幾個 CREATE INDEX、和 ALTER TABLE … FOREIGN KEY。沒有 INSERT。',
          answer: 'docker exec learning-pg pg_dump -U postgres -d learning_db --schema-only > schema.sql   （加 > 就會存成檔案）',
        },
        {
          task: '在筆記本畫五張表的關係圖（users、categories、products、orders、order_items）。',
          hint: '先畫 5 個框，再找每張表的 FK 欄，一條 FK 一條線。',
          expect: '4 條線：orders.user_id→users、order_items.order_id→orders、order_items.product_id→products、products.category_id→categories。叉子都在 FK 那邊。',
          answer: 'users ─< orders ─< order_items >─ products >─ categories',
        },
        {
          task: '用自己的話說出每一條線是 1 對多還是多對多。',
          hint: '單看一條線都是 1 對多；orders 和 products 之間「透過 order_items」才是多對多。',
          expect: '四條線都是 1:N；orders↔products 是 N:M，靠 order_items 中間表。',
          answer: '每條 FK 線都是一對多。多對多（訂單↔商品）不能直接連，所以中間有 order_items。',
        },
      ],
      project: {
        task: '畫你的寵物營養 DB 全圖：owners、pets、weight_logs、medical_history、diet_needs、foods、food_types。',
        hint: '先問「誰屬於誰」：pets 屬於 owners；weight_logs、medical_history、diet_needs 都屬於 pets；foods 屬於 food_types。',
        expect: '7 個方框、至少 6 條線，每條線 FK 端有叉子，FK 欄名寫出來（owner_id、pet_id、food_type_id…）。',
        answer: 'owners ─< pets ─< weight_logs；pets ─< medical_history；pets ─< diet_needs；food_types ─< foods。（diet_needs 若要連 foods，就是 diet_needs.food_id → foods。）',
      },
      teachKeys: ['Schema 是設計圖', 'pg_dump --schema-only 匯出', '每條 FK 是一條 1 對多的線'],
    },
    {
      id: '7-2',
      title: '10 個實用查詢',
      focus: '把第一週學的混在一起用',
      check: '10 句查詢全部在 psql 跑通',
      concept: '把第一週的 CRUD、GROUP BY、JOIN、子查詢混在一起用。',
      explain: [
        '這課沒有新概念，是把工具箱裡的東西一次拿出來用。',
        '寫每一句之前先說一句中文：「我要從哪張表、留哪些列、看哪些欄、要不要分組」。',
        '卡住就回去看那一關的卡片，不要硬想。',
        '每一句跑出來的筆數先跟預期對，再看內容。',
      ],
      cards: [],
      exercises: [
        {
          task: "寫 4 句 CRUD（各一句）：① 新增一個分類 'Boots' ② 查它 ③ 把它改名 'Riding Boots' ④ 刪掉它。",
          hint: 'INSERT / SELECT … WHERE / UPDATE … WHERE / DELETE … WHERE。每句做完 SELECT 確認。',
          expect: 'INSERT 0 1 → 1 列 id 5 Boots → UPDATE 1 → DELETE 1，最後 categories 回到 4 列。',
          answer:
            "INSERT INTO categories (name) VALUES ('Boots');\nSELECT * FROM categories WHERE name = 'Boots';\nUPDATE categories SET name = 'Riding Boots' WHERE name = 'Boots';\nDELETE FROM categories WHERE name = 'Riding Boots';",
        },
        {
          task: '寫 3 句 GROUP BY／HAVING：① 每個 status 幾張訂單 ② 每個商品賣出幾件（order_items JOIN products，SUM(quantity)） ③ 只列賣出 ≥ 2 件的。',
          hint: '② 要先 JOIN 拿商品名再 GROUP BY p.name；③ 在 ② 後面加 HAVING。',
          expect: '① 4 列：cancelled 1、paid 5、pending 1、shipped 1。② 9 列，Rain Gloves G2 賣 4 件最多。③ 5 列（Rain Gloves G2 4、Leather Gloves G1 3、Bluetooth Headset B1 2、Full Face Helmet A1 2、Riding Jacket J1 2）。',
          answer:
            'SELECT status, COUNT(*) FROM orders GROUP BY status;\nSELECT p.name, SUM(oi.quantity) AS sold FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.name ORDER BY sold DESC;\nSELECT p.name, SUM(oi.quantity) AS sold FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.name HAVING SUM(oi.quantity) >= 2 ORDER BY sold DESC;',
        },
        {
          task: '寫 3 句 JOIN 或子查詢：① 每個分類有幾個商品（含 0 個的分類，用名字） ② 沒被買過的商品 ③ 買過 Helmets 分類商品的使用者名字。',
          hint: '① categories LEFT JOIN products；② NOT IN (SELECT product_id FROM order_items)；③ 子查詢串兩層或 JOIN 四張表。',
          expect: '① 4 列：Bluetooth Headsets 3、Gloves 2、Helmets 3、Jackets 2。② 1 列：Mesh Intercom X2。③ Alice Chen、David Liu、Grace Tsai（用 DISTINCT 去重後 3 列）。',
          answer:
            'SELECT c.name, COUNT(p.id) FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.name;\nSELECT name FROM products WHERE id NOT IN (SELECT product_id FROM order_items);\nSELECT DISTINCT u.name FROM users u JOIN orders o ON o.user_id = u.id JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id WHERE c.name = \'Helmets\';',
        },
      ],
      project: {
        task: '為你的寵物 DB 寫 5 句你「真的會用到」的查詢。',
        hint: '想 App 畫面：寵物列表、某隻寵物體重曲線、最新一筆體重、有病歷的寵物、某飼主的所有寵物。',
        expect: '5 句 SQL，至少 1 句 JOIN、1 句 ORDER BY … LIMIT、1 句 GROUP BY。',
        answer:
          'SELECT * FROM pets WHERE owner_id = 1;\nSELECT weight_kg, measured_at FROM weight_logs WHERE pet_id = 1 ORDER BY measured_at;\nSELECT weight_kg FROM weight_logs WHERE pet_id = 1 ORDER BY measured_at DESC LIMIT 1;\nSELECT p.name, COUNT(w.id) FROM pets p LEFT JOIN weight_logs w ON w.pet_id = p.id GROUP BY p.name;\nSELECT p.name, o.name AS owner FROM pets p JOIN owners o ON o.id = p.owner_id;',
      },
      teachKeys: ['先說中文再寫 SQL', '筆數先對再看內容', '卡住回去看卡片'],
    },
  ],
}

export const world3Boss: Record<number, Exercise> = {
  6: {
    task: '為 order_items(product_id) 建立索引，用 EXPLAIN 證明查詢有走索引。（練習表太小會整本翻，所以請用 big_orders 示範：為 big_orders(created_at) 建索引並證明。）',
    hint: 'CREATE INDEX → EXPLAIN SELECT … WHERE created_at > NOW() - interval \'1 day\'。',
    expect: 'EXPLAIN 出現 Index Scan 或 Bitmap Index Scan on idx_big_orders_created_at。順便也把 order_items 的索引建起來：CREATE INDEX idx_order_items_product_id ON order_items(product_id);',
    answer:
      "CREATE INDEX idx_big_orders_created_at ON big_orders(created_at);\nEXPLAIN SELECT * FROM big_orders WHERE created_at > NOW() - interval '1 day';\nCREATE INDEX idx_order_items_product_id ON order_items(product_id);",
  },
  7: {
    task: '★ 第一週 Boss：同事的 15 題測驗 ≥ 12 分（在「同事原版教材」頁），且 7-2 的 10 句實用查詢全部在 psql 跑通。',
    hint: '先做測驗，錯的題目看解析；再把 10 句從筆記本一句一句打進 psql。',
    expect: '測驗頁顯示 ≥ 12/15；10 句每句都有結果、沒有 ERROR。',
    answer: '沒有標準答案。兩個條件都達成就按「過關」。',
  },
}
