# 關聯式資料庫 14 天學習 checklist

每日建議投入 3 小時，目標是在 1 到 2 個工作周內，建立基本關聯式資料庫操作、設計與 1NF／2NF 正規化能力，達到初階全端工程師可用程度。[web:2][web:9]

## 使用方式

- [ ] 每天依序完成當日任務。
- [ ] 每天至少保留 30 分鐘整理筆記與 SQL 範例。
- [ ] 所有查詢盡量親手輸入，不只複製貼上。
- [ ] 每完成 3 天，回頭複習一次前面寫過的 SQL。
- [ ] 第 7 天與第 14 天做一次整體驗收。

## Day 1：DDL 與基本 CRUD

- [ ] 安裝並啟動 MySQL 或 PostgreSQL。
- [ ] 建立一個 `learning_db` 資料庫。
- [ ] 建立 `users` 資料表，至少包含 `id`、`name`、`email`、`created_at`。
- [ ] 建立 `products` 資料表，至少包含 `id`、`name`、`price`、`stock`、`created_at`。
- [ ] 各自新增至少 20 筆測試資料。
- [ ] 練習 `SELECT * FROM users` 與 `SELECT * FROM products`。
- [ ] 練習用 `WHERE` 篩選單筆或多筆資料。
- [ ] 練習 `UPDATE` 修改一筆商品價格。
- [ ] 練習 `DELETE` 刪除一筆測試資料。
- [ ] 用自己的話整理：主鍵、欄位型別、CRUD 分別是什麼。

## Day 2：過濾、排序、聚合

- [ ] 練習 `WHERE` 搭配 `=`, `<>`, `IN`, `BETWEEN`, `LIKE`。[web:2][web:4]
- [ ] 練習 `ORDER BY` 單欄與多欄排序。
- [ ] 練習 `LIMIT` 取前幾筆資料。
- [ ] 練習 `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` 聚合函數。[web:5][web:10]
- [ ] 查出價格介於某區間的商品。
- [ ] 查出名稱包含指定關鍵字的商品。
- [ ] 統計商品總數與平均價格。
- [ ] 嘗試統計某一天新增的使用者數量。
- [ ] 整理 5 個最常用的查詢模板到筆記。

## Day 3：GROUP BY 與 HAVING

- [ ] 建立 `orders` 資料表，至少包含 `id`、`user_id`、`total_amount`、`created_at`。
- [ ] 新增至少 30 筆訂單測試資料。
- [ ] 練習 `GROUP BY user_id` 統計每位使用者的訂單數量。[web:10][web:11]
- [ ] 練習統計每位使用者的訂單總金額。
- [ ] 練習 `HAVING` 篩選訂單總額大於指定值的使用者。
- [ ] 比較 `WHERE` 與 `HAVING` 的使用時機，寫成 3 句筆記。
- [ ] 自己寫出 3 題聚合查詢題並完成。

## Day 4：JOIN 基礎

- [ ] 建立 `order_items` 資料表，至少包含 `id`、`order_id`、`product_id`、`quantity`、`price`。
- [ ] 新增至少 50 筆訂單明細資料。
- [ ] 練習 `INNER JOIN` 串接 `orders` 與 `users`。[web:3][web:7]
- [ ] 練習 `INNER JOIN` 串接 `order_items` 與 `products`。
- [ ] 練習查出每張訂單包含哪些商品。
- [ ] 練習 `LEFT JOIN` 查出所有使用者，即使沒有訂單也要顯示。
- [ ] 理解查詢結果中的 `NULL` 為什麼會出現。
- [ ] 完成至少 5 題 JOIN 練習。

## Day 5：子查詢

- [ ] 練習 `IN` 子查詢找出有下過單的使用者。[web:3][web:5]
- [ ] 練習 `NOT IN` 或其他方式找出從未下單的使用者。
- [ ] 練習子查詢找出高於平均訂單金額的訂單。
- [ ] 練習把子查詢改寫成 JOIN，比較可讀性。
- [ ] 整理：什麼情況適合用子查詢，什麼情況適合用 JOIN。
- [ ] 自己寫出 3 題子查詢練習題並完成。

## Day 6：索引與查詢效能

- [ ] 了解主鍵索引、一般索引、唯一索引的差異。[web:10][web:11]
- [ ] 在 `orders(user_id, created_at)` 建立索引。
- [ ] 在 `order_items(order_id, product_id)` 建立索引。
- [ ] 用 `EXPLAIN` 觀察至少 2 個查詢的執行計畫。
- [ ] 比較加索引前後查詢差異。
- [ ] 整理 3 個常見索引失效原因，例如對欄位做函數處理、使用前置萬用字元、型別不一致。
- [ ] 整理：什麼情況不應該亂加索引。

## Day 7：第一週整合實作

