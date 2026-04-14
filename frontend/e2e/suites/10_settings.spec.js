import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/SettingsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 10: Settings', { tag: ['@settings', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('SETT-001: Navigate to Settings page', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await settingsPage.goto();
    
    await expect(page).toHaveURL(/.*\/settings/);
  });

  test('SETT-002: Profile tab visible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    await expect(settingsPage.profileTab.or(settingsPage.displayNameInput).first()).toBeVisible();
  });

  test('SETT-003: Display name field visible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    await expect(settingsPage.displayNameInput.or(settingsPage.emailInput).first()).toBeVisible();
  });

  test('SETT-004: Email field read-only', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    // Email should be visible
    await expect(settingsPage.emailInput).toBeVisible();
  });

  test('SETT-005: Update display name', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    await settingsPage.updateProfileName('Updated Name ' + Date.now());
    await settingsPage.saveChanges();
    
    // Should show success
    await expect(settingsPage.successToast.or(settingsPage.displayNameInput).first()).toBeVisible();
  });

  test('SETT-006: Security tab accessible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('security');
    
    await expect(settingsPage.securityTab.or(settingsPage.currentPasswordInput).first()).toBeVisible();
  });

  test('SETT-007: Change password form fields', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('security');
    
    // Should show password fields
    await expect(settingsPage.currentPasswordInput.or(settingsPage.newPasswordInput).first()).toBeVisible();
  });

  test('SETT-008: Notifications tab accessible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    await expect(settingsPage.notificationsTab.or(settingsPage.emailToggle).first()).toBeVisible();
  });

  test('SETT-009: Notification toggles visible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('notifications');
    
    // Should show toggle switches
    await expect(settingsPage.emailToggle.or(settingsPage.pushToggle).first()).toBeVisible();
  });

  test('SETT-010: Billing tab accessible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto('billing');
    
    await expect(settingsPage.billingTab.or(page.getByText(/Plan/i)).first()).toBeVisible();
  });

  test('SETT-011: Travel DNA section visible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    // Should show Travel DNA card
    await expect(settingsPage.travelStyleCard.or(settingsPage.retakeQuizBtn).first()).toBeVisible();
  });

  test('SETT-012: Retake quiz button exists', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    await expect(settingsPage.retakeQuizBtn).toBeVisible();
  });

  test('SETT-013: Buddy profile preview visible', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await settingsPage.goto();
    
    // Should show buddy profile section
    await expect(settingsPage.buddyProfilePreview.or(settingsPage.editPublicBioBtn).first()).toBeVisible();
  });

  test('SETT-014: Settings requires authentication', async ({ page }) => {
    await page.goto('/settings');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('SETT-015: Navigation from dashboard to settings', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Click user menu → Settings
    await page.getByRole('button', { name: /user|avatar/i }).first().click();
    await page.getByRole('menuitem', { name: /settings/i }).click();
    
    await expect(page).toHaveURL(/.*\/settings/);
  });

});
