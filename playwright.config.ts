import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://127.0.0.1:3090' },
  webServer: {
    command: 'node server/index.mjs',
    url: 'http://127.0.0.1:3090/health',
    env: { PORT: '3090', HOST: '127.0.0.1' }
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
})
