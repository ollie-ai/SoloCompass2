import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { AdminPage } from '../pages/AdminPage.js';

test.describe('Edge Cases: Admin Panel (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-10.1: Admin demotes themselves', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=users');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.demoteSelf();
  });

  test('EDGE-10.2: Delete last admin account', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=users');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.deleteLastAdmin();
  });

  test('EDGE-10.3: AI Research for existing destination', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=destinations');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.triggerAIResearchForExisting('Tokyo');
  });

  test('EDGE-10.4: AI returns offensive content', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=moderation');
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('EDGE-10.5: Concurrent admin edits to destination', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=destinations');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.editDestination();
  });

  test('EDGE-10.6: View deleted user details', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=users');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.viewDeletedUser();
  });

  test('EDGE-10.7: Non-admin accesses admin endpoints', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('EDGE-10.8: Audit log with 1M+ entries', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=audit');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.checkAuditLogPagination();
  });

  test('EDGE-10.9: Create destination with same name as existing', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=destinations');
    await expect(page.locator('text=Admin')).toBeVisible();
    const adminPage = new AdminPage(page);
    await adminPage.createDestinationWithDuplicateName();
  });

  test('EDGE-10.10: System health check when Infisical down', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=health');
    await expect(page.locator('text=Admin')).toBeVisible();
  });

});
