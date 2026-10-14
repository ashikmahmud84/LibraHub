import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for persistent uploaded book covers
export const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'covers');

// Ensure directory exists on launch
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 5 MB maximum file upload limit
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image MIME types and extensions
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates file buffer magic bytes / file signatures to prevent disguised executables.
 *
 * @param {Buffer} buffer
 * @returns {{ valid: boolean, detectedExt?: string, error?: string }}
 */
export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small to be a valid image.' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedExt: '.jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedExt: '.png' };
  }

  // WebP: RIFF ... WEBP
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

  if (isRiff && isWebp) {
    return { valid: true, detectedExt: '.webp' };
  }

  return {
    valid: false,
    error: 'Unrecognized image file signature. Allowed formats are JPG, PNG, and WebP.',
  };
}

/**
 * Persists an image buffer to disk securely with unique collision-resistant filename.
 *
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename for extension hints
 * @param {string} mimeType - Declared MIME type
 * @returns {{ success: boolean, url: string, fileId: string, size: number }}
 */
export function saveImageBuffer(buffer, originalName, mimeType) {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`);
  }

  const magicCheck = validateImageMagicBytes(buffer);
  if (!magicCheck.valid) {
    throw new Error(magicCheck.error);
  }

  const ext = magicCheck.detectedExt || path.extname(originalName).toLowerCase() || '.jpg';
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const fileId = `cover-${Date.now()}-${randomSuffix}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, fileId);

  fs.writeFileSync(targetPath, buffer);

  return {
    success: true,
    url: `/uploads/covers/${fileId}`,
    fileId,
    size: buffer.length,
    mimeType: ext === '.jpg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'image/webp',
  };
}

/**
 * Safely removes a stored cover image from disk.
 * Protects against path traversal.
 *
 * @param {string} fileIdOrUrl
 * @returns {boolean} Whether file was successfully deleted
 */
export function deleteStoredImage(fileIdOrUrl) {
  if (!fileIdOrUrl || typeof fileIdOrUrl !== 'string') return false;

  // Extract base filename
  let filename = fileIdOrUrl;
  if (filename.startsWith('/uploads/covers/')) {
    filename = filename.replace('/uploads/covers/', '');
  } else if (filename.includes('/')) {
    filename = path.basename(filename);
  }

  // Prevent directory traversal
  filename = path.basename(filename);
  if (!filename || filename === '.' || filename === '..') return false;

  const targetPath = path.resolve(UPLOADS_DIR, filename);

  // Security check: ensure path is strictly inside UPLOADS_DIR
  if (!targetPath.startsWith(UPLOADS_DIR)) {
    console.warn(`Prevented directory traversal attempt when deleting image: ${fileIdOrUrl}`);
    return false;
  }

  if (fs.existsSync(targetPath)) {
    try {
      fs.unlinkSync(targetPath);
      return true;
    } catch (err) {
      console.warn(`Failed to delete stored cover image at ${targetPath}:`, err?.message);
      return false;
    }
  }

  return false;
}
