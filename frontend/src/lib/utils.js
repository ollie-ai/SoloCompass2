/**
 * UK-specific formatting utilities
 */

// Format date as DD/MM/YYYY (UK format) - handles null/invalid dates
export function formatDateUK(dateString, fallback = 'TBD') {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) return fallback;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Safely parse a date, returning null if invalid
export function safeDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) return null;
  return date;
}

// Format currency in GBP
export function formatCurrencyGBP(amount) {
  if (amount === null || amount === undefined) return '';
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Format date for API (YYYY-MM-DD)
export function toISODateString(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Error handling utilities
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  if (error.response?.data?.error) {
    return typeof error.response.data.error === 'string' 
      ? error.response.data.error 
      : error.response.data.error.message || fallback;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return fallback;
}

export function isNetworkError(error) {
  return !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
}

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  SERVER: 'Server error. Please try again in a few minutes.',
  AUTH: 'Authentication error. Please log in again.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  DEFAULT: 'Something went wrong. Please try again.'
};

export default {
  formatDateUK,
  formatCurrencyGBP,
  toISODateString,
  getErrorMessage,
  isNetworkError,
  ERROR_MESSAGES
};
