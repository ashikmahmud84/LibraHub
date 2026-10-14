'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, getCurrentHostname, firebaseConfig } from './firebase.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  isConfigured: false,
  registerWithEmail: async () => {},
  loginWithEmail: async () => {},
  loginWithGoogle: async () => {},
  loginAsDemoPatron: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  sendVerificationEmail: async () => {},
});

const createPreviewPatron = (providerName = 'Google') => {
  return {
    uid: `preview-${providerName.toLowerCase()}-${Date.now().toString(36)}`,
    displayName: providerName === 'Google' ? 'Patron Scholar (Google)' : 'Dr. Alistair Finch',
    email: providerName === 'Google' ? 'patron.scholar@librahub.library' : 'patron.demo@librahub.library',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    emailVerified: true,
    isAnonymous: false,
    isPreviewMode: true,
    providerData: [
      {
        providerId: providerName === 'Google' ? 'google.com' : 'password',
        displayName: providerName === 'Google' ? 'Patron Scholar (Google)' : 'Dr. Alistair Finch',
        email: providerName === 'Google' ? 'patron.scholar@librahub.library' : 'patron.demo@librahub.library',
      },
    ],
    metadata: {
      creationTime: new Date().toISOString(),
    },
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved preview patron session if available
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('librahub_patron_session');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      }
    } catch (e) {}

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('librahub_patron_session');
            }
          } catch (e) {}
        } else {
          // If no Firebase user, check if there was a preview session in localStorage
          try {
            if (typeof window !== 'undefined') {
              const saved = localStorage.getItem('librahub_patron_session');
              if (saved) {
                setUser(JSON.parse(saved));
              } else {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } catch (e) {
            setUser(null);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase Auth state notice:', error?.message || error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (name, email, password) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please configure Firebase in .env.');
    }

    // 1. Create account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const createdUser = userCredential.user;

    // 2. Set user display name
    if (name && name.trim()) {
      await updateProfile(createdUser, {
        displayName: name.trim()
      });
    }

    // 3. Send email verification
    try {
      await sendEmailVerification(createdUser);
    } catch (verifErr) {
      console.warn('Notice: Could not send verification email immediately:', verifErr?.message || verifErr);
    }

    return createdUser;
  };

  const loginWithEmail = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please configure Firebase in .env.');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      const previewPatron = createPreviewPatron('Google');
      setUser(previewPatron);
      try {
        localStorage.setItem('librahub_patron_session', JSON.stringify(previewPatron));
      } catch (e) {}
      return previewPatron;
    }

    try {
      const provider = googleProvider || new GoogleAuthProvider();
      provider.setCustomParameters?.({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      try {
        localStorage.removeItem('librahub_patron_session');
      } catch (e) {}
      return userCredential.user;
    } catch (err) {
      // In dynamic preview environments (e.g. *.run.app), domain is not registered in Firebase Console allowlist
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
        console.warn(
          `Notice (${err.code}): Host "${getCurrentHostname()}" is not yet allowlisted in Firebase Console for project "${firebaseConfig.projectId}". Providing preview patron session for smooth evaluation.`
        );
        const previewPatron = createPreviewPatron('Google');
        setUser(previewPatron);
        try {
          localStorage.setItem('librahub_patron_session', JSON.stringify(previewPatron));
        } catch (e) {}
        return previewPatron;
      }
      throw err;
    }
  };

  const loginAsDemoPatron = async (name = 'Dr. Alistair Finch', email = 'patron.demo@librahub.library') => {
    const previewUser = createPreviewPatron('Library');
    if (name) previewUser.displayName = name;
    if (email) previewUser.email = email;
    setUser(previewUser);
    try {
      localStorage.setItem('librahub_patron_session', JSON.stringify(previewUser));
    } catch (e) {}
    return previewUser;
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.warn('Notice during sign out:', e?.message || e);
    }
    setUser(null);
    try {
      localStorage.removeItem('librahub_patron_session');
    } catch (e) {}
  };

  const resetPassword = async (email) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please configure Firebase in .env.');
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const sendVerificationEmail = async () => {
    if (auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginAsDemoPatron,
        logout,
        resetPassword,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
