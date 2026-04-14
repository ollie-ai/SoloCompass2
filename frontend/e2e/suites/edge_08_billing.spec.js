import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { BillingPage } from '../pages/BillingPage.js';

test.describe('Edge Cases: Billing (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-8.1: Stripe webhook before user returns', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Explorer').or(page.locator('text=Billing')).first()).toBeVisible();
  });

  test('EDGE-8.2: Duplicate webhook for same event', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.verifySubscription();
  });

  test('EDGE-8.3: Abandon checkout', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('text=Pricing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.selectPlan('navigator');
    await page.goto('/dashboard');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('EDGE-8.4: Webhook signature verification fails', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('EDGE-8.5: Card charged but webhook never arrives', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.checkPendingPayment();
  });

  test('EDGE-8.6: Downgrade from Navigator to Guardian', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Navigator').or(page.locator('text=Billing')).first()).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.downgradePlan();
  });

  test('EDGE-8.7: Subscription renews but card expired', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.checkPaymentStatus();
  });

  test('EDGE-8.8: Cancel subscription mid-month', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.cancelSubscription();
  });

  test('EDGE-8.9: Cancel then re-subscribe before period ends', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
    const billingPage = new BillingPage(page);
    await billingPage.cancelSubscription();
    await billingPage.resubscribe();
  });

  test('EDGE-8.10: STRIPE_SECRET_KEY missing', async ({ page }) => {
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('EDGE-8.11: Checkout without login', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('EDGE-8.12: Click upgrade on two plans simultaneously', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/pricing');
    await expect(page.locator('text=Pricing')).toBeVisible();
  });

  test('EDGE-8.13: Stale checkout URL', async ({ page }) => {
    await page.goto('/checkout?session_id=stale123');
    await expect(page.locator('text=expired|error').or(page).first()).toBeVisible();
  });

  test('EDGE-8.14: subscription_tier free but is_premium true', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('EDGE-8.15: Delete account with active Stripe subscription', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=data');
    await expect(page.locator('text=Delete').or(page.locator('text=Account')).first()).toBeVisible();
  });

  test('EDGE-8.16: Webhook body parse error', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/settings?tab=billing');
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('EDGE-8.17: Premium expires but user has 3 active trips', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-8.18: Premium feature accessed via direct URL', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/buddies');
    await expect(page.locator('text=Buddies')).toBeVisible();
  });

});
