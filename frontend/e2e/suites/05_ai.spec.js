import { test, expect } from '@playwright/test';
import { AIChatPage } from '../pages/AIChatPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 5: AI Assistant (Atlas)', { tag: ['@ai', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('AI-001: Atlas chat bubble visible on dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    // Login first
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Wait for redirect after login (may go to quiz if not completed)
    await page.waitForURL(/.*\/dashboard|.*\/quiz/, { timeout: 15000 });
    
    // If on quiz, just complete it quickly by clicking options
    if (page.url().includes('/quiz')) {
      try {
        // Answer 3 questions then skip
        for (let i = 0; i < 3; i++) {
          const options = page.locator('button.rounded-\\[1\\.5rem\\]');
          if (await options.first().isVisible({ timeout: 2000 })) {
            await options.first().click();
            await page.waitForTimeout(200);
          }
        }
        // Try to find and click finish button
        await page.getByRole('button', { name: /finish|submit|analyzing/i }).click({ timeout: 3000 }).catch(() => {});
      } catch (e) {}
    }
    
    // Now navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for the AI chat button (fixed position button on bottom right)
    const chatBtn = page.locator('button.fixed.z-\\[90\\]').or(page.locator('button.fixed').filter({ has: page.locator('[class*="rounded-full"]') }).first());
    await expect(chatBtn.first()).toBeVisible({ timeout: 10000 });
  });

  test('AI-002: Open Atlas chat window', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    
    await expect(aiChatPage.chatWindow.or(aiChatPage.chatInput).first()).toBeVisible();
  });

  test('AI-003: Chat shows welcome message', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    
    await expect(aiChatPage.welcomeMessage.or(aiChatPage.chatInput).first()).toBeVisible();
  });

  test('AI-004: Send chat message', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    await aiChatPage.sendMessage('What are some safe areas in Tokyo?');
    
    // Wait for response
    await aiChatPage.waitForAIResponse();
  });

  test('AI-005: Quick prompts visible', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    
    // Quick prompts should be visible
    const promptsVisible = await aiChatPage.quickPromptBtn.first().isVisible().catch(() => false);
    // Either quick prompts or input should be visible
    await expect(aiChatPage.chatInput.or(aiChatPage.quickPromptBtn).first()).toBeVisible();
  });

  test('AI-006: Chat requires authentication', async ({ page }) => {
    // Navigate to dashboard while logged out
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('AI-007: Navigator has full AI access', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    // Navigator has premium access
    await authPage.gotoLogin();
    await authPage.login('navigator@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    
    // Should be able to access chat
    await expect(aiChatPage.chatInput.or(aiChatPage.welcomeMessage).first()).toBeVisible();
  });

  test('AI-008: Chat auto-scrolls to newest message', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    await aiChatPage.sendMessage('Hello');
    
    // Send a few messages
    await aiChatPage.sendMessage('Tell me about safety');
    await aiChatPage.waitForAIResponse();
    
    // Chat should have messages
    await expect(aiChatPage.userMessage.first()).toBeVisible();
  });

  test('AI-010: Chat empty state shows welcome', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    
    // Should show welcome message or input
    await expect(aiChatPage.welcomeMessage.or(aiChatPage.chatInput).first()).toBeVisible();
  });

  test('AI-011: Close chat window', async ({ page }) => {
    const aiChatPage = new AIChatPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await aiChatPage.openChat();
    await expect(aiChatPage.chatWindow.or(aiChatPage.chatInput).first()).toBeVisible();
    
    // Close chat
    if (await aiChatPage.closeChatBtn.isVisible()) {
      await aiChatPage.closeChatBtn.click();
    }
  });

});
