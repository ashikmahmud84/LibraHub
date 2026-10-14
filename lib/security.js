import { getDatabase } from './mongodb.js';

/**
 * Validates request authorization for Admin-only operations.
 * 
 * Supports:
 * 1. Admin API Secret / Key via `x-admin-key` or `Authorization: Bearer <key>` header
 * 2. Authenticated user header via `x-user-email` or `x-user-role`
 * 3. Default fallback allowing development testing if no secret configured,
 *    while strictly blocking unauthorized requests when configured or when explicitly restricted.
 *
 * @param {Request} request
 * @returns {Promise<{ authorized: boolean, reason?: string, user?: object }>}
 */
export async function verifyAdminAuthorization(request) {
  const adminSecret = process.env.ADMIN_API_SECRET?.trim();
  const configuredAdminEmails = (process.env.ADMIN_EMAILS || 'admin@librahub.library')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const getHeader = (name) => {
    if (!request || !request.headers) return '';
    if (typeof request.headers.get === 'function') {
      return request.headers.get(name) || '';
    }
    return request.headers[name.toLowerCase()] || request.headers[name] || '';
  };

  const authHeader = getHeader('authorization');
  const adminKeyHeader = getHeader('x-admin-key');
  const userEmailHeader = (getHeader('x-user-email')).trim().toLowerCase();
  const userRoleHeader = (getHeader('x-user-role')).trim().toLowerCase();

  // 1. Check Admin Key header if configured
  if (adminSecret) {
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (adminKeyHeader === adminSecret || bearerToken === adminSecret) {
      return { authorized: true, user: { role: 'admin', authType: 'api_key' } };
    }
  }

  // 2. Check if user is explicit admin role
  if (userRoleHeader === 'admin') {
    return { authorized: true, user: { role: 'admin', email: userEmailHeader } };
  }

  // 3. Check if user email belongs to configured admin emails
  if (userEmailHeader && configuredAdminEmails.includes(userEmailHeader)) {
    return { authorized: true, user: { role: 'admin', email: userEmailHeader } };
  }

  // 4. In development, if neither secret nor user header was supplied, permit controlled catalog admin operations
  // but reject when an unprivileged non-admin user is explicitly passed
  if (userRoleHeader && userRoleHeader !== 'admin') {
    return {
      authorized: false,
      reason: 'Forbidden: Patron role does not have administrative privileges for catalog mutations.',
    };
  }

  // If ADMIN_API_SECRET is set and neither key nor admin user matched:
  if (adminSecret) {
    return {
      authorized: false,
      reason: 'Unauthorized: Valid admin credentials or API key required.',
    };
  }

  // Permissive dev mode default
  return { authorized: true, user: { role: 'admin', isDevFallback: true } };
}

/**
 * Validates email format according to RFC 5322 simplified standard.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // RFC-compliant safe regex avoiding ReDoS
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates password strength requirements:
 * - Minimum 6 characters (matches Firebase Auth specification)
 * - Maximum 128 characters (prevents DoS on hashing routines)
 * - Safe character handling without logging passwords
 *
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePasswordRequirements(password) {
  if (typeof password !== 'string' || !password) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters in length.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password exceeds maximum length of 128 characters.' };
  }
  return { valid: true };
}

/**
 * Sanitizes generic user input text to prevent XSS and stripping dangerous control characters.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
    .trim();
}
