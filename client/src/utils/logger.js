/**
 * Client-side logger utility
 * Provides consistent logging with environment-aware levels
 */

// Check if we're in development mode
// Create React App's webpack DefinePlugin replaces process.env.NODE_ENV at build time
// eslint-disable-next-line no-undef
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Log info messages
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log error messages
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log socket events
   */
  socket: (event, data) => {
    if (isDevelopment) {
      console.log(`[SOCKET] ${event}`, data || '');
    }
  },
};

export default logger;
