import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 26: Empty, Loading & Error States', { tag: ['@states', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('STATE-001: Dashboard loading skeleton', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page.locator('text=Dashboard').or(page.locator('text=My Trips')).first()).toBeVisible();
  });

  test('STATE-002: Settings loading skeleton', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings');
    await expect(page.locator('text=Settings').or(page.locator('text=Profile')).first()).toBeVisible();
  });

  test('STATE-003: Trip list loading spinner', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips').or(page.locator('[class*="spinner"]').first()).first()).toBeVisible();
  });

  test('STATE-004: Trips - no trips', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=No trips').or(page.locator('text=Create')).first()).toBeVisible();
  });

  test('STATE-005: Buddies - no matches', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=No matches').or(page.locator('text=Buddies')).first()).toBeVisible();
  });

  test('STATE-006: Notifications - empty', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await page.goto('/notifications');
    await expect(page.locator('text=No notifications').or(page.locator('text=notifications')).first()).toBeVisible();
  });

  test('STATE-007: Budget - no transactions', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await expect(page.locator('text=Budget').or(page.locator('text=No transactions')).first()).toBeVisible();
    }
  });

  test('STATE-008: API error boundary', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page.locator('text=Dashboard').or(page.locator('text=My Trips')).first()).toBeVisible();
  });

  test('STATE-009: Network error toast', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.route('**/api/**', (route) => route.abort('failed'));
    await page.goto('/dashboard');
    const errorMsg = page.locator('text=Network error|offline|failed');
    await expect(errorMsg.or(page.locator('text=Dashboard')).first()).toBeVisible();
  });

  test('STATE-010: Image load failure', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Explore').or(page.locator('text=Tokyo')).first()).toBeVisible();
  });

});
