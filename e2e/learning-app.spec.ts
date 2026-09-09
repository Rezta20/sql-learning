import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const shotDir = 'e2e/screenshots'

test.beforeAll(async () => {
  await mkdir(shotDir, { recursive: true })
})

/** 讓關 0 直接完成，今天卡才會顯示第一課 */
const SETUP_DONE = {
  checklists: {},
  lastScore: {},
  setup: { orbstack: true, terminal: true, 'docker-run': true, 'docker-ps': true, seed: true, psql: true, 'first-select': true },
}

/** 只在第一次載入時灌資料，之後的導航不覆蓋進度 */
function seed(s: unknown) {
  if (!localStorage.getItem('sql-learning:v1')) localStorage.setItem('sql-learning:v1', JSON.stringify(s))
}

test('夥伴飽食度：今天有學是 100；三天沒學會餓昏，做一步就回滿', async ({ page }) => {
  const key = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  await page.addInitScript(seed, { ...SETUP_DONE, activity: [key(3)] })
  await page.goto('/')
  await expect(page.getByTestId('buddy-card')).toContainText('餓昏了')
  await expect(page.getByTestId('fullness')).toHaveAttribute('data-value', '25')
  await expect(page.getByTestId('buddy').first()).toHaveAttribute('data-stage', 'faint')

  // 做一步（抄一張卡）= 餵食
  await page.goto('/cards')
  await page.locator('.tabs .tab', { hasText: '全部' }).click()
  await page.getByTestId('card-write-1').click()
  await page.goto('/')
  await expect(page.getByTestId('buddy-card')).toContainText('吃飽了')
  await expect(page.getByTestId('fullness')).toHaveAttribute('data-value', '100')
})

test('今天頁：關 0 未完成時只顯示一張卡與一顆按鈕', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('today-card')).toContainText('關 0')
  await expect(page.getByTestId('today-go')).toHaveText(/去做關 0/)
  await expect(page.getByTestId('mini-cmds')).toBeVisible()
  await expect(page.getByTestId('xp-text')).toContainText('0 XP')
  await page.screenshot({ path: `${shotDir}/today-setup.png`, fullPage: true })
})

test('關 0：打勾七步過關 +30 XP，今天卡切到第一課', async ({ page }) => {
  await page.goto('/setup')
  await expect(page.getByTestId('setup-progress')).toContainText('0/9')
  await expect(page.getByTestId('setup-docker-run').getByRole('button', { name: '複製' })).toBeVisible()
  for (const id of ['orbstack', 'terminal', 'docker-run', 'docker-ps', 'seed', 'psql', 'first-select']) {
    await page.getByTestId(`setup-check-${id}`).check()
  }
  await expect(page.getByTestId('toast')).toContainText('關 0 過關')
  await page.goto('/')
  await expect(page.getByTestId('xp-text')).toContainText('30 XP')
  await expect(page.getByTestId('today-card')).toContainText('第 1/4 課')
  await expect(page.getByTestId('today-card')).toContainText('只要學會')
  await expect(page.getByTestId('today-go')).toHaveText(/開始/)
  await page.screenshot({ path: `${shotDir}/today.png`, fullPage: true })
})

