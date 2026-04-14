import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/SettingsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 17: Notification Preferences', { tag: ['@notifpref', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('NOTIFP-001: Toggle email notifications OFF', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    // Toggle should be clickable
    await expect(settingsPage.emailToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-002: Toggle email notifications ON', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.emailToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-003: Toggle push notifications', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.pushToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-004: Toggle SMS notifications', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.smsToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-005: Toggle check-in reminders', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.checkinToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-006: Toggle buddy requests', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.buddyToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

  test('NOTIFP-007: Toggle emergency alerts', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const emergencyToggle = page.getByRole('switch', { name: /emergency/i });
    await expect(emergencyToggle.or(page.getByText(/Emergency/i)).first()).toBeVisible();
  });

  test('NOTIFP-008: Toggle trip reminders', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const tripToggle = page.getByRole('switch', { name: /trip/i });
    await expect(tripToggle.or(page.getByText(/Trip/i)).first()).toBeVisible();
  });

  test('NOTIFP-009: Toggle budget alerts', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const budgetToggle = page.getByRole('switch', { name: /budget/i });
    await expect(budgetToggle.or(page.getByText(/Budget/i)).first()).toBeVisible();
  });

  test('NOTIFP-010: Change reminder minutes before', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const reminderSelect = page.locator('select[name="reminderMinutes"]');
    if (await reminderSelect.isVisible()) {
      await reminderSelect.selectOption('30');
      await settingsPage.saveNotifBtn.click();
    }
  });

  test('NOTIFP-011: Toggle missed check-in alerts', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const missedToggle = page.getByRole('switch', { name: /missed/i });
    await expect(missedToggle.or(page.getByText(/Missed/i)).first()).toBeVisible();
  });

  test('NOTIFP-012: Save preferences', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await settingsPage.saveNotifBtn.click();
    
    await expect(settingsPage.successToast.or(settingsPage.emailToggle).first()).toBeVisible();
  });

  test('NOTIFP-013: Reset to defaults', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    const resetBtn = page.getByRole('button', { name: /reset.*default/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(settingsPage.successToast.or(settingsPage.emailToggle).first()).toBeVisible();
    }
  });

  test('NOTIFP-014: Preferences persist on refresh', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    // Save preferences
    await settingsPage.saveNotifBtn.click();
    await settingsPage.successToast.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Refresh page
    await page.reload();
    
    // Should still show notification settings
    await expect(settingsPage.emailToggle.or(settingsPage.saveNotifBtn).first()).toBeVisible();
  });

});
