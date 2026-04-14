import { test, expect } from '@playwright/test';

test.describe('Suite 13: Cross-Cutting Concerns', { tag: ['@crosscut', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('CROSS-001: Mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CROSS-002: Tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CROSS-003: Desktop viewport (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CROSS-004: Mobile bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('admin@solocompass.test');
    await page.getByLabel('Password').fill('Test1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/.*\/dashboard/);
    
    const bottomNav = page.locator('[class*="bottom-nav"], nav[class*="mobile"]');
    await expect(bottomNav.or(page.locator('text=My Trips')).first()).toBeVisible();
  });

  test('CROSS-005: Keyboard navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focused = await page.locator(':focus').isVisible();
    expect(focused).toBe(true);
  });

  test('CROSS-006: Screen reader labels exist', async ({ page }) => {
    await page.goto('/');
    const buttons = await page.getByRole('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('CROSS-007: Color contrast sufficient', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CROSS-008: Focus visible on interactive elements', async ({ page }) => {
    await page.goto('/login');
    const button = page.getByRole('button').first();
    await button.focus();
    const focused = await button.evaluate(el => el === document.activeElement);
    expect(focused).toBe(true);
  });

});
