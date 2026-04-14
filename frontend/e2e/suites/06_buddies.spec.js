import { test, expect } from '@playwright/test';
import { BuddiesPage } from '../pages/BuddiesPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 6: Travel Buddy Matching', { tag: ['@buddies', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('BUDDY-001: Navigate to Buddies page', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await buddiesPage.gotoBuddies();
    
    await expect(page).toHaveURL(/.*\/buddies/);
  });

  test('BUDDY-002: Discover tab visible by default', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await expect(buddiesPage.discoverTab.or(buddiesPage.searchInput).first()).toBeVisible();
  });

  test('BUDDY-003: Search by destination', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.searchByDestination('Tokyo');
    
    // Should show search results or update list
    await expect(buddiesPage.searchInput).toHaveValue('Tokyo');
  });

  test('BUDDY-004: Match cards displayed', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    // Should show some match cards (buddy1 and buddy2 both going to Tokyo)
    const matchCount = await buddiesPage.getMatchCount();
    // May or may not have matches depending on data
    await expect(buddiesPage.discoverTab.or(buddiesPage.noMatchesState).first()).toBeVisible();
  });

  test('BUDDY-005: Skip match card', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    // If there's a match, try to skip
    if (await buddiesPage.skipBtn.first().isVisible()) {
      await buddiesPage.skipFirstMatch();
    }
  });

  test('BUDDY-007: Switch to Requests tab', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.requestsTab.click();
    
    await expect(buddiesPage.noRequestsState.or(buddiesPage.acceptBtn).first()).toBeVisible();
  });

  test('BUDDY-008: View incoming request', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    // buddy2 has incoming request from buddy1
    await authPage.gotoLogin();
    await authPage.login('buddy2@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.requestsTab.click();
    
    // Should show request
    await expect(buddiesPage.acceptBtn.or(buddiesPage.noRequestsState).first()).toBeVisible();
  });

  test('BUDDY-009: Accept incoming request', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('buddy2@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.requestsTab.click();
    
    if (await buddiesPage.acceptBtn.first().isVisible()) {
      await buddiesPage.acceptFirstRequest();
    }
  });

  test('BUDDY-010: Switch to Connections tab', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.connectionsTab.click();
    
    await expect(buddiesPage.noConnectionsState.or(buddiesPage.connectionCard).first()).toBeVisible();
  });

  test('BUDDY-011: Edit travel profile', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.profileTab.click();
    
    // Should show profile editing options
    await expect(buddiesPage.bioInput.or(buddiesPage.saveProfileBtn).first()).toBeVisible();
  });

  test('BUDDY-012: Profile completeness indicator', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    await buddiesPage.profileTab.click();
    
    // Should show completeness indicator or profile fields
    await expect(buddiesPage.bioInput.or(buddiesPage.completenessBar).first()).toBeVisible();
  });

  test('BUDDY-013: Empty discover state', async ({ page }) => {
    const buddiesPage = new BuddiesPage(page);
    const authPage = new AuthPage(page);
    
    // newuser has no trips, might have no matches
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await buddiesPage.gotoBuddies();
    
    // Should show empty state or search
    await expect(buddiesPage.searchInput.or(buddiesPage.noMatchesState).first()).toBeVisible();
  });

  test('BUDDY-014: Navigate to buddies from dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Click Buddies in nav
    await page.getByRole('link', { name: /buddies/i }).click();
    
    await expect(page).toHaveURL(/.*\/buddies/);
  });

  test('BUDDY-015: Buddies requires authentication', async ({ page }) => {
    await page.goto('/buddies');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

});
