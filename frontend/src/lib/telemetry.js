/**
 * SoloCompass — Analytics
 * 
 * Tracks page views and events to the backend analytics endpoint.
 * Respects cookie consent before firing any tracking.
 */

import api from './api';

const isProd = import.meta.env.PROD;

function hasConsent() {
  try {
    const consentType = localStorage.getItem('cookie-consent');
    if (!consentType) return false;
    if (consentType === 'all') return true;
    if (consentType === 'custom') {
      const prefs = localStorage.getItem('cookie-preferences');
      if (!prefs) return false;
      return JSON.parse(prefs)?.analytics === true;
    }
    return false;
  } catch {
    return false;
  }
}

export const trackEvent = async (eventName, properties = {}) => {
  if (!isProd) {
    console.log(`[Analytics Event]: ${eventName}`, properties);
  }

  if (!hasConsent() && isProd) return;

  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }

  try {
    await api.post('/analytics/track', { type: 'event', eventType: eventName, properties });
  } catch {
    // Silently fail — analytics shouldn't break the app
  }
};

export const trackPageView = async (url) => {
  if (!isProd) {
    console.log(`[Analytics PageView]: ${url}`);
  }

  if (!hasConsent() && isProd) return;

  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: url,
    });
  }

  try {
    await api.post('/analytics/track', { type: 'page_view', path: url });
  } catch {
    // Silently fail
  }
};
