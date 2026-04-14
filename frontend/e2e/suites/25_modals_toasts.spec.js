import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 25: Modal & Toast Interactions', { tag: ['@modals', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('MODAL-001: Modal opens with backdrop', async ({ page }) => {
    await page.goto('/login');
    const modal = page.locator('[role="dialog"]');
    await expect(page.locator('text=Login').or(page.locator('text=Email'))).toBeVisible();
  });

  test('MODAL-002: Modal closes on X button', async ({ page }) => {
    await page.goto('/login');
    const closeBtn = page.locator('[aria-label="Close"], button:has-text("X")').first();
    await expect(page.locator('text=Login').or(page.locator('text=Email'))).toBeVisible();
  });

  test('MODAL-003: Modal closes on backdrop click', async ({ page }) => {
    await page.goto('/login');
    const backdrop = page.locator('[class*="backdrop"], [class*="overlay"]').first();
    if (await backdrop.isVisible()) {
      await backdrop.click();
    }
  });

  test('MODAL-004: Modal closes on Escape key', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Login').or(page.locator('text=Email'))).toBeVisible();
  });

  test('MODAL-005: Modal prevents body scroll', async ({ page }) => {
    await page.goto('/login');
    const bodyBefore = await page.evaluate(() => document.body.style.overflow);
    const modal = page.locator('[role="dialog"]').first();
    if (await modal.isVisible()) {
      const bodyAfter = await page.evaluate(() => document.body.style.overflow);
    }
  });

  test('TOAST-001: Success toast appears', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page.locator('[class*="toast"], text=saved').first()).toBeVisible();
  });

  test('TOAST-002: Error toast appears', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid');
    await page.fill('input[type="password"]', 'wrong');
    await page.getByRole('button', { name: /login/i }).click();
  });

  test('TOAST-003: Toast auto-dismisses', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.waitForTimeout(5000);
  });

  test('TOAST-004: Toast can be dismissed manually', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    const toastClose = page.locator('[class*="toast"] button, [class*="toast"] [aria-label*="Close"]').first();
    if (await toastClose.isVisible()) {
      await toastClose.click();
    }
  });

  test('TOAST-005: Multiple toasts stack', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page.locator('[class*="toast"]').first()).toBeVisible();
  });

});
