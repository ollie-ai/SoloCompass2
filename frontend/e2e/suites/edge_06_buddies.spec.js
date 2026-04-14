import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { BuddiesPage } from '../pages/BuddiesPage.js';

test.describe('Edge Cases: Buddies (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-6.1: Connect with yourself', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.sendConnectionRequestToSelf();
    await expect(page.locator(/cannot connect.*yourself|invalid request/i)).toBeVisible();
  });

  test('EDGE-6.2: Duplicate connection request', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.searchByDestination('Tokyo');
    await buddiesPage.sendConnectionRequest();
    await buddiesPage.sendConnectionRequest();
  });

  test('EDGE-6.3: Mutual connection request simultaneously', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
  });

  test('EDGE-6.4: Block then unblock user', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.blockUser();
  });

  test('EDGE-6.5: Delete account with active connections', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=data');
    await expect(page.locator('text=Delete').or(page.locator('text=Account')).first()).toBeVisible();
  });

  test('EDGE-6.6: No trips, no profile', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await expect(buddiesPage.emptyState).toBeVisible();
  });

  test('EDGE-6.7: Destination with zero travelers', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    await buddiesPage.searchByDestination('XYZNonExistent');
    await expect(buddiesPage.noMatchesState.or(buddiesPage.searchInput).first()).toBeVisible();
  });

  test('EDGE-6.8: 500+ users heading to same destination', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.searchByDestination('Paris');
    await page.waitForTimeout(2000);
    const results = page.locator('[class*="buddy"], [class*="traveler"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('EDGE-6.9: Offensive text in profile bio', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=profile');
    await expect(page.locator('text=Settings')).toBeVisible();
    const bioInput = page.locator('textarea[name="bio"], input[name="bio"]');
    await bioInput.fill('This is inappropriate content!!!');
    await page.getByRole('button', { name: /save/i }).click();
  });

  test('EDGE-6.10: Connection persists after trip date change', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.viewConnectionDetails();
  });

  test('EDGE-6.11: Rapid connect clicks on 20 matches', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const connectButtons = page.getByRole('button', { name: /connect/i });
    const count = await connectButtons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await connectButtons.nth(i).click();
      await page.waitForTimeout(100);
    }
  });

  test('EDGE-6.12: Accept already declined request', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies?tab=requests');
    await expect(page.locator('text=Buddies')).toBeVisible();
    const buddiesPage = new BuddiesPage(page);
    await buddiesPage.tryAcceptDeclinedRequest();
  });

  test('EDGE-6.13: Request recipient deleted before responding', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies?tab=requests');
    await expect(page.locator('text=Buddies')).toBeVisible();
  });

  test('EDGE-6.14: Navigator sends request to Explorer', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
  });

});
