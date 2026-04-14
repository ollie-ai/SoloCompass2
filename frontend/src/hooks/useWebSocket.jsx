import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { requestPushPermission } from '../lib/pushNotifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const listenersRef = useRef(new Map());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${new URL(API_URL).port || 3005}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        if (data.type === 'authenticated') {
          setIsConnected(true);
        }

        if (data.type === 'checkin_reminder') {
          toast((t) => (
            <div>
              <p className="font-bold">{data.message}</p>
              <button
                onClick={() => {
                  ws.send(JSON.stringify({
                    type: 'checkin_confirm',
                    scheduledCheckInId: data.scheduledCheckIn.id
                  }));
                  toast.dismiss(t.id);
                }}
                className="mt-2 px-3 py-1 bg-success/100 text-white rounded text-sm"
              >
                I'm Safe
              </button>
            </div>
          ), { duration: 30000, icon: '⏰' });

          if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('SoloCompass Check-In Reminder', {
                body: data.message,
                icon: '/logo192.png',
                tag: 'checkin_reminder',
                renotify: true,
                data: { url: '/safety' }
              });
            }).catch((err) => console.warn('[WebSocket] Service worker notification failed:', err));
          }
        }

        if (data.type === 'checkin_missed') {
          toast.error(data.message, { duration: 15000 });

          if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('SoloCompass - Missed Check-In', {
                body: data.message,
                icon: '/logo192.png',
                tag: 'checkin_missed',
                renotify: true,
                data: { url: '/safety' }
              });
            }).catch((err) => console.warn('[WebSocket] Service worker notification failed:', err));
          }
        }

        if (data.type === 'checkin_sos') {
          toast.error(data.message, { duration: 20000, icon: '🚨' });

          if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('SoloCompass SOS Alert', {
                body: data.message,
                icon: '/logo192.png',
                tag: 'checkin_sos',
                renotify: true,
                data: { url: '/safety' }
              });
            }).catch((err) => console.warn('[WebSocket] Service worker notification failed:', err));
          }
        }

        if (data.type === 'checkin_confirmed') {
          toast.success(data.message);
        }

        if (data.type === 'checkin_scheduled') {
          toast.success(data.message);
        }

        if (data.type === 'checkin_sent') {
          toast.success(data.message);
        }

        const typeListeners = listenersRef.current.get(data.type) || [];
        typeListeners.forEach((listener) => listener(data));
      } catch (err) {
        console.error('[WebSocket] Message parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const on = useCallback((type, listener) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, []);
    }
    listenersRef.current.get(type).push(listener);
    return () => {
      const list = listenersRef.current.get(type) || [];
      listenersRef.current.set(type, list.filter((l) => l !== listener));
    };
  }, []);

  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, lastMessage, on, send, connect, disconnect };
}
