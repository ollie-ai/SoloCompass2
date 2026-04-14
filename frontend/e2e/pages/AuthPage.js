export class AuthPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Login form selectors - use id selector to avoid strict mode violations with password toggle button
    this.emailInput = page.getByLabel('Email Address');
    // Use placeholder selector to avoid strict mode violation with password toggle button
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginSubmitBtn = page.getByRole('button', { name: /sign in/i });
    this.acceptAllBtn = page.getByRole('button', { name: /accept all/i });
    this.errorMsg = page.locator('[role="alert"]');
    
    // Register form selectors
    this.regNameInput = page.getByLabel('Full Name');
    this.regEmailInput = page.getByLabel('Email Address');
    // Use placeholder selector to avoid strict mode violation with password toggle button
    this.regPasswordInput = page.getByLabel('Password', { exact: true });
    this.regSubmitBtn = page.getByRole('button', { name: /get started free|create account/i });
  }

  async gotoLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.evaluate(() => {
      localStorage.setItem('cookie-consent', 'all');
      localStorage.setItem('cookie-preferences', JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
      }));
    });
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
    await this.acceptCookies();
  }

  async gotoRegister() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.evaluate(() => {
      localStorage.setItem('cookie-consent', 'all');
      localStorage.setItem('cookie-preferences', JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
      }));
    });
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
    await this.acceptCookies();
  }

  async acceptCookies() {
    const acceptBtn = this.page.getByRole('button', { name: /accept all/i }).first();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const visible = await acceptBtn.isVisible().catch(() => false);
        if (!visible) {
          return;
        }

        await acceptBtn.click({ force: true, timeout: 3000 });
        await acceptBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

        const stillVisible = await acceptBtn.isVisible().catch(() => false);
        if (!stillVisible) {
          return;
        }
      } catch {
        // Ignore transient banner timing issues and retry.
      }

      await this.page.waitForTimeout(500);
    }
  }

  async login(email, password) {
    await this.acceptCookies();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.acceptCookies();
    await this.loginSubmitBtn.click();
    await this.page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 }).catch(() => {});
  }

  async loginViaApi(email, password) {
    const response = await this.page.request.post('/api/auth/login', {
      data: { email, password },
    });

    if (!response.ok()) {
      throw new Error(`API login failed with status ${response.status()}`);
    }

    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async register(name, email, password) {
    // Wait for the register form to be fully loaded
    await this.regNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.regNameInput.fill(name);
    await this.regEmailInput.fill(email);
    await this.regPasswordInput.fill(password);
    await this.regSubmitBtn.click();
  }
}
