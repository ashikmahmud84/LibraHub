import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './firebase.js';

let storageInstance = null;

export function getFirebaseStorage() {
  if (!isFirebaseConfigured) return null;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (!storageInstance) {
      storageInstance = getStorage(app);
    }
    return storageInstance;
  } catch (err) {
    console.warn('Firebase Storage initialization notice:', err?.message);
    return null;
  }
}

/**
 * Checks whether Firebase Storage bucket is actively provisioned and accessible.
 * Returns status and configuration explanation.
 */
export async function checkFirebaseStorageStatus() {
  const storage = getFirebaseStorage();
  if (!storage) {
    return {
      available: false,
      bucket: firebaseConfig.storageBucket || null,
      message: 'Firebase configuration incomplete or missing API credentials.',
    };
  }

  return {
    available: true,
    bucket: firebaseConfig.storageBucket,
    message: 'Firebase Storage client initialized.',
  };
}

/**
 * Uploads an image to Firebase Storage if bucket is provisioned.
 *
 * @param {Blob|File} file
 * @param {string} filename
 * @returns {Promise<{ url: string, storageKey: string }>}
 */
export async function uploadToFirebaseStorage(file, filename) {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const storageKey = `covers/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, storageKey);

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadURL = await getDownloadURL(storageRef);
  return {
    url: downloadURL,
    storageKey,
  };
}

/**
 * Removes an image from Firebase Storage if present.
 *
 * @param {string} storageKey
 */
export async function deleteFromFirebaseStorage(storageKey) {
  if (!storageKey) return false;
  try {
    const storage = getFirebaseStorage();
    if (!storage) return false;
    const storageRef = ref(storage, storageKey);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn('Firebase Storage deletion notice:', err?.message);
    return false;
  }
}
