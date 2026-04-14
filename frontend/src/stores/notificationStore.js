import { create } from 'zustand';
import api from '../lib/api';
import { subscribeToPush, unsubscribeFromPush, onForegroundMessage, showLocalNotification } from '../lib/firebaseMessaging';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pushEnabled: false,
  pushPermission: Notification?.permission || 'default',
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    checkinReminders: true,
    checkinMissed: true,
    checkinEmergency: true,
    tripReminders: true,
    buddyRequests: true,
    budgetAlerts: true,
    reminderMinutesBefore: 15,
  },

  fetchNotifications: async (options = {}) => {
    set({ loading: true });
    try {
      const { unreadOnly = false, limit = 50, offset = 0 } = options;
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unreadOnly', 'true');
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const res = await api.get(`/notifications?${params}`);
      const data = res.data.data || res.data;
      
      set({
        notifications: data.notifications || [],
        unreadCount: data.unread || 0,
        loading: false,
      });
    } catch (error) {
      console.error('[NotificationStore] Failed to fetch:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('[NotificationStore] Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('[NotificationStore] Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId);
        return {
          notifications: state.notifications.filter((n) => n.id !== notificationId),
          unreadCount: notification && !notification.is_read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('[NotificationStore] Failed to delete:', error);
    }
  },

  fetchPreferences: async () => {
    try {
      const res = await api.get('/notifications/preferences');
      const prefs = res.data.data || res.data;
      set({ preferences: prefs });
    } catch (error) {
      console.error('[NotificationStore] Failed to fetch preferences:', error);
    }
  },

  updatePreferences: async (updates) => {
    try {
      const res = await api.put('/notifications/preferences', updates);
      const prefs = res.data.data || res.data;
      set({ preferences: prefs });
      return true;
    } catch (error) {
      console.error('[NotificationStore] Failed to update preferences:', error);
      return false;
    }
  },

  enablePush: async () => {
    try {
      const success = await subscribeToPush();
      if (success) {
        set({ pushEnabled: true, pushPermission: 'granted' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[NotificationStore] Failed to enable push:', error);
      return false;
    }
  },

  disablePush: async () => {
    try {
      await unsubscribeFromPush();
      set({ pushEnabled: false });
      return true;
    } catch (error) {
      console.error('[NotificationStore] Failed to disable push:', error);
      return false;
    }
  },

  initPushListeners: () => {
    if (get().pushEnabled) {
      onForegroundMessage((payload) => {
        showLocalNotification(payload);
        
        const notification = {
          id: payload.data?.id || Date.now(),
          type: payload.data?.type || 'push',
          title: payload.notification?.title,
          message: payload.notification?.body,
          is_read: false,
          created_at: new Date().toISOString(),
          data: payload.data,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count || 0 });
    } catch (error) {
      console.error('[NotificationStore] Failed to refresh count:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;
