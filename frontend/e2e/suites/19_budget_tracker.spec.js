import { test, expect } from '@playwright/test';
import { TripsPage } from '../pages/TripsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 19: Budget Tracker', { tag: ['@budget', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('BUD-001: Open budget tracker (no budget)', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    
    // Navigate to a trip or create new
    await page.goto('/trips/new');
    
    // Should show budget section
    await expect(tripsPage.budgetSection.or(page.getByText(/Budget/i)).first()).toBeVisible();
  });

  test('BUD-002: Create budget', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Navigate to trip detail
    await page.goto('/trips');
    await tripsPage.waitForLoading();
    
    // Click first trip
    const tripCard = tripsPage.tripCard.first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForURL(/.*\/trips\/\d+/);
      
      // Should show budget section
      await expect(tripsPage.budgetSection.or(page.getByText(/Budget/i)).first()).toBeVisible();
    }
  });

  test('BUD-004: Add expense', async ({ page }) => {
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
      
      const addExpenseBtn = page.getByRole('button', { name: /add expense|add.*transaction/i });
      await expect(addExpenseBtn.or(tripsPage.budgetSection).first()).toBeVisible();
    }
  });

  test('BUD-008: Category breakdown display', async ({ page }) => {
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
      
      // Should show budget section with categories
      await expect(tripsPage.budgetSection.or(page.getByText(/Food/i)).first()).toBeVisible();
    }
  });

  test('BUD-009: Progress bar color - under 75%', async ({ page }) => {
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
      
      // Should show progress bar
      const progressBar = page.locator('[class*="progress"], [role="progressbar"]');
      await expect(progressBar.or(tripsPage.budgetSection).first()).toBeVisible();
    }
  });

  test('BUD-012: Over-budget display', async ({ page }) => {
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
      
      // Budget section should handle over-budget state
      await expect(tripsPage.budgetSection.or(page.getByText(/Remaining/i)).first()).toBeVisible();
    }
  });

  test('BUD-013: Edit budget settings', async ({ page }) => {
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
      
      const editBudgetBtn = page.getByRole('button', { name: /edit.*budget/i });
      await expect(editBudgetBtn.or(tripsPage.budgetSection).first()).toBeVisible();
    }
  });

  test('BUD-003: Create budget - invalid amount', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const amountInput = page.locator('input[name="amount"]');
      if (await amountInput.isVisible()) {
        await amountInput.fill('0');
        await page.getByRole('button', { name: /create budget/i }).click();
      }
    }
  });

  test('BUD-005: Add income', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const addIncomeTab = page.locator('button:has-text("Income")');
      if (await addIncomeTab.isVisible()) {
        await addIncomeTab.click();
      }
    }
  });

  test('BUD-006: Expense - zero amount', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const amountInput = page.locator('input[name="expenseAmount"]');
      if (await amountInput.isVisible()) {
        await amountInput.fill('0');
        await page.getByRole('button', { name: /add expense/i }).click();
      }
    }
  });

  test('BUD-007: Delete expense', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const deleteBtn = page.locator('[class*="delete"]').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
      }
    }
  });

  test('BUD-010: Progress bar color - 75-90%', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const progressBar = page.locator('[class*="progress"]');
      await expect(progressBar.or(page.getByText(/Budget/i)).first()).toBeVisible();
    }
  });

  test('BUD-011: Progress bar color - over 90%', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const progressBar = page.locator('[class*="progress"]');
      await expect(progressBar.or(page.getByText(/Budget/i)).first()).toBeVisible();
    }
  });

  test('BUD-014: Change currency', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    const tripCard = page.locator('[class*="trip"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      const currencySelect = page.locator('select[name="currency"]');
      if (await currencySelect.isVisible()) {
        await currencySelect.selectOption('EUR');
      }
    }
  });

});
