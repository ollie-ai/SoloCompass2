import db from '../db.js';
import logger from './logger.js';

export async function createNotification({ userId, type, title, message, data, relatedId }) {
  try {
    const result = await db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, data, related_id, is_read)
      VALUES (?, ?, ?, ?, ?, ?, false)
    `).run(userId, type, title, message, JSON.stringify(data || {}), relatedId || null);

    return { id: result.lastInsertRowid, userId, type, title, message, data, relatedId };
  } catch (err) {
    logger.error(`[Notification] Error creating notification: ${err.message}`);
    return null;
  }
}

export async function getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
  try {
    const where = unreadOnly ? 'WHERE user_id = ? AND is_read = false' : 'WHERE user_id = ?';
    const notifications = await db.prepare(`
      SELECT * FROM notifications ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const countResult = await db.prepare(`
      SELECT COUNT(*) as count FROM notifications ${where}
    `).get(userId);

    return {
      notifications,
      total: countResult.count,
      unread: unreadOnly ? countResult.count : await getUnreadCount(userId)
    };
  } catch (err) {
    logger.error(`[Notification] Error fetching notifications: ${err.message}`);
    return { notifications: [], total: 0, unread: 0 };
  }
}

export async function markNotificationRead(notificationId, userId) {
  try {
    await db.prepare(`
      UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?
    `).run(notificationId, userId);
    return true;
  } catch (err) {
    logger.error(`[Notification] Error marking read: ${err.message}`);
    return false;
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    await db.prepare(`
      UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false
    `).run(userId);
    return true;
  } catch (err) {
    logger.error(`[Notification] Error marking all read: ${err.message}`);
    return false;
  }
}

export async function deleteNotification(notificationId, userId) {
  try {
    await db.prepare(`
      DELETE FROM notifications WHERE id = ? AND user_id = ?
    `).run(notificationId, userId);
    return true;
  } catch (err) {
    logger.error(`[Notification] Error deleting notification: ${err.message}`);
    return false;
  }
}

export async function getUnreadCount(userId) {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false
    `).get(userId);
    return result?.count || 0;
  } catch (err) {
    logger.error(`[Notification] Error getting unread count: ${err.message}`);
    return 0;
  }
}

export async function updateNotificationPreferences(userId, preferences) {
  try {
    const existing = await db.prepare(`
      SELECT id FROM notification_preferences WHERE user_id = ?
    `).get(userId);

    if (existing) {
      await db.prepare(`
        UPDATE notification_preferences 
        SET email_notifications = ?, push_notifications = ?, sms_notifications = ?,
            checkin_reminders = ?, checkin_missed = ?, checkin_emergency = ?,
            trip_reminders = ?, buddy_requests = ?, budget_alerts = ?,
            reminder_minutes_before = ?
        WHERE user_id = ?
      `).run(
        preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
        preferences.pushNotifications !== undefined ? preferences.pushNotifications : true,
        preferences.smsNotifications !== undefined ? preferences.smsNotifications : false,
        preferences.checkinReminders !== undefined ? preferences.checkinReminders : true,
        preferences.checkinMissed !== undefined ? preferences.checkinMissed : true,
        preferences.checkinEmergency !== undefined ? preferences.checkinEmergency : true,
        preferences.tripReminders !== undefined ? preferences.tripReminders : true,
        preferences.buddyRequests !== undefined ? preferences.buddyRequests : true,
        preferences.budgetAlerts !== undefined ? preferences.budgetAlerts : true,
        preferences.reminderMinutesBefore || 15,
        userId
      );
    } else {
      await db.prepare(`
        INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, sms_notifications,
          checkin_reminders, checkin_missed, checkin_emergency, trip_reminders, buddy_requests, budget_alerts,
          reminder_minutes_before)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
        preferences.pushNotifications !== undefined ? preferences.pushNotifications : true,
        preferences.smsNotifications !== undefined ? preferences.smsNotifications : false,
        preferences.checkinReminders !== undefined ? preferences.checkinReminders : true,
        preferences.checkinMissed !== undefined ? preferences.checkinMissed : true,
        preferences.checkinEmergency !== undefined ? preferences.checkinEmergency : true,
        preferences.tripReminders !== undefined ? preferences.tripReminders : true,
        preferences.buddyRequests !== undefined ? preferences.buddyRequests : true,
        preferences.budgetAlerts !== undefined ? preferences.budgetAlerts : true,
        preferences.reminderMinutesBefore || 15
      );
    }

    return await getNotificationPreferences(userId);
  } catch (err) {
    logger.error(`[Notification] Error updating preferences: ${err.message}`);
    return null;
  }
}

export async function getNotificationPreferences(userId) {
  try {
    const prefs = await db.prepare(`
      SELECT * FROM notification_preferences WHERE user_id = ?
    `).get(userId);

    if (!prefs) {
      return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        checkinReminders: true,
        checkinMissed: true,
        checkinEmergency: true,
        tripReminders: true,
        buddyRequests: true,
        budgetAlerts: true,
        reminderMinutesBefore: 15
      };
    }

    return {
      emailNotifications: !!prefs.email_notifications,
      pushNotifications: !!prefs.push_notifications,
      smsNotifications: !!prefs.sms_notifications,
      checkinReminders: !!prefs.checkin_reminders,
      checkinMissed: !!prefs.checkin_missed,
      checkinEmergency: !!prefs.checkin_emergency,
      tripReminders: !!prefs.trip_reminders,
      buddyRequests: !!prefs.buddy_requests,
      budgetAlerts: !!prefs.budget_alerts,
      reminderMinutesBefore: prefs.reminder_minutes_before || 15
    };
  } catch (err) {
    logger.error(`[Notification] Error getting preferences: ${err.message}`);
    return null;
  }
}
