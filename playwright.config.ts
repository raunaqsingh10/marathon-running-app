import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174',
    port: 4174,
    reuseExistingServer: false,
    env: { VITE_DEMO_MODE: 'true', VITE_DEMO_DATE: '2026-07-27' },
  },
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'on-first-retry' },
  projects: [
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
})
