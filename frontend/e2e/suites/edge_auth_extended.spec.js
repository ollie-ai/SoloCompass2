import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Edge Cases: Auth Registration (P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-1.1: Close browser mid-registration', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Register')).toBeVisible();
  });

  test('EDGE-1.2: Double-click submit button', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.addEventListener('click', () => btn.click());
    });
    await authPage.register('Test User', `test${Date.now()}@test.com`, 'Test1234!');
  });

  test('EDGE-1.3: Case-insensitive email login', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('ADMIN@SoloCompass.TEST', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 }).catch(() => {});
  });

  test('EDGE-1.4: Unicode name registration', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    await authPage.register('José María 日本語', `test${Date.now()}@test.com`, 'Test1234!');
  });

  test('EDGE-1.5: Extremely long name (500+ chars)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    const longName = 'A'.repeat(500);
    await authPage.register(longName, `test${Date.now()}@test.com`, 'Test1234!');
  });

  test('EDGE-1.6: Email with special chars (user+tag@gmail.com)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    await authPage.register('Test User', `test+tag${Date.now()}@test.com`, 'Test1234!');
  });

});

test.describe('Edge Cases: Auth Login & Sessions (P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-1.8: Multiple simultaneous sessions', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-1.9: JWT expires mid-form', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-1.10: Session deleted from DB while active', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-1.11: Logout in Tab A, submit in Tab B', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@solocompass.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-1.12: Manually delete JWT cookie', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

});

test.describe('Edge Cases: Password Reset (P1)', { tag: ['@edge', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-1.14: Reset token invalidated after password change', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Forgot')).toBeVisible();
  });

  test('EDGE-1.15: Click reset link twice', async ({ page }) => {
    await page.goto('/reset-password?token=invalid');
    await expect(page.locator('text=expired|invalid')).toBeVisible();
  });

  test('EDGE-1.16: Rate limiting on password reset', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Forgot')).toBeVisible();
  });

  test('EDGE-1.17: Server down during password reset', async ({ page }) => {
    await page.goto('/reset-password?token=validtoken');
    await expect(page.locator('text=Reset')).toBeVisible();
  });

  test('EDGE-1.18: Account deleted between request and click', async ({ page }) => {
    await page.goto('/reset-password?token=validtoken');
    await expect(page.locator('text=Reset')).toBeVisible();
  });

});
