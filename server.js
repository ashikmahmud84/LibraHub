import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Load environment variables (preserve .env.local precedence over .env)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Import Next.js App Router handlers
import { GET as getBooks, POST as postBook } from './app/api/books/route.js';
import { GET as getBookById, PUT as putBookById, DELETE as deleteBookById } from './app/api/books/[id]/route.js';
import { POST as seedBooks, GET as getSeedBooks } from './app/api/books/seed/route.js';

// Import image storage utilities and security helpers
import {
  saveImageBuffer,
  deleteStoredImage,
  UPLOADS_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from './lib/image-storage.js';
import { verifyAdminAuthorization } from './lib/security.js';
import { pingDatabase, getMongoConfig } from './lib/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Dev server runs on port 3000 behind internal nginx proxy
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Configure multer for memory storage (validates bytes in RAM before writing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, and WebP.'));
    }
  },
});

/**
 * Adapter to invoke Next.js App Router style handlers from Express routes
 */
async function adaptAppRoute(handler, req, res, params = {}) {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const url = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body !== undefined;
    const request = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const response = await handler(request, { params });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const data = await response.text();
    res.send(data);
  } catch (err) {
    console.error('API Adapter error in server.js:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error while executing API handler.',
      details: err?.message,
    });
  }
}

async function startServer() {
  const app = express();

  // Parse JSON bodies with up to 10MB limit (allows base64 fallback uploads)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure persistent covers directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // --- Serve persistent uploaded static assets (Must be before Vite middlewares) ---
  app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads'), {
    maxAge: '1d',
    fallthrough: false, // Return 404 for missing upload files instead of falling through to SPA
  }));

  // --- API Routes ---

  // Health / API status check (verifies live MongoDB Atlas connectivity)
  app.get('/api/health', async (req, res) => {
    const ping = await pingDatabase();
    res.status(ping.ok ? 200 : 503).json({
      success: ping.ok,
      service: 'LibraHub API Server',
      database: ping.database,
      databaseConnected: ping.ok,
      booksCount: ping.booksCount ?? null,
      error: ping.error || null,
      timestamp: new Date().toISOString(),
    });
  });

  // Storage Diagnostics & Status Endpoint
  app.get('/api/upload/status', (req, res) => {
    res.json({
      success: true,
      provider: 'server',
      storageActive: true,
      maxSizeBytes: MAX_FILE_SIZE,
      maxSizeMb: 5,
      allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      uploadDirectory: '/uploads/covers',
      firebase: {
        configured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'librahub-15352',
        bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'librahub-15352.firebasestorage.app',
        notice: 'Firebase Storage bucket returns 404 until provisioned in Firebase Console. LibraHub Server Persistent Storage is actively handling cover images.',
      },
    });
  });

  // Book Cover Image Upload (Admin Only)
  // Supports multipart/form-data via Multer OR JSON base64
  app.post(
    '/api/upload/cover',
    (req, res, next) => {
      upload.single('cover')(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'File is too large. Book cover images must not exceed 5 MB.',
            });
          }
          return res.status(400).json({
            success: false,
            error: err.message || 'File upload error.',
          });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        // 1. Verify Admin Authorization
        const auth = await verifyAdminAuthorization(req);
        if (!auth.authorized) {
          return res.status(403).json({
            success: false,
            error: auth.reason || 'Forbidden: Administrator credentials required to upload book covers.',
          });
        }

        let buffer;
        let originalName = 'cover.jpg';
        let mimeType = 'image/jpeg';

        // 2. Extract buffer from multipart/form-data OR JSON body
        if (req.file) {
          buffer = req.file.buffer;
          originalName = req.file.originalname;
          mimeType = req.file.mimetype;
        } else if (req.body && (req.body.imageBase64 || req.body.file)) {
          const rawBase64 = req.body.imageBase64 || req.body.file;
          const matches = rawBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            buffer = Buffer.from(matches[2], 'base64');
          } else {
            buffer = Buffer.from(rawBase64, 'base64');
          }
          originalName = req.body.filename || 'cover.jpg';
        }

        if (!buffer || buffer.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No image file received. Please select an image file (JPG, PNG, or WebP up to 5 MB).',
          });
        }

        // 3. Save buffer to persistent storage with magic byte verification
        const result = saveImageBuffer(buffer, originalName, mimeType);

        return res.status(201).json({
          success: true,
          message: 'Book cover image uploaded successfully.',
          url: result.url,
          fileId: result.fileId,
          size: result.size,
          mimeType: result.mimeType,
          storageProvider: 'server',
        });
      } catch (err) {
        console.error('Book cover upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message || 'Failed to process uploaded image.',
        });
      }
    }
  );

  // Delete Book Cover Image (Admin Only)
  app.delete('/api/upload/cover', async (req, res) => {
    try {
      const auth = await verifyAdminAuthorization(req);
      if (!auth.authorized) {
        return res.status(403).json({
          success: false,
          error: auth.reason || 'Forbidden: Administrator credentials required to remove cover images.',
        });
      }

      const fileId = req.query.fileId || req.body?.fileId || req.body?.url;
      if (!fileId) {
        return res.status(400).json({
          success: false,
          error: 'Parameter "fileId" or "url" is required.',
        });
      }

      const deleted = deleteStoredImage(String(fileId));
      return res.json({
        success: true,
        deleted,
        message: deleted ? 'Cover image removed successfully from server storage.' : 'File was already removed or not found.',
      });
    } catch (err) {
      console.error('Delete image error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete stored cover image.',
      });
    }
  });

  // POST & GET /api/books/seed
  app.post('/api/books/seed', (req, res) => adaptAppRoute(seedBooks, req, res));
  app.get('/api/books/seed', (req, res) => adaptAppRoute(getSeedBooks, req, res));

  // GET & POST /api/books
  app.get('/api/books', (req, res) => adaptAppRoute(getBooks, req, res));
  app.post('/api/books', (req, res) => adaptAppRoute(postBook, req, res));

  // GET, PUT, DELETE /api/books/:id
  app.get('/api/books/:id', (req, res) => adaptAppRoute(getBookById, req, res, { id: req.params.id }));
  app.put('/api/books/:id', (req, res) => adaptAppRoute(putBookById, req, res, { id: req.params.id }));
  app.delete('/api/books/:id', (req, res) => adaptAppRoute(deleteBookById, req, res, { id: req.params.id }));

  // --- Frontend Middleware (Dev: Vite middlewares, Prod: Static build) ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LibraHub full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
