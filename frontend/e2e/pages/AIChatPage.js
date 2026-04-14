export class AIChatPage {
  constructor(page) {
    this.page = page;
    
    // Chat bubble (floating) - look for fixed position button with Sparkle icon
    this.chatBubble = page.locator('button.fixed.z-\\[90\\]');
    this.chatButton = page.locator('[class*="fixed"][class*="z-\\"][class*="rounded-full"]');
    
    // Chat window
    this.chatWindow = page.locator('[class*="fixed"][class*="z-\\[100\\]"]');
    this.chatInput = page.locator('input[placeholder*="Ask"], textarea[name="message"]');
    this.sendButton = page.getByRole('button', { name: /send|submit/i });
    this.sendBtn = page.getByRole('button', { name: /send|submit/i });
    this.closeChatBtn = page.getByRole('button', { name: /close|minimize/i });
    
    // Messages
    this.welcomeMessage = page.locator('text=Welcome to Atlas');
    this.userMessage = page.locator('[class*="user-message"], [class*="user-msg"]');
    this.aiMessage = page.locator('[class*="ai-message"], [class*="assistant-message"]');
    
    // Quick prompts
    this.quickPromptBtn = page.locator('[class*="quick-prompt"], button:has-text("?")');
    
    // Loading
    this.chatLoading = page.locator('[class*="typing"], text=Atlas is thinking');
    this.loadingIndicator = page.locator('[class*="loading"], text=thinking');
    
    // Errors
    this.upgradePrompt = page.locator(/upgrade.*navigator|feature.*premium/i);
    this.errorMessage = page.locator('text=something went wrong|error');
  }

  async openChat() {
    if (await this.chatButton.isVisible()) {
      await this.chatButton.click();
    } else if (await this.chatBubble.isVisible()) {
      await this.chatBubble.click();
    }
  }

  async sendMessage(message) {
    await this.chatInput.fill(message);
    await this.sendBtn.click();
  }

  async waitForAIResponse() {
    await this.page.waitForSelector(this.aiMessage, { state: 'visible', timeout: 15000 }).catch(() => {});
  }

  async isChatOpen() {
    return this.chatWindow.isVisible();
  }

  async clickQuickPrompt(promptIndex = 0) {
    await this.quickPromptBtn.nth(promptIndex).click();
  }

  async getLastAIResponse() {
    const messages = this.aiMessage.all();
    if (messages.length > 0) {
      return messages[messages.length - 1].textContent();
    }
    return '';
  }
}
