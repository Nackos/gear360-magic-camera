// Secure error handling utilities

export interface SecureError {
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high';
  userMessage: string;
}

// Error codes mapping to user-friendly messages
const ERROR_MESSAGES: Record<string, SecureError> = {
  'NETWORK_SCAN_FAILED': {
    message: 'WiFi scan operation failed',
    code: 'NETWORK_SCAN_FAILED',
    severity: 'medium',
    userMessage: 'Impossible de scanner les réseaux Wi-Fi. Vérifiez vos permissions.'
  },
  'CONNECTION_TIMEOUT': {
    message: 'Device connection timeout',
    code: 'CONNECTION_TIMEOUT',
    severity: 'medium',
    userMessage: 'La connexion a pris trop de temps. Vérifiez que votre appareil est allumé.'
  },
  'INVALID_PASSWORD': {
    message: 'Invalid WiFi password provided',
    code: 'INVALID_PASSWORD',
    severity: 'low',
    userMessage: 'Mot de passe incorrect. Veuillez vérifier et réessayer.'
  },
  'DEVICE_NOT_FOUND': {
    message: 'Target device not found',
    code: 'DEVICE_NOT_FOUND',
    severity: 'medium',
    userMessage: 'Appareil non trouvé. Assurez-vous qu\'il est allumé et visible.'
  },
  'PERMISSION_DENIED': {
    message: 'Required permission denied',
    code: 'PERMISSION_DENIED',
    severity: 'high',
    userMessage: 'Permission refusée. Vérifiez les paramètres de votre navigateur.'
  },
  'RATE_LIMIT_EXCEEDED': {
    message: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    severity: 'low',
    userMessage: 'Trop de tentatives. Veuillez patienter avant de réessayer.'
  }
};

// Secure error handler that doesn't expose technical details
export const handleSecureError = (error: unknown, context: string): SecureError => {
  // Log technical details for debugging (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Technical error:`, error);
  }

  // Determine error type
  let errorCode = 'UNKNOWN_ERROR';
  const err = error as { name?: string; message?: string } | null;

  if (err?.name === 'TimeoutError' || err?.message?.includes('timeout')) {
    errorCode = 'CONNECTION_TIMEOUT';
  } else if (err?.message?.includes('permission')) {
    errorCode = 'PERMISSION_DENIED';
  } else if (err?.message?.includes('not found')) {
    errorCode = 'DEVICE_NOT_FOUND';
  } else if (err?.message?.includes('password')) {
    errorCode = 'INVALID_PASSWORD';
  } else if (err?.message?.includes('scan')) {
    errorCode = 'NETWORK_SCAN_FAILED';
  }

  const secureError = ERROR_MESSAGES[errorCode] || {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    severity: 'medium' as const,
    userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
  };

  return secureError;
};

// Timeout wrapper for async operations
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};