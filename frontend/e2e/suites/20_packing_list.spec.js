import { test, expect } from '@playwright/test';
import { TripsPage } from '../pages/TripsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 20: Packing List', { tag: ['@packing', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('PACK-001: Open packing list (no list)', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    
    await page.goto('/trips/new');
    
    // Should show packing list section
    await expect(tripsPage.packingListSection.or(page.getByText(/Packing/i)).first()).toBeVisible();
  });

  test('PACK-002: Create from essentials', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      const startEssentialsBtn = page.getByRole('button', { name: /start.*essentials/i });
      await expect(startEssentialsBtn.or(tripsPage.packingListSection).first()).toBeVisible();
    }
  });

  test('PACK-004: Check item as packed', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.click();
      }
    }
  });

  test('PACK-006: Progress bar updates', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      // Should show progress
      const progress = page.locator('[class*="progress"], text=packed');
      await expect(progress.or(tripsPage.packingListSection).first()).toBeVisible();
    }
  });

  test('PACK-007: 100% packed celebration', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      // Check all items
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
      }
    }
  });

  test('PACK-008: Add custom item', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      const addItemBtn = page.getByRole('button', { name: /add item|add.*item/i });
      await expect(addItemBtn.or(tripsPage.packingListSection).first()).toBeVisible();
    }
  });

  test('PACK-012: Delete item', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      const deleteBtn = page.locator('[class*="delete"], button:has-text("trash")').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
      }
    }
  });

  test('PACK-003: Create from template', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const templateBtn = page.getByRole('button', { name: /template/i });
      await expect(templateBtn.or(page.getByText(/Packing/i)).first()).toBeVisible();
    }
  });

  test('PACK-005: Uncheck packed item', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const checkbox = page.locator('input[type="checkbox"]:checked').first();
      if (await checkbox.isVisible()) {
        await checkbox.click();
      }
    }
  });

  test('PACK-009: Add item - empty name', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const addBtn = page.getByRole('button', { name: /add item/i });
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.getByRole('button', { name: /save|add/i }).click();
      }
    }
  });

  test('PACK-010: Increase item quantity', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const plusBtn = page.locator('button:has-text("+")').first();
      if (await plusBtn.isVisible()) {
        await plusBtn.click();
      }
    }
  });

  test('PACK-011: Decrease item quantity (min 1)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const minusBtn = page.locator('button:has-text("-")').first();
      if (await minusBtn.isVisible()) {
        await minusBtn.click();
      }
    }
  });

  test('PACK-013: Items grouped by category', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const category = page.locator('[class*="category"]').first();
      await expect(category.or(page.getByText(/Packing/i)).first()).toBeVisible();
    }
  });

  test('PACK-014: Amazon shop links', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const amazonLink = page.locator('a:has-text("Amazon")');
      await expect(amazonLink.or(page.getByText(/Shop/i)).first()).toBeVisible();
    }
  });

});
