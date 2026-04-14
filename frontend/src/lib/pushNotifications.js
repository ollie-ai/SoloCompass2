const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export async function requestPushPermission() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) return existingSub;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Permission denied');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY || urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib37JmMZZsNz4nJzqHkCg0q3TlBqMkqY3qKqPqQ3qKqPqQ3qKqPqQ3qKqPqQ')
    });

    return subscription;
  } catch (err) {
    console.error('[Push] Subscription error:', err);
    return false;
  }
}

export async function unregisterPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    return true;
  } catch (err) {
    console.error('[Push] Unregister error:', err);
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
