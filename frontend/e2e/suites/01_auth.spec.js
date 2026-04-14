import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 1: Authentication & Onboarding', { tag: ['@auth', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test for clean state
    await page.context().clearCookies();
  });

  test('AUTH-001: Register requires secure password', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    
    // Password without special character
    await authPage.register('Test User', 'test.secure@solocompass.test', 'WeakPassword1');
    
    await expect(authPage.errorMsg).toHaveText(/at least one special character/i);
  });

  test('AUTH-002: Register with duplicate email', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    
    // Try to register with the seeded admin email
    await authPage.register('Admin User', 'admin@solocompass.test', 'Test1234!');
    
    await expect(authPage.errorMsg).toHaveText(/already registered|email.*already/i);
  });

  test('AUTH-003: Register with weak password (too short)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    
    await authPage.register('Test User', 'newuser@test.com', 'Short1!');
    
    await expect(authPage.errorMsg).toHaveText(/at least 8 characters/i);
  });

  test('AUTH-004: Register with empty fields', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    
    // Click register without filling any fields
    await page.getByRole('button', { name: /get started free|create account/i }).click();
    
    // Check for validation messages
    const nameError = page.getByText('Name is required');
    const emailError = page.getByText('Email is required');
    const passwordError = page.getByText('Password is required');
    
    await expect(nameError.or(emailError).or(passwordError)).toBeVisible();
  });

  test('AUTH-005: Register with invalid email format', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();
    
    await authPage.register('Test User', 'notanemail', 'Test1234!');
    
    await expect(authPage.errorMsg).toHaveText(/valid email/i);
  });

  test('AUTH-006: Successful Login redirects to dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Admin User' }).first()).toBeVisible();
  });

  test('AUTH-007: Login with valid credentials', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    await authPage.login('guardian@solocompass.test', 'Test1234!');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Grace Guardian' }).first()).toBeVisible();
  });

  test('AUTH-008: Failed Login shows invalid credentials', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    await authPage.login('admin@solocompass.test', 'WRONGPASSWORD123!');
    
    await expect(authPage.errorMsg).toHaveText(/invalid credentials|invalid email|incorrect/i);
  });

  test('AUTH-009: Login with non-existent email', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    await authPage.login('nonexistent@test.com', 'Test1234!');
    
    await expect(authPage.errorMsg).toHaveText(/invalid credentials|invalid email|not found/i);
  });

  test('AUTH-010: Login persists on refresh', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Refresh the page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Admin User' }).first()).toBeVisible();
  });

  test('AUTH-011: Login redirects from protected routes', async ({ page }) => {
    // Try to navigate to protected route while logged out
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('AUTH-012: Google OAuth login button exists', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    
    // Check for Google OAuth button
    const googleBtn = page.getByRole('button', { name: /google|continue with google/i });
    await expect(googleBtn).toBeVisible();
  });

  test('AUTH-014: Request password reset', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.getByLabel('Email Address').fill('admin@solocompass.test');
    await page.getByRole('button', { name: /send|reset|submit/i }).click();
    
    // Should show success message
    await expect(page.getByText(/Check your email/i)).toBeVisible();
  });

  test('AUTH-018: Logout clears session', async ({ page }) => {
    // First login
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Click user menu → Logout
    const userMenu = page.getByRole('button', { name: /admin|user|avatar/i }).first();
    await userMenu.click();
    
    const logoutBtn = page.getByRole('menuitem', { name: /logout|sign out/i });
    await logoutBtn.click();
    
    // Should redirect to home
    await expect(page).toHaveURL(/.*\/$/);
    
    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('AUTH-021: Complete quiz', async ({ page }) => {
    await page.goto('/quiz');
    
    // Quiz should be visible without login
    await expect(page.getByRole('heading', { name: /Travel DNA/i })).toBeVisible();
    
    // Answer all 7 questions (data-driven approach)
    const questions = await page.locator('[data-question]').count();
    
    for (let i = 0; i < Math.min(questions, 7); i++) {
      // Select first option for each question
      const firstOption = page.locator('[data-question]').nth(i).locator('button').first();
      await firstOption.click();
      
      // Click next
      const nextBtn = page.getByRole('button', { name: /next|continue/i });
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }
    
    // Submit quiz
    const submitBtn = page.getByRole('button', { name: /see results|submit|complete/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show results
      await expect(page.getByText(/Your Travel DNA/i)).toBeVisible();
    }
  });

  test('AUTH-024: Quiz accessible without auth', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    await page.goto('/quiz');
    
    // Quiz should load (either show questions or loading state)
    await expect(page.getByRole('heading', { name: /Travel DNA|Discover Your/i })).toBeVisible();
  });

});