- [ ] 建立一個最小可用的訂單系統資料模型：`users`、`products`、`orders`、`order_items`。
- [ ] 匯出目前的 Schema 或整理成一份 SQL 檔。
- [ ] 寫出至少 10 個實用查詢，包含 CRUD、GROUP BY、JOIN、子查詢。
- [ ] 用 Laravel 或 Yii 建立對應的 migration。[web:11]
- [ ] 用 Laravel Eloquent 或 Yii ActiveRecord 建立基本 model 關聯。
- [ ] 做一次自我驗收：哪些 SQL 還寫不順，列出補強清單。

## Day 8：1NF 基礎

- [ ] 理解 1NF 的核心：欄位值必須是原子值，不可有重複群組。[web:8][web:9][web:14]
- [ ] 準備一個未正規化範例，例如訂單表內把多個商品名稱放在同一欄位。
- [ ] 找出哪些欄位違反原子性。
- [ ] 把多值欄位拆成明細表，例如拆出 `order_items`。
- [ ] 寫下分解前後的 Schema 差異。
- [ ] 用自己的話解釋：為什麼拆完後比較符合關聯式設計。

## Day 9：2NF 基礎

- [ ] 理解 2NF 的核心：先符合 1NF，且非主鍵欄位必須完全依賴整個主鍵。[web:8][web:9][web:14]
- [ ] 建立一個複合主鍵範例，例如 `enrollments(student_id, course_id, instructor, instructor_phone, grade)`。
- [ ] 判斷哪些欄位只依賴部分主鍵。
- [ ] 將部分依賴欄位拆到新的資料表，例如拆出 `courses` 或 `instructors`。
- [ ] 寫出分解前後的函數依賴說明。
- [ ] 用自己的話整理：1NF 與 2NF 的差異。

## Day 10：ER 圖與 Schema 設計

- [ ] 以訂單系統為題，列出主要實體：使用者、商品、訂單、訂單明細、分類、地址。
- [ ] 畫出 ER 圖，標示 1 對多、多對多關係。
- [ ] 決定每張表的主鍵與外鍵。
- [ ] 決定必要索引欄位。
- [ ] 檢查是否還有多值欄位、重複資料或可拆出去的欄位。
- [ ] 讓 Schema 能直接對應成 SQL DDL。

## Day 11：Migration 與練習資料

- [ ] 用 Laravel 或 Yii migration 實作 Day 10 的 schema。[web:11]
- [ ] 建立練習資料，至少塞入 users、products、orders、order_items 的基本資料。
- [ ] 練習 migrate、rollback、重新 migrate。
- [ ] 做一次 schema 變更，例如新增 `coupon_code` 或 `status` 欄位。
- [ ] 確認在新環境可以完整重建資料庫。
- [ ] 整理 migration 命名與拆分策略。

## Day 12：ORM 關聯與 N+1

- [ ] 定義 model 關聯：User hasMany Orders、Order belongsTo User、Order hasMany OrderItems、OrderItem belongsTo Product。
- [ ] 用 ORM 撈出某位使用者與其所有訂單。
- [ ] 用 ORM 撈出某張訂單與其商品明細。
- [ ] 練習 eager loading，避免 N+1 查詢問題。
- [ ] 比較 lazy loading 與 eager loading 的差異。
- [ ] 記錄 1 個實際 N+1 範例與修正方式。

## Day 13：正規化複習與設計審查

- [ ] 回顧 1NF 與 2NF 定義，重新用自己的話寫一次。
- [ ] 找一個過去做過的資料表設計，檢查是否違反 1NF 或 2NF。
- [ ] 列出至少 3 個可以改善的地方。
- [ ] 補上缺少的外鍵、索引或拆表設計。
- [ ] 整理一份簡短設計文件，內容包含 Schema、ER 圖、正規化理由、索引策略。

## Day 14：最終驗收

- [ ] 完成一個小型專案資料庫設計，至少包含 6 張表。
- [ ] 確認資料表之間的主鍵、外鍵關係完整。
- [ ] 確認設計至少符合 2NF。
- [ ] 寫出至少 10 個常用 SQL 查詢，包含 JOIN、GROUP BY、子查詢。
- [ ] 確認主要查詢有適當索引。
- [ ] 用 `EXPLAIN` 檢查至少 2 個關鍵查詢。
- [ ] 完成 migration、練習資料、model 關聯。
- [ ] 整理成 Git repository，附上 README、ER 圖、範例查詢。
- [ ] 寫一段 100 到 200 字的學習回顧，說明自己已經掌握與還要補強的內容。

## 最終自評

- [ ] 能獨立建立資料表與基本關聯。
- [ ] 能熟練寫出 CRUD、JOIN、GROUP BY、HAVING、子查詢。
- [ ] 能解釋 1NF 與 2NF，並實際分解資料表。[web:9][web:14]
- [ ] 能設計基本訂單或 CMS 類型資料模型。
- [ ] 能把 DB 設計落地到 Laravel 或 Yii migration 與 model。
- [ ] 已具備初階全端工程師所需的基本資料庫能力。
