import { test, expect } from '@playwright/test';

test.describe('Suite 12: Public Pages & SEO', { tag: ['@public', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('PUB-001: Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByText(/Travel/i).or(page.getByText(/Solo/i)).first()).toBeVisible();
  });

  test('PUB-002: Features page', async ({ page }) => {
    await page.goto('/features');
    await expect(page).toHaveURL(/.*\/features/);
    await expect(page.getByText(/Features/i).or(page.getByText(/Safety/i)).first()).toBeVisible();
  });

  test('PUB-003: Safety info page', async ({ page }) => {
    await page.goto('/safety-info');
    await expect(page).toHaveURL(/.*\/safety-info/);
    await expect(page.getByText(/Safety/i).or(page.getByText(/Information/i)).first()).toBeVisible();
  });

  test('PUB-004: Help/FAQ page', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL(/.*\/help/);
    await expect(page.getByText(/Help/i).or(page.getByText(/FAQ/i)).first()).toBeVisible();
  });

  test('PUB-005: Terms of Service', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveURL(/.*\/terms/);
    await expect(page.getByText(/Terms/i).first()).toBeVisible();
  });

  test('PUB-006: Privacy Policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/.*\/privacy/);
    await expect(page.getByText(/Privacy/i).first()).toBeVisible();
  });

  test('PUB-007: Cookie Policy', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page).toHaveURL(/.*\/cookies/);
    await expect(page.getByText(/Cookie/i).first()).toBeVisible();
  });

  test('PUB-008: Cookie consent banner', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page.getByText(/cookies/i).first()).toBeVisible();
  });

  test('PUB-009: 404 handling', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    // Should redirect to home or show 404
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('PUB-010: Page titles & meta', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('PUB-011: Guardian acknowledge route resolves without home redirect', async ({ page }) => {
    await page.goto('/guardian/acknowledge/test-token');

    await expect(page).toHaveURL(/.*\/guardian\/acknowledge\/test-token/);
    await expect(
      page.getByText(/Processing your acknowledgement|Unable to Acknowledge|Guardian Confirmed/i).first()
    ).toBeVisible();
  });

  test('PUB-012: Guardian decline route resolves without home redirect', async ({ page }) => {
    await page.goto('/guardian/decline/test-token');

    await expect(page).toHaveURL(/.*\/guardian\/decline\/test-token/);
    await expect(
      page.getByText(/Guardian Request Declined|Failed to decline|Processing/i).first()
    ).toBeVisible();
  });

});
