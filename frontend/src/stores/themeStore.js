import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'solocompass-dark' : 'solocompass';
  }
  return 'solocompass';
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'solocompass',
      themeMode: 'solocompass',
      isInitialized: false,
      
      initialize: async () => {
        const state = get();
        if (state.isInitialized) return;
        
        try {
          const response = await api.get('/auth/me');
          if (response.data?.user?.theme_preference) {
            const savedTheme = response.data.user.theme_preference;
            set({ theme: savedTheme, isInitialized: true });
            if (savedTheme === 'system') {
              applyTheme(getSystemTheme());
            } else {
              applyTheme(savedTheme);
            }
            return;
          }
        } catch (error) {
          // Not logged in or error - use local storage
        }
        
        // Fall back to localStorage - default to light theme
        const storedTheme = localStorage.getItem('solocompass-theme-mode') || 'solocompass';
        set({ theme: storedTheme, isInitialized: true });
        
        applyTheme(storedTheme);
      },
      
      setTheme: async (newTheme) => {
        set({ theme: newTheme });
        
        if (newTheme === 'system') {
          applyTheme(getSystemTheme());
        } else {
          applyTheme(newTheme);
        }
        
        // Try to sync with backend
        try {
          await api.patch('/auth/theme', { theme_preference: newTheme });
        } catch (error) {
          // Backend sync failed - theme still applied locally
          console.warn('Theme sync failed:', error.message);
        }
      },
      
      toggleTheme: () => {
        const current = get().theme;
        const newTheme = current === 'solocompass' ? 'solocompass-dark' : 
                        current === 'solocompass-dark' ? 'system' : 'solocompass';
        get().setTheme(newTheme);
      },
      
      clearTheme: () => {
        set({ isInitialized: false });
        localStorage.removeItem('solocompass-theme');
        localStorage.removeItem('solocompass-theme-mode');
      }
    }),
    {
      name: 'solocompass-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          if (state.theme === 'system') {
            applyTheme(getSystemTheme());
          } else {
            applyTheme(state.theme);
          }
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      applyTheme(e.matches ? 'solocompass-dark' : 'solocompass');
    }
  });
}
