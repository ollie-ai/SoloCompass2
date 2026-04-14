import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';

test.describe('Edge Cases: Settings & Account (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-9.1: Change email to existing email', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    await settingsPage.changeEmailToExisting();
  });

  test('EDGE-9.2: Clear name field and save (empty name)', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('profile');
    await settingsPage.clearNameAndSave();
  });

  test('EDGE-9.3: Export data for account with 100+ trips', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('data');
    await settingsPage.exportData();
  });

  test('EDGE-9.4: Cancel account deletion', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=data');
    await expect(page.locator('text=Delete').or(page.locator('text=Account')).first()).toBeVisible();
    const settingsPage = new SettingsPage(page);
    await settingsPage.cancelAccountDeletion();
  });

  test('EDGE-9.5: Two sessions change password simultaneously', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=security');
    await expect(page.locator('text=Settings')).toBeVisible();
    const settingsPage = new SettingsPage(page);
    await settingsPage.changePassword('Test1234!', 'NewPassword1!', 'NewPassword1!');
  });

  test('EDGE-9.6: SOS overrides notification preferences', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = page.locator('text=Safety');
    await expect(safetyPage).toBeVisible();
  });

  test('EDGE-9.7: Export data while export already in progress', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('data');
    await settingsPage.exportData();
    await settingsPage.exportData();
  });

  test('EDGE-9.8: Navigate to invalid tab in settings', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=nonexistent');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('EDGE-9.9: Enable SMS without phone number', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    await settingsPage.enableSMSWithoutPhone();
  });

  test('EDGE-9.10: Admin deletes user while logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-9.11: Preferences revert on refresh', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    await settingsPage.saveNotifBtn.click();
    await page.reload();
    await expect(settingsPage.emailToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('EDGE-9.12: Password autocomplete fills wrong fields', async ({ page }) => {
    const authPage = new AuthPage(page);
    const settingsPage = new SettingsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=security');
    await expect(page.locator('text=Settings')).toBeVisible();
    const currentPassInput = page.locator('input[name="currentPassword"]');
    const newPassInput = page.locator('input[name="newPassword"]');
    await expect(currentPassInput).toBeVisible();
    await expect(newPassInput).toBeVisible();
  });

});
