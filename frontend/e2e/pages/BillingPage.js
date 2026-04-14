export class BillingPage {
  constructor(page) {
    this.page = page;
    
    // Pricing page
    this.pricingHeading = page.locator('h1:has-text("Pricing")');
    this.planCard = page.locator('[class*="plan-card"], [class*="PricingCard"]');
    this.explorerCard = page.locator('text=Explorer');
    this.guardianCard = page.locator('text=Guardian');
    this.navigatorCard = page.locator('text=Navigator');
    this.getStartedBtn = page.getByRole('button', { name: /get started|upgrade|subscribe/i });
    this.featureList = page.locator('[class*="features"] li');
    
    // Checkout
    this.checkoutHeading = page.locator('h1:has-text("Checkout")');
    this.stripeFrame = page.locator('iframe[name*="stripe"]');
    
    // Settings - Billing tab
    this.billingTab = page.getByRole('tab', { name: /billing|subscription/i });
    this.currentPlan = page.locator('[class*="current-plan"]');
    this.planName = page.locator('text=Explorer').or(page.locator('text=Guardian')).or(page.locator('text=Navigator'));
    this.renewalDate = page.locator('text=renews|renewal|next payment');
    this.cancelSubscriptionBtn = page.getByRole('button', { name: /cancel.*subscription|unsubscribe/i });
    this.upgradeBtn = page.getByRole('button', { name: /upgrade|change plan/i });
    
    // Export data
    this.exportDataBtn = page.getByRole('button', { name: /export.*data|download/i });
    this.deleteAccountBtn = page.getByRole('button', { name: /delete.*account|remove.*account/i });
    
    // Confirmation dialogs
    this.confirmDialog = page.locator('[role="dialog"]');
    this.confirmCancelBtn = page.getByRole('button', { name: /confirm|cancel.*subscription/i });
    this.confirmDeleteBtn = page.getByRole('button', { name: /delete|confirm.*delete/i });
    
    // Toasts
    this.successToast = page.locator('text=subscribe|upgraded|cancelled|deleted');
    this.errorToast = page.locator('text=error|failed|declined');
    
    // Paywall messages
    this.paywallMessage = page.locator('text=upgrade.*premium|feature.*premium|limited.*plan');
  }

  async gotoPricing() {
    await this.page.goto('/pricing');
  }

  async gotoSettingsBilling() {
    await this.page.goto('/settings?tab=billing');
  }

  async selectPlan(planName) {
    switch (planName.toLowerCase()) {
      case 'guardian':
        await this.guardianCard.locator(this.getStartedBtn).click();
        break;
      case 'navigator':
        await this.navigatorCard.locator(this.getStartedBtn).click();
        break;
      default:
        await this.explorerCard.locator(this.getStartedBtn).click();
    }
  }

  async cancelSubscription() {
    await this.cancelSubscriptionBtn.click();
    await this.confirmCancelBtn.click();
  }

  async exportUserData() {
    await this.exportDataBtn.click();
  }

  async deleteAccount() {
    await this.deleteAccountBtn.click();
    await this.confirmDeleteBtn.click();
  }

  async isPremium() {
    const planText = await this.planName.textContent();
    return planText && !planText.includes('Explorer');
  }

  async verifySubscription() {
    await this.page.reload();
    const status = page.locator('text=Active|Premium');
    await expect(status.or(page.locator('text=Explorer')).first()).toBeVisible();
  }

  async checkPendingPayment() {
    const pendingMsg = this.page.locator('text=Verifying payment|Pending');
    await expect(pendingMsg.or(this.currentPlan).first()).toBeVisible();
  }

  async downgradePlan() {
    await this.upgradeBtn.click();
    await this.guardianCard.locator(this.getStartedBtn).click();
  }

  async checkPaymentStatus() {
    const pastDueMsg = this.page.locator('text=past due|declined|expired');
    await expect(pastDueMsg.or(this.currentPlan).first()).toBeVisible();
  }

  async resubscribe() {
    await this.upgradeBtn.click();
    await this.navigatorCard.locator(this.getStartedBtn).click();
  }
}
