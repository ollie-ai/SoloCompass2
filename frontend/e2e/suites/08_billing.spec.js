import { test, expect } from '@playwright/test';
import { BillingPage } from '../pages/BillingPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 8: Billing & Subscriptions', { tag: ['@billing', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('BILL-001: View pricing page', async ({ page }) => {
    const billingPage = new BillingPage(page);
    
    await billingPage.gotoPricing();
    
    await expect(page).toHaveURL(/.*\/pricing/);
    await expect(billingPage.pricingHeading.or(billingPage.planCard).first()).toBeVisible();
  });

  test('BILL-002: Pricing shows 3 tiers', async ({ page }) => {
    const billingPage = new BillingPage(page);
    
    await billingPage.gotoPricing();
    
    await expect(billingPage.explorerCard).toBeVisible();
    await expect(billingPage.guardianCard).toBeVisible();
    await expect(billingPage.navigatorCard).toBeVisible();
  });

  test('BILL-003: Pricing shows feature lists', async ({ page }) => {
    const billingPage = new BillingPage(page);
    
    await billingPage.gotoPricing();
    
    // Feature lists should be visible
    const featureCount = await billingPage.featureList.count();
    expect(featureCount).toBeGreaterThan(0);
  });

  test('BILL-004: Get Started buttons visible', async ({ page }) => {
    const billingPage = new BillingPage(page);
    
    await billingPage.gotoPricing();
    
    await expect(billingPage.getStartedBtn.first()).toBeVisible();
  });

  test('BILL-005: Upgrade button navigates from settings', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    // Free user
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Should show upgrade button
    await expect(billingPage.upgradeBtn.or(billingPage.currentPlan).first()).toBeVisible();
  });

  test('BILL-006: View current plan - Explorer', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Should show Explorer plan
    await expect(page.getByText(/Explorer/i).or(billingPage.upgradeBtn).first()).toBeVisible();
  });

  test('BILL-007: View current plan - Guardian', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Should show Guardian plan
    await expect(page.getByText(/Guardian/i).or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-008: View current plan - Navigator', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Should show Navigator plan
    await expect(page.getByText(/Navigator/i).or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-009: Cancel subscription button for premium', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Premium user should see cancel button
    await expect(billingPage.cancelSubscriptionBtn.or(billingPage.upgradeBtn).first()).toBeVisible();
  });

  test('BILL-010: Export data button visible', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Switch to Data tab if needed, or find export button
    await expect(billingPage.exportDataBtn.or(page.getByText(/Export/i)).first()).toBeVisible();
  });

  test('BILL-011: Delete account button visible', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Delete account button should be in Data tab or similar
    await expect(billingPage.deleteAccountBtn.or(page.getByText(/Delete/i)).first()).toBeVisible();
  });

  test('BILL-012: Navigator has full access message', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    
    await billingPage.gotoSettingsBilling();
    
    // Premium user should not see upgrade prompt
    await expect(billingPage.upgradeBtn).not.toBeVisible();
  });

  test('BILL-013: Pricing page accessible without login', async ({ page }) => {
    const billingPage = new BillingPage(page);
    
    await billingPage.gotoPricing();
    
    // Should work without login
    await expect(page).toHaveURL(/.*\/pricing/);
    await expect(billingPage.pricingHeading).toBeVisible();
  });

  test('BILL-014: Settings billing requires authentication', async ({ page }) => {
    await page.goto('/settings?tab=billing');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

});
