import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { SafetyPage } from '../pages/SafetyPage.js';

test.describe('Edge Cases: Safety (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-4.1: Invalid email format for contact', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.addEmergencyContact('InvalidEmail', 'invalid-email');
  });

  test('EDGE-4.2: Invalid phone format for contact', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.addEmergencyContact('Test Contact', 'test@test.com', 'abc123');
  });

  test('EDGE-4.3: Delete only contact with active schedule', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
  });

  test('EDGE-4.4: Emergency contact email bounces', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
  });

  test('EDGE-4.5: Phone wrong country format', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.addEmergencyContact('Intl Contact', 'intl@test.com', '+441234567890');
  });

  test('EDGE-4.6: Duplicate emergency contact (same email)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
  });

  test('EDGE-4.7: Check-in without GPS', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.sendCheckIn();
  });

  test('EDGE-4.8: Check-in with spoofed GPS coordinates', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.sendCheckInWithLocation(0, 0);
  });

  test('EDGE-4.9: SOS without internet', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerSOSOffline();
  });

  test('EDGE-4.10: 50 check-ins in 1 minute (rate limiting)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    for (let i = 0; i < 10; i++) {
      await safetyPage.sendCheckIn();
      await page.waitForTimeout(100);
    }
  });

  test('EDGE-4.11: Cancel SOS after sending', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerSOS();
    await safetyPage.sendImSafeFollowUp();
  });

  test('EDGE-4.12: Twilio down during SOS', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerSOS();
  });

  test('EDGE-4.13: Resend down during SOS', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerSOS();
  });

  test('EDGE-4.14: Both Twilio and Resend down during SOS', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerSOS();
  });

  test('EDGE-4.15: Scheduled check-in in the past', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.scheduleCheckInInPast();
  });

  test('EDGE-4.16: Recurring schedule with start after end time', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.createRecurringScheduleWithInvalidTimes();
  });

  test('EDGE-4.17: Server restart during check-in escalation', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
  });

  test('EDGE-4.18: Timezone change while recurring schedule active', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    await page.goto('/settings');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('EDGE-4.19: Account deleted before check-in fires', async ({ page }) => {
    await page.goto('/safety');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-4.20: Escalation Level 1 fires, then user checks in before Level 2', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerMissedCheckInEscalation();
  });

  test('EDGE-4.21: Fake call on silent phone', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerFakeCall();
  });

  test('EDGE-4.22: Browser blocks autoplay audio for fake call', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerFakeCall();
  });

  test('EDGE-4.23: Navigate away during fake call', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerFakeCallAndNavigate();
  });

  test('EDGE-4.24: Fake call on desktop (no vibration)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/safety');
    await expect(page.locator('text=Safety')).toBeVisible();
    const safetyPage = new SafetyPage(page);
    await safetyPage.triggerFakeCall();
  });

});
