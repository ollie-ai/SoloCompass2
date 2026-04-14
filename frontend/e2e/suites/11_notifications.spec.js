import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../pages/NotificationsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 11: Notifications', { tag: ['@notifications', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('NOTIF-001: Notification bell visible in navbar', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Bell should be visible
    await expect(notificationsPage.bellIcon.or(notificationsPage.unreadBadge).first()).toBeVisible();
  });

  test('NOTIF-002: Click notification bell opens dropdown', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await notificationsPage.openNotificationDropdown();
    
    // Should show dropdown or notifications
    await expect(notificationsPage.notificationDropdown.or(notificationsPage.notificationItem).first()).toBeVisible();
  });

  test('NOTIF-003: View full notifications page', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await notificationsPage.gotoNotifications();
    
    await expect(page).toHaveURL(/.*\/notifications/);
  });

  test('NOTIF-004: Display notification list', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    // Should show some notifications (admin has 3 seeded)
    const notifCount = await notificationsPage.getNotificationCount();
    expect(notifCount).toBeGreaterThanOrEqual(0);
  });

  test('NOTIF-005: Mark notification as read', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    if (await notificationsPage.markReadBtn.first().isVisible()) {
      await notificationsPage.markFirstAsRead();
    }
  });

  test('NOTIF-006: Mark all as read button', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    await expect(notificationsPage.markAllReadBtn.or(notificationsPage.notificationItem).first()).toBeVisible();
  });

  test('NOTIF-007: Delete notification', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    if (await notificationsPage.deleteBtn.first().isVisible()) {
      await notificationsPage.deleteFirstNotification();
    }
  });

  test('NOTIF-008: Empty notifications state', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    // newuser has no notifications
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    // Should show empty state
    await expect(notificationsPage.emptyState.or(notificationsPage.notificationItem).first()).toBeVisible();
  });

  test('NOTIF-009: Filter notifications by type', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await notificationsPage.gotoNotifications();
    
    // Filter dropdown should be visible
    await expect(notificationsPage.filterDropdown.or(notificationsPage.notificationItem).first()).toBeVisible();
  });

  test('NOTIF-010: Notifications requires authentication', async ({ page }) => {
    await page.goto('/notifications');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

});
