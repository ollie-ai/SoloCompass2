export class BuddiesPage {
  constructor(page) {
    this.page = page;
    
    // Tab navigation
    this.discoverTab = page.getByRole('tab', { name: /discover|find/i });
    this.requestsTab = page.getByRole('tab', { name: /requests|incoming/i });
    this.connectionsTab = page.getByRole('tab', { name: /connections|friends/i });
    this.profileTab = page.getByRole('tab', { name: /profile|my profile/i });
    
    // Search
    this.searchInput = page.getByPlaceholder('Search destination').or(page.locator('input[name="destination"]'));
    this.searchBtn = page.getByRole('button', { name: /search|find/i });
    
    // Match cards
    this.matchCard = page.locator('[class*="match-card"], [class*="BuddyCard"]');
    this.connectBtn = page.getByRole('button', { name: /connect/i });
    this.skipBtn = page.getByRole('button', { name: /skip|pass/i });
    this.blockBtn = page.getByRole('button', { name: /block/i });
    
    // Request actions
    this.acceptBtn = page.getByRole('button', { name: /accept|approve/i });
    this.declineBtn = page.getByRole('button', { name: /decline|reject/i });
    
    // Connection card
    this.connectionCard = page.locator('[class*="connection"]');
    
    // Profile editing
    this.bioInput = page.locator('textarea[name="bio"]');
    this.travelStyleSelect = page.locator('select[name="travelStyle"]');
    this.destinationInput = page.getByLabel('Destination').or(page.locator('input[name="destination"]'));
    this.saveProfileBtn = page.getByRole('button', { name: /save|update/i });
    
    // Completeness
    this.completenessBar = page.locator('[class*="completeness"], text=% complete');
    
    // Empty states
    this.noMatchesState = page.locator('text=no matches|no travelers found');
    this.noRequestsState = page.locator('text=no requests|you\'re all caught up');
    this.noConnectionsState = page.locator('text=no connections|connect with travelers/i');
    
    // Badges
    this.requestBadge = page.locator('[class*="badge"]:has-text(")")');
  }

  async gotoBuddies() {
    await this.page.goto('/buddies');
  }

  async searchByDestination(destination) {
    await this.searchInput.fill(destination);
    await this.searchBtn.click();
  }

  async connectWithFirstMatch() {
    await this.connectBtn.first().click();
  }

  async skipFirstMatch() {
    await this.skipBtn.first().click();
  }

  async acceptFirstRequest() {
    await this.acceptBtn.first().click();
  }

  async declineFirstRequest() {
    await this.declineBtn.first().click();
  }

  async getMatchCount() {
    return this.matchCard.count();
  }

  async getRequestCount() {
    return this.requestBadge.textContent();
  }

  async updateProfile(bio, destination) {
    if (bio) await this.bioInput.fill(bio);
    if (destination) await this.destinationInput.fill(destination);
    await this.saveProfileBtn.click();
  }

  async sendConnectionRequest() {
    await this.connectBtn.first().click();
  }

  async sendConnectionRequestToSelf() {
    const myProfileCard = page.locator('[class*="profile"]:has-text("You")');
    const connectToSelfBtn = myProfileCard.getByRole('button', { name: /connect/i });
    await connectToSelfBtn.click();
  }

  async blockUser() {
    const firstMatch = this.matchCard.first();
    await firstMatch.hover();
    await this.blockBtn.first().click();
  }

  async viewConnectionDetails() {
    const firstConnection = this.connectionCard.first();
    await firstConnection.click();
  }

  async tryAcceptDeclinedRequest() {
    const oldRequest = page.locator('text=Request no longer available');
    if (await oldRequest.isVisible()) {
      await expect(oldRequest).toBeVisible();
    }
  }
}
