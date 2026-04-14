export class NotificationsPage {
  constructor(page) {
    this.page = page;
    
    // Bell icon & dropdown
    this.bellIcon = page.locator('[class*="bell"], [class*="notification-bell"]');
    this.notificationDropdown = page.locator('[class*="dropdown"]:has-text("Notifications")');
    
    // Badge
    this.unreadBadge = page.locator('[class*="badge"]:has-text(")""');
    
    // Notification list
    this.notificationItem = page.locator('[class*="notification-item"], [class*="NotificationItem"]');
    this.notificationTitle = page.locator('[class*="notification-title"]');
    this.notificationMessage = page.locator('[class*="notification-message"]');
    this.notificationTime = page.locator('[class*="notification-time"]');
    
    // Actions
    this.markReadBtn = page.getByRole('button', { name: /mark.*read|read/i });
    this.markAllReadBtn = page.getByRole('button', { name: /mark.*all.*read/i });
    this.deleteBtn = page.getByRole('button', { name: /delete|remove/i });
    
    // Full page
    this.notificationsPage = page.locator('[class*="notifications-page"], text=Notifications');
    this.filterDropdown = page.locator('select[name="filter"]');
    this.emptyState = page.locator('text=no notifications|you.*all caught up');
    
    // Navigation
    this.viewAllLink = page.getByRole('link', { name: /view all|see all/i });
  }

  async gotoNotifications() {
    await this.page.goto('/notifications');
  }

  async openNotificationDropdown() {
    await this.bellIcon.click();
  }

  async markFirstAsRead() {
    await this.markReadBtn.first().click();
  }

  async markAllAsRead() {
    await this.markAllReadBtn.click();
  }

  async deleteFirstNotification() {
    await this.deleteBtn.first().click();
  }

  async getNotificationCount() {
    return this.notificationItem.count();
  }

  async filterByType(type) {
    await this.filterDropdown.selectOption(type);
  }

  async hasUnreadBadge() {
    return this.unreadBadge.isVisible();
  }
}
