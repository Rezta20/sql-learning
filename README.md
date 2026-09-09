# 🐾 Sasha 的 SQL 冒險

以同事的 `data/relational-db-14day-checklist.md` 為底，改成遊戲化的學習儀表板：**5 個世界、14 關**（+ 隱藏關），每關拆成幾課，一課 45 分鐘。

設計原則：**少字、一次一件事、畫面上永遠只有一顆主按鈕。**

- **今天**（首頁）：一張卡：今天哪一課、只要學會什麼、一顆「▶ 開始」
- **關卡頁**：一步一步翻：今天 → 概念 → 手寫卡 → 3 題 → 換成你的專案（寵物營養）→ 講出來 →（最後一課）Boss → 結算。每步一顆按鈕，會把要對老師說的話複製好
- **地圖**：5 個世界 14 關的進度、徽章（收合）
- **卡片**：60 張手寫卡（`study/cards.json`），一張卡一顆按鈕：抄好了 → 複習完了（1-3-7）→ 畢業
- **日誌**：老師每次「結算」寫在 `study/journal/YYYY-MM-DD.md`，可跳到昨天／3 天前／7 天前
- **關 0**：環境設定，每個指令可一鍵複製
- 右下角固定兩顆：🛑 太多了、🆘 卡住
- 同事原版教材與 15 題測驗在每關的 `/day/N/detail`

教學默契寫在 `.cursor/rules/sql-teacher.mdc`，老師開新對話會先讀 `study/progress.md` 接續進度。

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
