import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 * 支持多浏览器测试：Chromium、Firefox、WebKit
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // 测试文件匹配模式
  testMatch: '**/*.spec.ts',
  
  // 完全并行运行测试
  fullyParallel: true,
  
  // 在 CI 环境中失败时不重试
  forbidOnly: !!process.env.CI,
  
  // 在 CI 环境中重试失败测试
  retries: process.env.CI ? 2 : 0,
  
  // 在 CI 中并行运行
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
    // 收集失败测试的追踪信息
    trace: 'on-first-retry',
    
    // 截图配置
    screenshot: 'only-on-failure',
    
    // 视频配置
    video: 'retain-on-failure',
    
    // 操作超时
    actionTimeout: 10000,
    
    // 导航超时
    navigationTimeout: 30000,
  },

  // 测试项目（浏览器配置）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* 移动端测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 开发服务器配置（用于运行测试）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
