import { z } from 'zod';

// Social sharing validation schema
export const socialCaptionSchema = z.object({
  caption: z.string()
    .trim()
    .max(500, 'La légende ne peut pas dépasser 500 caractères')
    .refine(text => !/[<>'"&]/.test(text), 'Caractères spéciaux non autorisés')
});

// WiFi password validation schema
export const wifiPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(63, 'Le mot de passe ne peut pas dépasser 63 caractères')
    .refine(pwd => !/[<>'"&]/.test(pwd), 'Caractères spéciaux non autorisés dans le mot de passe')
});

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// URL validation for sharing
export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow https and http protocols
    return ['https:', 'http:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Au moins 8 caractères');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Au moins une minuscule');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Au moins une majuscule');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Au moins un chiffre');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Au moins un caractère spécial');

  return { score, feedback };
};

// Rate limiting utility
class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    return Math.max(0, attempt.resetTime - Date.now());
  }
}

export const networkScanLimiter = new RateLimiter(3, 30000); // 3 attempts per 30 seconds
export const connectionLimiter = new RateLimiter(5, 60000); // 5 attempts per minute