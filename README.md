# 🐾 Sasha 的 SQL 冒險

以同事的 `data/relational-db-14day-checklist.md` 為底，改成遊戲化的學習儀表板：**5 個世界、14 關**（+ 隱藏關），每關拆成幾課，一課 45 分鐘。

設計原則：**少字、一次一件事、畫面上永遠只有一顆主按鈕。**

- **今天**（首頁）：一張卡：今天哪一課、只要學會什麼、一顆「▶ 開始」
- **關卡頁**：一步一步翻：今天 → 概念（一句話＋可展開的 ≤5 行講解）→ 手寫卡 → 3 題 → 換成你的專案（寵物營養）→ 講出來 →（最後一課）Boss → 結算
  - 每一題都能**自己對答案**：三層漸進揭露「提示 → 預期結果 → 看答案」。預期結果是用 `data/learning-db-seed.sql` 實際跑出來的筆數與內容，跟螢幕一樣就按「結果跟預期一樣 ✓」
  - 「講出來」要勾滿 3 個關鍵字才能過；Boss 題自己判定；「問老師」都是次要小字連結
- **卡住**（右下角 🆘 → `/stuck`）：貼錯誤訊息，先查 29 條常見錯誤字典（哪個字錯了、怎麼改、回去看哪張卡）；查不到才複製訊息問老師
- **地圖**：5 個世界 14 關的進度、徽章（收合）；每個世界一支 ≤10 分鐘的暖身影片（可跳過、不給 XP）
- **卡片**：60 張手寫卡（`study/cards.json`），一張卡一顆按鈕：抄好了 → 複習完了（1-3-7）→ 畢業
- **日誌**：「結算」訊息會附上 App 自動產生的日誌草稿；老師存成 `study/journal/YYYY-MM-DD.md`，可跳到昨天／3 天前／7 天前
- **關 0**：環境設定，每個指令可一鍵複製
- **說明**（`/guide`）：給 Sasha 自己看的使用說明書（每天流程、三個找老師的時刻、怎麼對答案、備份），同內容在 `study/how-to.md`
- 同事原版教材與 15 題測驗在每關的 `/day/N/detail`

**AI 老師只在三個時刻出場**：開始（暖身抽卡＋講一個概念）、卡住且字典查不到、結算。其他都在 App 裡自學，省 token。教學默契寫在 `.cursor/rules/sql-teacher.mdc`，老師開新對話會先讀 `study/progress.md` 接續進度。

課綱：世界／關卡結構在 `src/content/lessons.ts`；每課內容（概念、講解、卡片、3 題含提示／預期／答案、專案題、Boss）分檔在 `src/content/lessons/world1～5.ts`；錯誤字典在 `src/content/errors.ts`。

本 App **不連線資料庫**。SQL 請在本機 PostgreSQL（Docker）練習，步驟見「關 0」頁或 `data/postgres-local-import-guide.md`。

## 介面

- **Tailwind CSS v4 + shadcn/ui**（`components.json`；元件在 `src/components/ui/`，要加新元件用 `npx shadcn@latest add <name>`）
- 主題色在 `src/index.css`：暖橘主色、成功綠 `success`、Boss 紫 `boss`、金色 `gold`
- **學習夥伴**（`src/components/Buddy.tsx`）：一隻小狗，Lv1 幼犬 → Lv5 戴皇冠，XP 條與夥伴在頂端即時更新
- 動效：按鈕有「壓下去」的立體感、XP 條會流光、完成一課會撒花

## 進度存在哪

- 平常存在瀏覽器 `localStorage`，關機重開不會消失。
- **雲端同步**（頁首雲朵 → `/sync`）：貼一個只有 `gist` 權限的 GitHub token，進度會存成你帳號裡的私人 Gist（`sql-learning-progress.json`）。每次打勾 2 秒後自動上傳；開 App 時先拉一次，誰的 `savedAt` 新誰贏。換電腦或清瀏覽資料 → 再貼同一個 token，會自動找回同一個 Gist。
- 沒有 GitHub 也可以：`/sync` 頁有「下載備份／匯入備份」JSON。
- 老師端的紀錄（`study/progress.md`、`study/journal/`）在 repo 裡，跟著 git 走。

## 部署到 GitHub Pages

網址：<https://rezta20.github.io/sql-learning/>

每次 `git push` 到 `main`，`.github/workflows/pages.yml` 會自動 build 並部署（第一次會自動開啟 Pages）。

## 開發

需要 Node.js 22（已裝 nvm，開新終端機即可）。

```bash
npm install
npm run dev
```

```bash
npm run build
npm run test:e2e
```

第一次跑 Playwright 請安裝瀏覽器：`npx playwright install chromium`。
