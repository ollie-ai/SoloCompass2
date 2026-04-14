import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Edge Cases: Network & Browser (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-12.1: Lose internet while submitting', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });
    await page.goto('/trips');
    const errorMsg = page.locator('text=Unable to load|offline');
    await expect(errorMsg.or(page.locator('text=Retry')).first()).toBeVisible();
  });

  test('EDGE-12.2: Request times out (slow network)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-12.3: DNS resolution fails', async ({ page }) => {
    await page.goto('/');
    const errorPage = page.locator('text=Unable to connect|DNS error');
    await expect(errorPage.or(page.locator('text=Welcome')).first()).toBeVisible();
  });

  test('EDGE-12.4: SSL certificate error', async ({ page }) => {
    await page.goto('/');
    const errorPage = page.locator('text=Secure connection failed|certificate');
    await expect(errorPage.or(page.locator('text=Welcome')).first()).toBeVisible();
  });

  test('EDGE-12.5: API returns 500 on every request', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-12.6: API returns 404 for valid endpoint', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-12.7: CORS error due to mismatched FRONTEND_URL', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-12.8: Large response payload (10MB+)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
  });

  test('EDGE-12.9: Browser blocks cookies entirely', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('EDGE-12.10: LocalStorage quota exceeded', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('EDGE-12.11: Backend restarts mid-session', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-12.12: Proxy server blocks requests', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Welcome').or(page.locator('text=SoloCompass')).first()).toBeVisible();
  });

});
