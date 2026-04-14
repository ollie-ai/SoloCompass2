import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const isBrowser = typeof window !== 'undefined' && window.localStorage;

function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;
  
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

/**
 * useWidgetState - Custom hook for managing dashboard widget state
 * Handles: expanded/collapsed, hidden, and order (drag & drop)
 * Persists to localStorage per dashboard key + user
 */
export function useWidgetState(dashboardKey, defaultStateWithLayouts = null) {
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';
  const lastUserId = useRef(userId);
  
  const getStorageKey = (uid) => `solocompass_widgets_${dashboardKey}_${uid || userId}`;

  // Default state includes layouts + widget configs + order array
  const defaultState = useMemo(() => ({
    layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] },
    order: null, // null means use default order from defaultStateWithLayouts
    ...defaultStateWithLayouts
  }), [dashboardKey, defaultStateWithLayouts]);

  // Extract default widget keys from defaultStateWithLayouts for initial order
  const defaultWidgetKeys = useMemo(() => {
    if (!defaultStateWithLayouts) return [];
    return Object.keys(defaultStateWithLayouts).filter(key => 
      typeof defaultStateWithLayouts[key] === 'object' && 
      defaultStateWithLayouts[key] !== null &&
      !Array.isArray(defaultStateWithLayouts[key])
    );
  }, [defaultStateWithLayouts]);

  const loadState = useCallback((uid) => {
    if (!isBrowser) return defaultState;
    try {
      const stored = localStorage.getItem(getStorageKey(uid));
      if (stored) {
        const parsed = JSON.parse(stored);
        // If no order in stored state, generate from default keys
        if (!parsed.order && defaultWidgetKeys.length > 0) {
          parsed.order = defaultWidgetKeys;
        }
        return deepMerge(defaultState, parsed);
      }
    } catch (e) {
      console.error('Failed to parse widget state:', e);
    }
    // Return default state with order set
    return {
      ...defaultState,
      order: defaultWidgetKeys
    };
  }, [defaultState, dashboardKey, defaultWidgetKeys]);

  const [widgetState, setWidgetState] = useState(() => loadState(userId));

  // Sync state when User ID changes (e.g. auth resolves after mount)
  useEffect(() => {
    if (userId !== lastUserId.current) {
        setWidgetState(loadState(userId));
        lastUserId.current = userId;
    }
  }, [userId, loadState]);

  // Robustly save to localStorage on any state modification
  useEffect(() => {
    if (!isBrowser || !widgetState) return;
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(widgetState));
    } catch (e) {
      console.error('Failed to save widget state:', e);
    }
  }, [widgetState, userId, dashboardKey]);

  // Helper to reorder widgets
  const reorderWidgets = useCallback((newOrder) => {
    setWidgetState(prev => ({
      ...prev,
      order: newOrder
    }));
  }, []);

  // Helper to unhide a widget
  const unhideWidget = useCallback((key) => {
    setWidgetState(prev => ({
      ...prev,
      [key]: { ...prev[key], hidden: false }
    }));
  }, []);

  // Helper to hide a widget
  const hideWidget = useCallback((key) => {
    setWidgetState(prev => ({
      ...prev,
      [key]: { ...prev[key], hidden: true }
    }));
  }, []);

  // Helper to toggle expand
  const toggleExpand = useCallback((key) => {
    setWidgetState(prev => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key]?.expanded }
    }));
  }, []);

  // Helper to expand all
  const expandAll = useCallback(() => {
    setWidgetState(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key !== 'layouts' && key !== 'order' && updated[key]) {
          updated[key] = { ...updated[key], expanded: true };
        }
      });
      return updated;
    });
  }, []);

  // Helper to collapse all
  const collapseAll = useCallback(() => {
    setWidgetState(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key !== 'layouts' && key !== 'order' && updated[key]) {
          updated[key] = { ...updated[key], expanded: false };
        }
      });
      return updated;
    });
  }, []);

  // Helper to reset to defaults
  const resetToDefaults = useCallback(() => {
    setWidgetState({
      layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] },
      order: defaultWidgetKeys,
      ...defaultStateWithLayouts
    });
  }, [defaultStateWithLayouts, defaultWidgetKeys]);

  // Get ordered widget keys (for dnd-kit)
  const orderedKeys = widgetState.order || defaultWidgetKeys;

  return [
    widgetState, 
    setWidgetState,
    {
      reorderWidgets,
      unhideWidget,
      hideWidget,
      toggleExpand,
      expandAll,
      collapseAll,
      resetToDefaults,
      orderedKeys,
      defaultWidgetKeys
    }
  ];
}

export function useDashboardState() {
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';
  const STORAGE_KEY = `solocompass_dashboard_state_${userId}`;
  
  const [dashboardState, setDashboardState] = useState(() => {
    if (!isBrowser) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDashboardState(JSON.parse(stored));
      else setDashboardState(null);
    } catch (e) {}
  }, [userId, STORAGE_KEY]);

  useEffect(() => {
    if (isBrowser && dashboardState !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardState));
      } catch (e) {}
    }
  }, [dashboardState, STORAGE_KEY]);

  return [dashboardState, setDashboardState];
}