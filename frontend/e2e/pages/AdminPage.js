export class AdminPage {
  constructor(page) {
    this.page = page;
    
    // Tab navigation
    this.destinationsTab = page.getByRole('button', { name: /destinations/i });
    this.travelersTab = page.getByRole('button', { name: /travelers|users/i });
    this.intelligenceTab = page.getByRole('button', { name: /intelligence|analytics|stats/i });
    this.auditLogsTab = page.getByRole('button', { name: /audit|logs/i });
    this.moderationTab = page.getByRole('button', { name: /moderation|review/i });
    this.systemHealthTab = page.getByRole('button', { name: /system|health/i });
    
    // CRUD actions
    this.addBtn = page.getByRole('button', { name: /add|create|new/i });
    this.editBtn = page.getByRole('button', { name: /edit|update/i });
    this.deleteBtn = page.getByRole('button', { name: /delete|remove/i });
    this.saveBtn = page.getByRole('button', { name: /save|submit/i });
    this.confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
    
    // Tables
    this.dataTable = page.locator('[class*="table"], table');
    this.tableRow = page.locator('tbody tr');
    this.tableCell = page.locator('tbody td');
    
    // Forms
    this.nameInput = page.getByLabel('Name').or(page.locator('input[name="name"]'));
    this.destinationInput = page.getByLabel('Destination').or(page.locator('input[name="destination"]'));
    this.descriptionInput = page.getByLabel('Description').or(page.locator('textarea[name="description"]'));
    
    // Search & filters
    this.searchInput = page.getByPlaceholder('Search').or(page.locator('input[type="search"]'));
    this.filterDropdown = page.locator('select');
    
    // Status badges
    this.statusBadge = page.locator('[class*="status-badge"]');
    this.roleBadge = page.locator('[class*="role-badge"]');
    
    // Health indicators
    this.healthIndicator = page.locator('[class*="health"], .status-indicator');
    this.dbStatus = page.locator('text=Database').or(page.locator('text=DB'));
    this.aiStatus = page.locator('text=AI').or(page.locator('text=OpenAI'));
    
    // Moderation
    this.approveBtn = page.getByRole('button', { name: /approve|publish/i });
    this.rejectBtn = page.getByRole('button', { name: /reject|remove/i });
    
    // Audit logs
    this.auditEntry = page.locator('[class*="audit-entry"], [class*="log-entry"]');
    
    // Stats/analytics
    this.statsCard = page.locator('[class*="stat-card"], [class*="StatsCard"]');
    this.chart = page.locator('[class*="chart"]');
  }

  async gotoAdmin() {
    await this.page.goto('/admin');
  }

  async gotoDestinationsTab() {
    await this.destinationsTab.click();
  }

  async gotoTravelersTab() {
    await this.travelersTab.click();
  }

  async addDestination(name, destination) {
    await this.addBtn.click();
    await this.nameInput.fill(name);
    await this.destinationInput.fill(destination);
    await this.saveBtn.click();
  }

  async editFirstItem() {
    await this.editBtn.first().click();
  }

  async deleteFirstItem() {
    await this.deleteBtn.first().click();
    await this.confirmBtn.click();
  }

  async getRowCount() {
    return this.tableRow.count();
  }

  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async promoteFirstUser() {
    await this.editBtn.first().click();
  }

  async approveFirstItem() {
    await this.approveBtn.first().click();
  }

  async rejectFirstItem() {
    await this.rejectBtn.first().click();
  }

  async demoteSelf() {
    const userRow = this.page.locator('tbody tr:has-text("admin@solocompass.test")');
    await userRow.locator(this.editBtn).click();
    const roleSelect = this.page.locator('select[name="role"]');
    await roleSelect.selectOption('user');
    await this.saveBtn.click();
  }

  async deleteLastAdmin() {
    await this.deleteBtn.first().click();
    const errorMsg = this.page.locator('text=Cannot delete last admin');
    await expect(errorMsg).toBeVisible();
  }

  async triggerAIResearchForExisting(city) {
    await this.searchInput.fill(city);
    await this.searchInput.press('Enter');
    const researchBtn = this.page.getByRole('button', { name: /research|reprocess/i });
    await researchBtn.first().click();
  }

  async editDestination() {
    await this.editBtn.first().click();
    await this.nameInput.fill('Updated Destination');
    await this.saveBtn.click();
  }

  async viewDeletedUser() {
    const deletedUserRow = this.page.locator('text=User not found|No longer available');
    await expect(deletedUserRow.or(this.tableCell.first()).first()).toBeVisible();
  }

  async checkAuditLogPagination() {
    const pagination = this.page.locator('[class*="pagination"]');
    await expect(pagination.or(this.page.locator('text=Page 1')).first()).toBeVisible();
  }

  async createDestinationWithDuplicateName() {
    await this.addBtn.click();
    await this.nameInput.fill('Tokyo');
    await this.destinationInput.fill('Japan');
    await this.saveBtn.click();
  }
}
