# PostgreSQL 本地練習資料匯入說明

這份資料包含 5 張表：`users`、`categories`、`products`、`orders`、`order_items`，可直接拿來練習 CRUD、JOIN、GROUP BY、子查詢、索引與 1NF／2NF 基本設計。[web:7][web:9]

課程 Day 10／Day 14 要求設計至少 6 張表。**練習資料不會提供第 6 張**，請自己新增（建議 `addresses`：使用者 1 對多地址），並自行寫 DDL、測試資料與關聯。

## 方案一：用 Docker 啟動 PostgreSQL

```bash
docker run --name learning-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=learning_db \
  -p 5432:5432 \
  -d postgres:16
```

確認容器啟動：

```bash
docker ps
```

## 匯入練習資料 SQL

假設 `learning-db-seed.sql` 在目前目錄：

```bash
cat learning-db-seed.sql | docker exec -i learning-pg psql -U postgres -d learning_db
```

如果你要從主機直接連線：

```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d learning_db -f learning-db-seed.sql
```

## 驗證是否成功

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
```

## 建議先做的 8 題練習

1. 查出所有商品，依價格由高到低排序。
2. 查出每位使用者的訂單數量。
3. 查出每張訂單的商品明細與商品名稱。
4. 查出沒有下過單的使用者。
5. 查出每個分類的商品平均價格。
6. 查出總消費金額最高的前 3 位使用者。
7. 查出訂單金額高於平均訂單金額的訂單。
8. 用 `EXPLAIN` 看 `orders` 依 `user_id` 查詢的執行計畫。

## 對應 Laravel 連線設定

`.env` 可先這樣設：

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=learning_db
DB_USERNAME=postgres
DB_PASSWORD=secret
```

## 補充

這份練習資料偏向電商／訂單場景，對練習全端常見資料模型很實用，尤其適合拿來寫 migration、model relation、報表查詢與 N+1 優化練習。[web:7][web:11]
