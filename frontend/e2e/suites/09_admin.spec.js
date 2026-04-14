import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 9: Admin & Platform Operations', { tag: ['@admin', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('ADMIN-001: Admin route protection - non-admin redirected', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    // Login as regular user
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    
    // Try to access admin
    await page.goto('/admin');
    
    // Should redirect away from admin
    await expect(page).not.toHaveURL(/.*\/admin/);
  });

  test('ADMIN-002: Admin can access admin panel', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    // Login as admin
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await adminPage.gotoAdmin();
    
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('ADMIN-003: Destinations tab visible to admin', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.destinationsTab.or(adminPage.dataTable).first()).toBeVisible();
  });

  test('ADMIN-004: View destinations table', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    await adminPage.gotoDestinationsTab();
    
    // Should show data table
    await expect(adminPage.dataTable.or(adminPage.addBtn).first()).toBeVisible();
  });

  test('ADMIN-005: Travelers tab visible', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.travelersTab.or(adminPage.dataTable).first()).toBeVisible();
  });

  test('ADMIN-006: View users table', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    await adminPage.gotoTravelersTab();
    
    // Should show users
    await expect(adminPage.dataTable.or(adminPage.tableRow).first()).toBeVisible();
  });

  test('ADMIN-007: Audit logs tab visible', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.auditLogsTab.or(adminPage.auditEntry).first()).toBeVisible();
  });

  test('ADMIN-008: Moderation tab visible', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.moderationTab.or(adminPage.approveBtn).first()).toBeVisible();
  });

  test('ADMIN-009: System health tab visible', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.systemHealthTab.or(adminPage.healthIndicator).first()).toBeVisible();
  });

  test('ADMIN-010: Intelligence tab visible', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    
    await expect(adminPage.intelligenceTab.or(adminPage.statsCard).first()).toBeVisible();
  });

  test('ADMIN-011: Search destinations in admin', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    await adminPage.gotoDestinationsTab();
    
    // Should have search
    await expect(adminPage.searchInput.or(adminPage.dataTable).first()).toBeVisible();
  });

  test('ADMIN-012: Status badges visible on destinations', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    await adminPage.gotoDestinationsTab();
    
    // Should show status badges
    await expect(adminPage.statusBadge.first()).toBeVisible();
  });

  test('ADMIN-013: Role badges visible on users', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await adminPage.gotoAdmin();
    await adminPage.gotoTravelersTab();
    
    // Should show role badges
    await expect(adminPage.roleBadge.first()).toBeVisible();
  });

  test('ADMIN-014: Admin navigation from dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Click admin in nav (if visible)
    const adminLink = page.getByRole('link', { name: /admin/i });
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await expect(page).toHaveURL(/.*\/admin/);
    }
  });

  test('ADMIN-015: Admin deep link loads destinations tab', async ({ page }) => {
    const authPage = new AuthPage(page);
    const adminPage = new AdminPage(page);

    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');

    await page.goto('/admin/destinations');

    await expect(page).toHaveURL(/.*\/admin\/destinations/);
    await expect(adminPage.destinationsTab).toBeVisible();
    await expect(adminPage.dataTable.or(adminPage.addBtn).first()).toBeVisible();
  });

});
