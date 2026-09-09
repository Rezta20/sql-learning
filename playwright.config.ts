import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { defineConfig, devices } from '@playwright/test'

const localLibs = `${homedir()}/.local/pw-libs/usr/lib/x86_64-linux-gnu`
if (existsSync(localLibs)) {
  process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
    ? `${localLibs}:${process.env.LD_LIBRARY_PATH}`
    : localLibs
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
