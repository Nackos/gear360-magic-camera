// Security headers and CSP configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Content Security Policy
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "blob:"],
  'connect-src': ["'self'", "ws:", "wss:"],
  'media-src': ["'self'", "blob:"],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_POLICY)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Network request logging for debugging
export const logNetworkRequest = (
  url: string,
  method: string,
  status?: number,
  status?: number,
  error?: unknown
): void => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      url: url.replace(/([?&]password=)[^&]*/, '$1***'), // Hide passwords in logs
      method,
      status,
      error: (error as { message?: string })?.message || String(error)
    };

    console.log('🌐 Network Request:', logData);
  }
};

// Secure local storage wrapper
export const secureStorage = {
  set: (key: string, value: unknown): void => {
    try {
      const encrypted = btoa(JSON.stringify(value)); // Basic encoding
      localStorage.setItem(`gear360_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  get: (key: string): unknown => {
    try {
      const encrypted = localStorage.getItem(`gear360_${key}`);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`gear360_${key}`);
  },

  clear: (): void => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('gear360_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
};