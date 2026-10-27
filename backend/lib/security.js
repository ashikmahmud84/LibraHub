import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseAdminAuth() {
  if (getApps().length > 0) {
    return getAuth(getApps()[0]);
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let credential = applicationDefault();
  let projectId = process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
    }
    serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, '\n');
    projectId = projectId || serviceAccount.project_id;
    credential = cert(serviceAccount);
  }

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is required for backend token verification.');
  }

  return getAuth(initializeApp({ credential, projectId }));
}

/**
 * Authorizes protected catalog actions only for verified Firebase users listed in ADMIN_EMAILS.
 * Caller-supplied identity and role headers are deliberately ignored.
 */
export async function verifyAdminAuthorization(request) {
  const authorization = typeof request?.headers?.get === 'function'
    ? request.headers.get('authorization') || ''
    : request?.headers?.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      authorized: false,
      reason: 'Unauthorized: A valid Firebase ID token is required.',
    };
  }

  let decodedToken;
  try {
    decodedToken = await getFirebaseAdminAuth().verifyIdToken(match[1]);
  } catch (error) {
    console.error('[Auth] Firebase ID token verification failed:', error?.code || error?.name || 'unknown error');
    return {
      authorized: false,
      reason: 'Unauthorized: Firebase ID token could not be verified.',
    };
  }

  const configuredAdminEmails = (process.env.ADMIN_EMAILS || 'admin@librahub.library')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = typeof decodedToken.email === 'string'
    ? decodedToken.email.trim().toLowerCase()
    : '';

  if (!email || !configuredAdminEmails.includes(email)) {
    return {
      authorized: false,
      reason: 'Forbidden: This Firebase account is not approved for administrative actions.',
    };
  }

  return { authorized: true, user: { role: 'admin', email } };
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

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

export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}
