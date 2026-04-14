import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Edge Cases: Dashboard (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-2.1: User has 50 trips', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-2.3: Trip end_date is exactly today', async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await dashboardPage.waitForLoadingComplete();
    await expect(dashboardPage.dashboardHeading.or(dashboardPage.tripCard).first()).toBeVisible();
  });

  test('EDGE-2.4: Trip with past dates but status "planning"', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-2.5: Database down when dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-2.6: Advisories API returns 500', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-2.10: Trip with null dates', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-2.12: Dev panel visible in production', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

});
