import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'covers');
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const CLOUDINARY_FOLDER = 'librahub/covers';

export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small to be a valid image.' };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedExt: '.jpg' };
  }

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

function requireCloudinaryConfig() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function saveImageBuffer(buffer, originalName, mimeType) {
  if (!buffer || buffer.length === 0) {
    throw new Error('No image file received.');
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`);
  }
  if (!ALLOWED_MIME_TYPES.includes(String(mimeType).toLowerCase())) {
    throw new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, and WebP.');
  }

  const magicCheck = validateImageMagicBytes(buffer);
  if (!magicCheck.valid) {
    throw new Error(magicCheck.error);
  }

  requireCloudinaryConfig();
  const fileId = `${CLOUDINARY_FOLDER}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        public_id: path.basename(fileId),
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploadResult);
      }
    ).end(buffer);
  });

  const detectedExt = magicCheck.detectedExt || path.extname(originalName).toLowerCase();
  return {
    success: true,
    url: result.secure_url,
    fileId: result.public_id,
    size: buffer.length,
    mimeType: detectedExt === '.jpg' || detectedExt === '.jpeg'
      ? 'image/jpeg'
      : detectedExt === '.png' ? 'image/png' : 'image/webp',
  };
}

function cloudinaryPublicId(value) {
  if (value.startsWith(`${CLOUDINARY_FOLDER}/`)) {
    return value;
  }

  try {
    const url = new URL(value);
    if (!/(^|\.)cloudinary\.com$/i.test(url.hostname)) return '';
    const match = url.pathname.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return '';
    return decodeURIComponent(match[1]).replace(/\.[^.]+$/, '');
  } catch {
    return '';
  }
}

export async function deleteStoredImage(fileIdOrUrl) {
  if (!fileIdOrUrl || typeof fileIdOrUrl !== 'string') return false;

  const publicId = cloudinaryPublicId(fileIdOrUrl);
  if (publicId) {
    requireCloudinaryConfig();
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result.result === 'ok';
  }

  let filename = fileIdOrUrl;
  if (filename.startsWith('/uploads/covers/')) {
    filename = filename.slice('/uploads/covers/'.length);
  } else if (filename.includes('/')) {
    return false;
  }

  filename = path.basename(filename);
  if (!/^cover-[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) return false;

  const targetPath = path.resolve(UPLOADS_DIR, filename);
  if (!targetPath.startsWith(`${UPLOADS_DIR}${path.sep}`) || !fs.existsSync(targetPath)) return false;

  fs.unlinkSync(targetPath);
  return true;
}
