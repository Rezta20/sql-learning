# 學習進度（老師的紀錄）

> 老師每次「結算」後更新這份檔案。開新對話時老師會先讀這裡，接續上次進度。
> App 裡的打勾、XP 存在瀏覽器（localStorage）；這裡是給老師看的摘要版。

## 現在在哪

- 目前關卡：**關 0 環境設定**（尚未開始）
- 目前課程：—
- 下一步只有一件事：打開 OrbStack → 跑 `docker run …` → 匯入練習資料 → `SELECT * FROM users;` 截圖

## 學員檔案

- 名字：Sasha
- 背景：前端（JS），SQL 超級初學者，理解慢、資訊量大會當機（ADHD），手寫最有效
- 目標：公司 AI 保健食品／血檢對話系統（PostgreSQL、後端同事用 Laravel）＋ side project 寵物營養問答（自己寫 Node.js 後端）
- 技術路線：關 1–10 PostgreSQL；關 11–12 Node.js + Prisma；Eloquent 只給對照表；MySQL 差異用 🟠 註記帶過
- 上課時間：平日 14:00–14:45，一天一課；週末只複習到期卡
- 結果回傳方式：截圖
- 名詞：中英都給
- 筆記本：一本。最後一區可撕小卡（一頁兩張）= 卡片區；前一區有圖案的部分 = 錯誤日誌；畢業卡撕下放信封

## 專案對照（電商練習 → 寵物營養）

| 電商練習 | 寵物營養（side project） | 保健食品（公司） |
| --- | --- | --- |
| users | owners 飼主 | members 會員 |
| orders | pets 寵物 | blood_reports 血檢報告 |
| order_items | weight_logs 體重紀錄 | report_items 檢驗指標 |
| products | foods 飼料／鮮食 | supplements 保健食品 |
| categories | food_types 分類 | vendors 合作廠商 |
| （新增） | diet_needs 飲食需求、medical_history 病歷 | recommendations 推薦 |

## 關卡紀錄

| 關 | 狀態 | Boss | 備註 |
| --- | --- | --- | --- |
| 0 | ⬜ | — | |
| 1 | ⬜ | ⬜ | |
| 2 | ⬜ | ⬜ | |
| 3 | ⬜ | ⬜ | |
| 4 | ⬜ | ⬜ | |
| 5 | ⬜ | ⬜ | |
| 6 | ⬜ | ⬜ | |
| 7 ★ | ⬜ | ⬜ | |
| 8 | ⬜ | ⬜ | |
| 9 | ⬜ | ⬜ | |
| 10 | ⬜ | ⬜ | |
| 11 | ⬜ | ⬜ | |
| 12 | ⬜ | ⬜ | |
| 13 | ⬜ | ⬜ | |
| 14 ★ | ⬜ | ⬜ | |

## 卡片

- 已抄：#02 Docker 容器、#03 ~/.zshrc（2026-09-09 對話中提到，請學員確認是否真的抄了）
- 畢業卡：0

## 卡住過的地方（錯誤日誌摘要）

- 2026-09-09：`npm: command not found` → 舊終端機沒載入 nvm；開新視窗即可。已解決。