test('關卡頁：一步一步走完第一課會累積 XP', async ({ page }) => {
  await page.addInitScript(seed, SETUP_DONE)
  await page.goto('/day/1')
  await expect(page.getByTestId('day-title')).toContainText('關 1')
  await expect(page.getByTestId('lesson-pills').locator('.pill')).toHaveCount(4)
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'focus')
  await expect(page.getByTestId('step')).toContainText('今天只要學會這一件事')
  await page.screenshot({ path: `${shotDir}/step-focus.png`, fullPage: true })
  await page.getByTestId('step-next').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'concept')
  await page.getByTestId('step-concept-ok').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'card')
  await page.screenshot({ path: `${shotDir}/step-card.png`, fullPage: true })
  await page.getByTestId('card-write-6').click()
  await page.getByTestId('card-write-7').click()
  await page.getByTestId('card-write-1').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'exercise')
  await page.getByTestId('ex-1-1-0').click()
  await page.getByTestId('ex-1-1-1').click()
  await page.getByTestId('ex-1-1-2').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'project')
  await page.getByTestId('project-1-1').click()
  await page.getByTestId('teach-1-1').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'done')
  await expect(page.getByTestId('step-settle')).toBeVisible()
  await page.goto('/')
  // 30（關 0）+ 30（3 卡）+ 15（3 題）+ 5（專案）+ 20（講出來）= 100
  await expect(page.getByTestId('xp-text')).toContainText('100 XP')
  await expect(page.getByTestId('today-card')).toContainText('第 2/4 課')
})

test('重新進入關卡頁會停在第一個未完成的步驟', async ({ page }) => {
  await page.addInitScript(seed, {
    ...SETUP_DONE,
    lessons: { '1-1': { concept: true, exercises: [true, false, false], project: false, teach: false } },
    cards: { '6': { writtenAt: '2026-01-01' }, '7': { writtenAt: '2026-01-01' }, '1': { writtenAt: '2026-01-01' } },
  })
  await page.goto('/day/1')
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'exercise')
  await expect(page.getByTestId('step')).toContainText('第 2 題')
})

test('地圖：5 個世界、14 關、狀態正確；Boss 過關後下一關變成現在', async ({ page }) => {
  await page.goto('/map')
  await expect(page.getByTestId('world-map').locator('.world')).toHaveCount(5)
  await expect(page.getByTestId('day-grid').locator('a.day-card')).toHaveCount(14)
  await expect(page.getByTestId('day-card-1')).toHaveAttribute('data-tone', 'idle')
  await expect(page.getByTestId('day-card-1')).toHaveAttribute('data-status', 'current')
  await expect(page.getByTestId('day-card-2')).toHaveAttribute('data-status', 'locked')
  await expect(page.getByTestId('home-progress')).toContainText('已測驗')
  await page.screenshot({ path: `${shotDir}/map.png`, fullPage: true })
  await page.goto('/day/1')
  await page.getByTestId('lesson-pills').locator('.pill').nth(3).click()
  await page.getByTestId('step-dots').locator('.sdot').last().click()
  // 最後一課的倒數第二步是 Boss
  await page.getByTestId('step-dots').locator('.sdot').nth(-2).click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-kind', 'boss')
  await page.getByTestId('boss-check').click()
  await page.goto('/map')
  await expect(page.getByTestId('day-card-1')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('day-card-2')).toHaveAttribute('data-status', 'current')
})

test('卡片頁：一張卡一顆按鈕；剛抄的卡不會到期', async ({ page }) => {
  await page.goto('/cards')
  await expect(page.getByTestId('card-summary')).toBeVisible()
  await page.locator('.tabs .tab', { hasText: '全部' }).click()
  await page.getByTestId('card-write-1').click()
  await expect(page.getByTestId('card-wait-1')).toContainText('0/3')
  await page.locator('.tabs .tab', { hasText: '今天到期' }).click()
  await expect(page.locator('.empty')).toContainText('今天沒有到期的卡')
  await page.goto('/journal')
  await expect(page.getByTestId('journal-entry')).toContainText('開學日')
})

test('同事原版教材頁可勾選任務並持久化', async ({ page }) => {
  await page.goto('/day/1/detail')
  await expect(page.getByTestId('day-title')).toContainText('關 1')
  await expect(page.getByTestId('key-points')).toBeVisible()
  await expect(page.getByTestId('abbrev-notes')).toContainText('*1')
  await expect(page.getByTestId('abbrev-notes')).toContainText('Data Definition Language')
  await page.locator('.fn-ref').first().click()
  await expect(page.locator('#fn-1')).toBeVisible()
  await expect(page.getByTestId('start-quiz')).toBeVisible()
  await expect(page.getByTestId('task-list').locator('li')).toHaveCount(6)
  await page.getByTestId('task-0').check()
  await page.reload()
  await expect(page.getByTestId('task-0')).toBeChecked()
  await page.goto('/map')
  await expect(page.getByTestId('day-card-1')).toHaveAttribute('data-tone', 'warning')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByTestId('reset-progress').click()
  await expect(page.getByTestId('day-card-1')).toHaveAttribute('data-tone', 'idle')
  await expect(page.getByTestId('home-progress')).toContainText('任務 0 /')
})

