import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import api from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;

export function initFirebase() {
  if (app) return { app, messaging };
  
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('[FCM] Firebase initialized');
  } catch (error) {
    console.error('[FCM] Firebase initialization failed:', error);
  }
  
  return { app, messaging };
}

export async function requestPushPermission() {
  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[FCM] Push permission denied');
    return null;
  }

  const { messaging } = initFirebase();
  if (!messaging) {
    console.error('[FCM] Messaging not initialized');
    return null;
  }

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY') {
      console.warn('[FCM] VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log('[FCM] Got push token:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[FCM] No token received');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
}

export async function subscribeToPush() {
  const token = await requestPushPermission();
  if (!token) return false;

  try {
    await api.post('/notifications/push/subscribe', { token });
    console.log('[FCM] Subscribed to push');
    return true;
  } catch (error) {
    console.error('[FCM] Failed to subscribe:', error);
    return false;
  }
}

export async function unsubscribeFromPush() {
  try {
    const { messaging } = initFirebase();
    if (messaging) {
      const token = await getToken(messaging);
      if (token) {
        await deleteToken(messaging);
        await api.post('/notifications/push/unsubscribe', { token });
        console.log('[FCM] Unsubscribed from push');
      }
    }
    return true;
  } catch (error) {
    console.error('[FCM] Failed to unsubscribe:', error);
    return false;
  }
}

export function onForegroundMessage(callback) {
  const { messaging } = initFirebase();
  if (!messaging) return () => {};

  onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message:', payload);
    callback(payload);
  });
}

export function getNotificationPayload(payload) {
  return {
    title: payload.notification?.title || 'SoloCompass',
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-32x32.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    requireInteraction: payload.data?.priority === 'P0' || payload.data?.priority === 'P1',
  };
}

export function showLocalNotification(payload) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notificationPayload = getNotificationPayload({
    notification: payload,
    data: payload.data || {},
  });

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(notificationPayload.title, {
      body: notificationPayload.body,
      icon: notificationPayload.icon,
      badge: notificationPayload.badge,
      tag: notificationPayload.tag,
      data: notificationPayload.data,
      requireInteraction: notificationPayload.requireInteraction,
    });
  });
}
