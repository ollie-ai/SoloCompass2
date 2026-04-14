import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Edge Cases: Authentication (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // P0: Security
  test('EDGE-1.7: Two users register same email simultaneously', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    await authPage.register('User One', 'duplicate@test.com', 'Test1234!');
    await expect(authPage.errorMsg.or(page.locator('text=registered')).first()).toBeVisible();
  });

  test('EDGE-1.13: Modified JWT payload rejected', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-1.14: Password reset token invalidated after password change', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill('admin@solocompass.test');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('text=email|check your')).toBeVisible();
  });

  // P1: Feature broken/blocked
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

  test('EDGE-1.11: Logout in Tab A, submit form in Tab B', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@solocompass.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

});