async function completeQuiz(page: import('@playwright/test').Page) {
  await expect(page.getByTestId('quiz-list').locator('.quiz-item')).toHaveCount(15)
  await expect(page.getByTestId('result-title')).toHaveCount(0)
  for (let i = 0; i < 15; i += 1) {
    await page.getByTestId(`question-${i}`).locator('input[type="radio"]').first().check()
  }
  await page.getByTestId('submit-quiz').click()
}

test('關 1 測驗 15 題並顯示成績與解析', async ({ page }) => {
  await page.goto('/day/1/detail')
  await page.getByTestId('start-quiz').click()
  await completeQuiz(page)
  await expect(page.getByTestId('result-title')).toBeVisible()
  await expect(page.getByTestId('result-score')).toHaveText(/\d+ \/ 15/)
  await expect(page.getByTestId('result-wrong')).toHaveText(/錯誤 \d+ 題/)
  await expect(page.getByTestId('review-list').locator('li')).toHaveCount(15)
  await expect(page.locator('.review-item.ok, .review-item.bad').first()).toBeVisible()
  await page.goto('/day/1/detail')
  await expect(page.getByTestId('error-count')).toHaveText(/錯誤 \d+ 題/)
})

test('關 4 與關 8 測驗皆為 15 題', async ({ page }) => {
  await page.goto('/day/4/quiz')
  await expect(page.getByTestId('quiz-list').locator('.quiz-item')).toHaveCount(15)
  await page.goto('/day/8/quiz')
  await expect(page.getByTestId('quiz-list').locator('.quiz-item')).toHaveCount(15)
})

test('Extra 預設不出現，重整後仍隱藏', async ({ page }) => {
  await page.goto('/map')
  await expect(page.getByTestId('day-grid').locator('a.day-card')).toHaveCount(14)
  await expect(page.getByTestId('day-card-15')).toHaveCount(0)
  await page.goto('/day/15')
  await expect(page.getByTestId('extra-locked')).toBeVisible()
})

test('地圖連按鍵盤 1 五次可解鎖 Extra，重整後隱藏', async ({ page }) => {
  await page.goto('/map')
  await expect(page.getByTestId('badges')).toBeVisible()
  for (let i = 0; i < 5; i += 1) await page.keyboard.press('1')
  await expect(page.getByTestId('day-card-15')).toBeVisible()
  await expect(page.getByTestId('home-progress')).toContainText('Extra 已解鎖')
  await page.reload()
  await expect(page.getByTestId('day-card-15')).toHaveCount(0)
})

test('關 9 測驗滿分後地圖出現 Extra', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'sql-learning:v1',
      JSON.stringify({
        checklists: {},
        lastScore: {
          '9': { score: 15, total: 15, wrong: 0, at: '2026-01-01T00:00:00.000Z' },
        },
      }),
    )
  })
  await page.goto('/map')
  await expect(page.getByTestId('home-progress')).toContainText('Extra 已解鎖')
  await expect(page.getByTestId('day-card-15')).toBeVisible()
  await page.getByTestId('day-card-15').click()
  await expect(page.getByTestId('day-title')).toContainText('反正規化')
  await page.getByTestId('to-detail').click()
  await page.getByTestId('start-quiz').click()
  await expect(page.getByTestId('quiz-list').locator('.quiz-item')).toHaveCount(15)
})
