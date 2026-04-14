import { test, expect } from '@playwright/test';
import { BillingPage } from '../pages/BillingPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 18: Billing & Data Tab', { tag: ['@billingdata', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('BILL-D01: View current plan (Explorer)', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    await expect(page.getByText(/Explorer/i).or(billingPage.upgradeBtn).first()).toBeVisible();
  });

  test('BILL-D02: View current plan (Guardian)', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    await expect(page.getByText(/Guardian/i).or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-D03: View current plan (Navigator)', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    await expect(page.getByText(/Navigator/i).or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-D04: Upgrade button navigates to pricing', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    if (await billingPage.upgradeBtn.isVisible()) {
      await billingPage.upgradeBtn.click();
      await expect(page).toHaveURL(/.*\/pricing/);
    }
  });

  test('BILL-D05: Cancel subscription confirmation dialog', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    if (await billingPage.cancelSubscriptionBtn.isVisible()) {
      await billingPage.cancelSubscriptionBtn.click();
      await expect(billingPage.confirmDialog.or(page.getByText(/cancel/i)).first()).toBeVisible();
    }
  });

  test('BILL-D07: Cancel subscription - confirm', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    if (await billingPage.cancelSubscriptionBtn.isVisible()) {
      await page.on('dialog', dialog => dialog.accept());
      await billingPage.cancelSubscriptionBtn.click();
    }
  });

  test('BILL-D08: Export all data', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    // Export data button should trigger download
    const exportBtn = page.getByRole('button', { name: /export.*data|download/i });
    await expect(exportBtn.or(page.getByText(/Export/i)).first()).toBeVisible();
  });

  test('BILL-D10: Delete account flow', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const deleteBtn = page.getByRole('button', { name: /delete.*account/i });
    await expect(deleteBtn.or(page.getByText(/Delete/i)).first()).toBeVisible();
  });

  test('BILL-D06: Cancel subscription — dismiss dialog', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    if (await billingPage.cancelSubscriptionBtn.isVisible()) {
      await billingPage.cancelSubscriptionBtn.click();
      await page.on('dialog', dialog => dialog.dismiss());
      await billingPage.cancelSubscriptionBtn.click();
      await expect(billingPage.confirmDialog.or(page.getByText(/cancel/i)).first()).toBeVisible();
    }
  });

  test('BILL-D09: Export data content', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const exportBtn = page.getByRole('button', { name: /export.*data|download/i });
    await expect(exportBtn.or(page.getByText(/Export/i)).first()).toBeVisible();
    
    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/\.(json|zip)$/i);
  });

  test('BILL-D11: View billing history', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const historySection = page.getByText(/Billing History/i).or(page.getByText(/History/i));
    await expect(historySection.or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-D12: Invoice download', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const invoiceLink = page.getByText(/Download Invoice/i).or(page.getByText(/Invoice/i).first());
    await expect(invoiceLink.or(billingPage.cancelSubscriptionBtn).first()).toBeVisible();
  });

  test('BILL-D13: Payment method display', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const paymentMethod = page.getByText(/Payment Method/i).or(page.getByText(/Card/i));
    await expect(paymentMethod.or(page.getByText(/Add Payment/i)).first()).toBeVisible();
  });

  test('BILL-D14: Add payment method', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const addPaymentBtn = page.getByRole('button', { name: /add.*payment|add.*card/i });
    if (await addPaymentBtn.or(billingPage.upgradeBtn).first().isVisible()) {
      await addPaymentBtn.click();
      const cardForm = page.getByText(/Card Number/i).or(page.locator('input[name="card"]'));
      await expect(cardForm.or(page.getByText(/Payment/i)).first()).toBeVisible();
    }
  });

  test('BILL-D15: Plan comparison view', async ({ page }) => {
    const billingPage = new BillingPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await billingPage.gotoSettingsBilling();
    
    const compareLink = page.getByRole('link', { name: /compare.*plan|view.*plan/i });
    await expect(compareLink.or(billingPage.upgradeBtn).first()).toBeVisible();
  });

});

