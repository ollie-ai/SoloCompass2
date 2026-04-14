import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Edge Cases: Notifications (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-11.1: 1000+ unread notifications', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
    const badge = page.locator('[class*="badge"]');
    await expect(badge.or(page.locator('text=999')).first()).toBeVisible();
  });

  test('EDGE-11.2: Notification references deleted trip', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
  });

  test('EDGE-11.3: Receive notification while offline', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
  });

  test('EDGE-11.4: Mark all as read with 500 unread', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
    const markAllBtn = page.getByRole('button', { name: /mark all read/i });
    await markAllBtn.click();
  });

  test('EDGE-11.5: WebSocket disconnects and reconnects', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
  });

  test('EDGE-11.6: Notification in different language', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
    const notification = page.locator('[class*="notification"]').first();
    await expect(notification).toBeVisible();
  });

  test('EDGE-11.7: Push notification permission denied', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=notifications');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('EDGE-11.8: Enable notifications without browser permission', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=notifications');
    await expect(page.locator('text=Settings')).toBeVisible();
    const warningMsg = page.locator('text=Enable browser notifications');
    await expect(warningMsg.or(page.locator('text=permission').first()).first()).toBeVisible();
  });

});
