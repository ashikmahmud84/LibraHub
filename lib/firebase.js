import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Helper to safely read and sanitize env variables
const getEnvVar = (nextKey, viteKey) => {
  let val = '';
  if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
    val = process.env[nextKey];
  } else if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[nextKey]) val = import.meta.env[nextKey];
    else if (viteKey && import.meta.env[viteKey]) val = import.meta.env[viteKey];
  }
  return typeof val === 'string' ? val.replace(/^["'\s]+|["',\s]+$/g, '').trim() : '';
};

const clean = (val, fallback = '') => {
  if (val && !val.includes('Placeholder') && !val.includes('your-app-id')) {
    return val;
  }
  return fallback;
};

// Configured credentials with environment priority and clean defaults
export const firebaseConfig = {
  apiKey: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'), 'AIzaSyDl-EzlF3SmepBbiFS2eunxuRxMg1mYDWw'),
  authDomain: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'), 'librahub-15352.firebaseapp.com'),
  projectId: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'), 'librahub-15352'),
  storageBucket: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'), 'librahub-15352.firebasestorage.app'),
  messagingSenderId: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'), '323602349457'),
  appId: clean(getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID'), '1:323602349457:web:2e89235f4a8abe4aa4ae30'),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith('AIzaSy') &&
  firebaseConfig.projectId
);

export function getCurrentHostname() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  return '';
}

export function getFirebaseAuthSettingsUrl() {
  const pId = firebaseConfig.projectId || 'librahub-15352';
  return `https://console.firebase.google.com/project/${pId}/authentication/settings`;
}

// Initialize Firebase App, Auth, and Google Auth Provider
let app = null;
let auth = null;
let googleProvider = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
  try {
    googleProvider = new GoogleAuthProvider();
  } catch (e) {}
}

export { app, auth, googleProvider };

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please check for typos.';
    case 'auth/user-not-found':
      return 'No patron account was found matching this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials or use password reset.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your login credentials.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completion. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in window was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your internet connectivity.';
    case 'auth/unauthorized-domain': {
      const host = getCurrentHostname();
      return `Domain Authorization Required: "${host}" is not in Firebase's Authorized Domains list for project "${firebaseConfig.projectId}". Add it in Firebase Console to use Google OAuth, or register with Email & Password below!`;
    }
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is disabled in Firebase Console. Please go to Authentication > Sign-in method in Firebase Console and enable Google (or Email/Password).';
    default:
      return message.replace('Firebase: ', '') || 'Authentication request failed. Please try again.';
  }
}
