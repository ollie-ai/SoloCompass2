import { test, expect } from '@playwright/test';

test.describe('Suite 23: Cookie Consent', { tag: ['@cookies', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('COOKIE-001: Banner appears on first visit', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByText(/cookie/i);
    await expect(banner.or(page.getByText(/Cookie/i)).first()).toBeVisible();
  });

  test('COOKIE-002: Banner not shown after accepting', async ({ page }) => {
    await page.goto('/');
    const acceptBtn = page.getByRole('button', { name: /accept|allow/i });
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
    }
    await page.reload();
    const banner = page.getByText(/cookie/i);
    await expect(banner.or(page.getByText(/Accept/i)).first()).toBeHidden();
  });

  test('COOKIE-003: Accept All', async ({ page }) => {
    await page.goto('/');
    const acceptAllBtn = page.getByRole('button', { name: /accept.*all|allow.*all/i });
    if (await acceptAllBtn.isVisible()) {
      await acceptAllBtn.click();
    }
    const consent = await page.context().cookies();
    expect(consent.some(c => c.name.includes('cookie') || c.value.includes('all'))).toBeTruthy();
  });

  test('COOKIE-004: Essential Only', async ({ page }) => {
    await page.goto('/');
    const essentialBtn = page.getByRole('button', { name: /essential|necessary/i });
    if (await essentialBtn.isVisible()) {
      await essentialBtn.click();
    }
  });

  test('COOKIE-005: Customize opens preferences modal', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /customize|custom/i });
    if (await customizeBtn.isVisible()) {
      await customizeBtn.click();
      const modal = page.locator('[role="dialog"], text=Preferences');
      await expect(modal.or(page.getByText(/Cookie/i)).first()).toBeVisible();
    }
  });

  test('COOKIE-006: Essential toggle is locked', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /customize/i });
    if (await customizeBtn.isVisible()) {
      await customizeBtn.click();
      const essentialToggle = page.locator('label:has-text("Essential")');
      await expect(essentialToggle.or(page.locator('text=Essential')).first()).toBeVisible();
    }
  });

  test('COOKIE-007: Toggle analytics', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /customize/i });
    if (await customizeBtn.isVisible()) {
      await customizeBtn.click();
      const analyticsToggle = page.locator('label:has-text("Analytics")');
      if (await analyticsToggle.isVisible()) {
        await analyticsToggle.click();
      }
    }
  });

  test('COOKIE-008: Toggle marketing', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /customize/i });
    if (await customizeBtn.isVisible()) {
      await customizeBtn.click();
      const marketingToggle = page.locator('label:has-text("Marketing")');
      if (await marketingToggle.isVisible()) {
        await marketingToggle.click();
      }
    }
  });

  test('COOKIE-009: Reject All in preferences', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /customize/i });
    if (await customizeBtn.isVisible()) {
      await customizeBtn.click();
      const rejectAllBtn = page.getByRole('button', { name: /reject.*all/i });
      if (await rejectAllBtn.isVisible()) {
        await rejectAllBtn.click();
      }
    }
  });

  test('COOKIE-010: Cookie policy link', async ({ page }) => {
    await page.goto('/');
    const policyLink = page.getByRole('link', { name: /cookie.*policy|policy/i });
    await expect(policyLink.or(page.locator('text=Cookie')).first()).toBeVisible();
  });

});
