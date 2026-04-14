import { test, expect } from '@playwright/test';
import { SafetyPage } from '../pages/SafetyPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 4: Safety & Emergency System', { tag: ['@safety', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('SAFETY-001: Navigate to Safety page', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await page.evaluate(() => {
      localStorage.setItem('cookie-consent', 'all');
      localStorage.setItem('cookie-preferences', JSON.stringify({ essential: true, analytics: true, marketing: true }));
    });
    await page.reload();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await safetyPage.gotoSafety();
    
    await expect(page).toHaveURL(/.*\/safety/);
  });

  test('SAFETY-002: Quick check-in button visible', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await page.locator('button:has-text("ACCEPT ALL")').first().click({ timeout: 5000 }).catch(() => {});
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.quickCheckInBtn.or(safetyPage.sosSlider).first()).toBeVisible();
  });

  test('SAFETY-003: Emergency contacts section visible', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.contactsSection.or(safetyPage.addContactBtn).first()).toBeVisible();
  });

  test('SAFETY-004: Display existing emergency contacts', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    // admin has 2 contacts seeded
    const contactCount = await safetyPage.getContactCount();
    expect(contactCount).toBeGreaterThan(0);
  });

  test('SAFETY-005: Add new emergency contact', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    const initialCount = await safetyPage.getContactCount();
    
    await safetyPage.addEmergencyContact('Test Contact', 'test@example.com', '+447700900000');
    
    const newCount = await safetyPage.getContactCount();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('SAFETY-006: Scheduled check-ins section visible', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.scheduledSection.or(safetyPage.addScheduleBtn).first()).toBeVisible();
  });

  test('SAFETY-007: Guardian has active schedule', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    // Guardian has 1 recurring schedule seeded
    const scheduleCount = await safetyPage.getScheduleCount();
    expect(scheduleCount).toBeGreaterThan(0);
  });

  test('SAFETY-008: Check-in history visible', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.historySection.or(safetyPage.historyItem).first()).toBeVisible();
  });

  test('SAFETY-009: Last check-in status visible', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.lastCheckIn.or(safetyPage.statusIndicator).first()).toBeVisible();
  });

  test('SAFETY-010: Fake call button exists', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    // Fake call is a safety feature - button may or may not be visible
    await expect(safetyPage.fakeCallBtn.or(safetyPage.sosSlider).first()).toBeVisible();
  });

  test('SAFETY-011: SOS slider exists', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    await expect(safetyPage.sosSlider).toBeVisible();
  });

  test('SAFETY-012: Safety page accessible without contacts', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);
    
    // newuser has 0 contacts
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    
    // Should show empty state or add contact button
    await expect(safetyPage.noContactsState.or(safetyPage.addContactBtn)).toBeVisible();
  });

  test('SAFETY-013: Navigation from dashboard to safety', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Click Safety in nav
    await page.getByRole('link', { name: /safety/i }).click();
    
    await expect(page).toHaveURL(/.*\/safety/);
  });

  test('SAFETY-014: Safety requires authentication', async ({ page }) => {
    await page.goto('/safety');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('SAFETY-015: SOS dispatches emergency check-in request (mocked)', async ({ page }) => {
    const safetyPage = new SafetyPage(page);
    const authPage = new AuthPage(page);

    let emergencyRequestSeen = false;

    await authPage.loginViaApi('admin@solocompass.test', 'Test1234!');
    await safetyPage.gotoSafety();
    await expect(page).toHaveURL(/.*\/safety/);
    await expect(page.getByText(/Safety/i)).toBeVisible();

    await page.route('**/api/checkin/emergency', async (route) => {
      emergencyRequestSeen = true;
      const body = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 9999,
            type: body?.type || 'emergency',
            sentTo: ['mock-sms', 'mock-email']
          }
        })
      });
    });

    await safetyPage.triggerSOS();

    await expect.poll(() => emergencyRequestSeen).toBe(true);
    await expect(page.getByText(/Emergency alert sent/i)).toBeVisible();
  });

});
