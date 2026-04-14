import admin from 'firebase-admin';
import logger from './logger.js';

let firebaseInitialized = false;

export function initFirebaseAdmin() {
  if (firebaseInitialized) return true;
  
  try {
    const hasServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    const hasProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const hasClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (hasServiceAccount) {
      const credentials = typeof hasServiceAccount === 'string' 
        ? JSON.parse(hasServiceAccount) 
        : hasServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } else if (hasProjectId && hasClientEmail && hasPrivateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: hasProjectId,
          clientEmail: hasClientEmail,
          privateKey: hasPrivateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      logger.warn('[FCM] Firebase credentials not configured');
      return false;
    }

    firebaseInitialized = true;
    logger.info('[FCM] Firebase Admin initialized');
    return true;
  } catch (error) {
    logger.error('[FCM] Firebase Admin init failed:', error.message);
    return false;
  }
}

export async function subscribeUser(userId, token) {
  try {
    const db = (await import('../db.js')).default;
    
    await db.prepare(`
      INSERT INTO push_subscriptions (user_id, endpoint, keys)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, endpoint) DO UPDATE SET
        keys = excluded.keys
    `).run(userId, token, JSON.stringify({ token }));

    logger.info(`[FCM] User ${userId} subscribed with token ${token.substring(0, 20)}...`);
    return { success: true };
  } catch (error) {
    logger.error('[FCM] Subscribe failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function unsubscribeUser(userId, token) {
  try {
    const db = (await import('../db.js')).default;
    
    await db.prepare(`
      DELETE FROM push_subscriptions 
      WHERE user_id = ? AND endpoint = ?
    `).run(userId, token);

    logger.info(`[FCM] User ${userId} unsubscribed`);
    return { success: true };
  } catch (error) {
    logger.error('[FCM] Unsubscribe failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getUserSubscriptions(userId) {
  try {
    const db = (await import('../db.js')).default;
    
    const subscriptions = await db.prepare(`
      SELECT endpoint as token, keys FROM push_subscriptions WHERE user_id = ?
    `).all(userId);

    return subscriptions.map(sub => ({
      token: sub.token,
      keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys,
    }));
  } catch (error) {
    logger.error('[FCM] Get subscriptions failed:', error.message);
    return [];
  }
}

export async function sendPushNotification(userId, notification) {
  if (!firebaseInitialized) {
    const initialized = initFirebaseAdmin();
    if (!initialized) {
      return { success: false, error: 'Firebase not initialized' };
    }
  }

  try {
    const subscriptions = await getUserSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      logger.debug(`[FCM] No subscriptions for user ${userId}`);
      return { success: false, error: 'No subscriptions' };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.image && { imageUrl: notification.image }),
      },
      data: notification.data || {},
      web: {
        notification: {
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-32x32.png',
          tag: notification.tag || 'default',
          requireInteraction: notification.priority === 'P0' || notification.priority === 'P1',
        },
      },
      tokens: subscriptions.map(sub => sub.token),
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    const results = {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: [],
    };

    response.responses.forEach((resp, index) => {
      if (!resp.success) {
        results.errors.push({
          token: subscriptions[index].token,
          error: resp.error?.message,
        });
        
        if (resp.error?.code === 'messaging/registration-token-not-registered') {
          unsubscribeUser(userId, subscriptions[index].token).catch(() => {});
        }
      }
    });

    logger.info(`[FCM] Sent to user ${userId}: ${results.successCount} success, ${results.failureCount} failed`);
    return results;
  } catch (error) {
    logger.error('[FCM] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

export default {
  initFirebaseAdmin,
  subscribeUser,
  unsubscribeUser,
  getUserSubscriptions,
  sendPushNotification,
};
