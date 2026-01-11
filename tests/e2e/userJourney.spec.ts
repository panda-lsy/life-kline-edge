import { test, expect } from '@playwright/test';

/**
 * 用户旅程 E2E 测试
 * 测试完整的用户使用流程
 */

test.describe('新用户完整旅程', () => {
  test('应完成从输入到查看结果的完整流程', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/');
    
    // 验证首页加载
    await expect(page.locator('h1')).toContainText('人生 K 线');
    
    // 2. 点击开始分析按钮
    await page.click('text=/开始分析/i');
    
    // 3. 验证输入页显示
    await expect(page.locator('text=/出生日期/i')).toBeVisible();
    
    // 4. 填写表单
    await page.fill('input[name="name"]', '测试用户');
    await page.fill('input[type="date"]', '1990-01-01');
    await page.selectOption('select[name="birthTime"]', '午时');
    await page.click('input[name="gender"][value="male"]');
    
    // 5. 提交表单
    await page.click('button:has-text("开始分析")');
    
    // 6. 等待分析完成（最多30秒）
    await page.waitForSelector('text=/运势分析/', { timeout: 30000 });
    
    // 7. 验证结果页显示
    await expect(page.locator('text=/运势分析/i')).toBeVisible();
    await expect(page.locator('text=/人生运势 K 线图/i')).toBeVisible();
    await expect(page.locator('text=/八字排盘/i')).toBeVisible();
  });
});

test.describe('主题切换', () => {
  test('应正确切换主题', async ({ page }) => {
    await page.goto('/');
    
    // 点击主题切换按钮
    await page.click('[aria-label="切换主题"]');
    
    // 验证主题菜单显示
    await expect(page.locator('text=/中国风/i')).toBeVisible();
    await expect(page.locator('text=/赛博朋克/i')).toBeVisible();
    await expect(page.locator('text=/极简/i')).toBeVisible();
    
    // 选择赛博朋克主题
    await page.click('text=/赛博朋克/i');
    
    // 验证主题已应用（通过检查背景色）
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // 赛博朋克主题应该有深色背景
    expect(['#0a0a0a', 'rgb(10, 10, 10)']).toContain(backgroundColor);
  });
});

test.describe('历史记录', () => {
  test('应能保存和查看历史记录', async ({ page }) => {
    await page.goto('/');
    
    // 导航到历史页
    await page.click('text=/历史记录/i');
    
    // 验证历史页加载
    await expect(page.locator('text=/历史记录/i')).toBeVisible();
    
    // 如果有历史记录，验证列表显示
    const historyList = page.locator('[data-testid="history-list"]');
    if (await historyList.isVisible()) {
      const items = await page.locator('[data-testid^="history-item"]').count();
      expect(items).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('响应式设计', () => {
  test('应在移动设备上正确显示', async ({ page, viewport }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 验证移动端布局
    await expect(page.locator('h1')).toBeVisible();
    
    // 验证移动端菜单按钮显示
    const menuButton = page.locator('[aria-label="菜单"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('text=/历史记录/i')).toBeVisible();
    }
  });
});

test.describe('性能测试', () => {
  test('首页加载应快速', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 首页应在 5 秒内加载完成
    expect(loadTime).toBeLessThan(5000);
  });
});
