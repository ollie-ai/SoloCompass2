import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 
          50: '#f0fdf4', 
          100: '#dcfce7', 
          200: '#bbf7d0', 
          300: '#86efac', 
          400: '#4ade80', 
          500: '#22c55e', 
          600: '#16a34a', 
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          deep: '#0f172a',
          vibrant: '#10b981',
          accent: '#8b5cf6',
          slate: '#475569',
          'status-blue': '#0ea5e9'
        },
        background: {
          main: '#f8fafc',
          card: '#ffffff',
          dark: '#0f172a'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        "solocompass": {
          "primary": "#10b981",
          "primary-content": "#ffffff",
          "secondary": "#0ea5e9",
          "secondary-content": "#ffffff",
          "accent": "#8b5cf6",
          "accent-content": "#ffffff",
          "neutral": "#0f172a",
          "neutral-content": "#f8fafc",
          "base-100": "#ffffff",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
          "info": "#0ea5e9",
          "info-content": "#ffffff",
          "success": "#22c55e",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        }
      },
      {
        "solocompass-dark": {
          "primary": "#10b981",
          "primary-content": "#ffffff",
          "secondary": "#0ea5e9",
          "secondary-content": "#ffffff",
          "accent": "#8b5cf6",
          "accent-content": "#ffffff",
          "neutral": "#1e293b",
          "neutral-content": "#f8fafc",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#f8fafc",
          "info": "#0ea5e9",
          "info-content": "#ffffff",
          "success": "#22c55e",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        }
      }
    ],
  },
}
