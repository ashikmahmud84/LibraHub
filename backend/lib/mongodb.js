import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

/**
 * MongoDB Atlas client connection utility for LibraHub.
 * Uses official mongodb Node.js driver (no Mongoose).
 * Reuses the MongoClient connection promise to prevent connection leaks.
 */

// Ensure environment variables from .env.local and .env are loaded reliably
function ensureEnvLoaded() {
  if (!process.env.MONGODB_URI) {
    try {
      const cwd = process.cwd();
      dotenv.config({ path: path.resolve(cwd, '.env.local') });
      dotenv.config({ path: path.resolve(cwd, '.env') });
    } catch {
      // Non-filesystem or browser fallback
    }
  }
}

ensureEnvLoaded();

/**
 * Returns sanitized MONGODB_URI and MONGODB_DB values.
 * Removes surrounding quotes and trims whitespace.
 * Defaults database name to 'LibraHub'.
 *
 * @returns {{ uri: string, dbName: string }}
 */
export function getMongoConfig() {
  ensureEnvLoaded();
  const rawUri = process.env.MONGODB_URI || '';
  const rawDb = process.env.MONGODB_DB || '';

  const uri = typeof rawUri === 'string' ? rawUri.trim().replace(/^["']|["']$/g, '') : '';
  const dbName = typeof rawDb === 'string' && rawDb.trim()
    ? rawDb.trim().replace(/^["']|["']$/g, '')
    : 'LibraHub';

  return { uri, dbName };
}

/**
 * Safely masks credentials in a MongoDB URI string to avoid exposing secrets in logs.
 * e.g. "mongodb+srv://user:pass@cluster.mongodb.net/..." -> "mongodb+srv://user:*****@cluster.mongodb.net/..."
 *
 * @param {string} uri
 * @returns {string}
 */
export function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '[not configured]';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1*****$3');
}

const clientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
};

/**
 * Returns a connected MongoClient promise, reusing the existing instance across requests.
 * Safely logs connection status without exposing credentials.
 * Resets cached promise on connection failures so subsequent requests can retry cleanly.
 *
 * @returns {Promise<import('mongodb').MongoClient>}
 */
export async function getClientPromise() {
  const { uri, dbName } = getMongoConfig();

  if (!uri) {
    const errorMsg = 'Database configuration missing: MONGODB_URI is not defined in environment variables or .env.local.';
    console.error(`[MongoDB] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Reuse existing connection promise if present
  if (global._mongoClientPromise) {
    return global._mongoClientPromise;
  }

  console.log(`[MongoDB] Initializing connection to database "${dbName}" via Atlas (${maskMongoUri(uri)})...`);

  const client = new MongoClient(uri, clientOptions);

  global._mongoClientPromise = client
    .connect()
    .then((connectedClient) => {
      console.log(`[MongoDB] ✅ Live connection established successfully to database "${dbName}".`);
      return connectedClient;
    })
    .catch((err) => {
      // Clear cached promise on failure so next request can attempt a fresh connection
      global._mongoClientPromise = null;
      const sanitizedMsg = maskMongoUri(err?.message || 'Connection failed');
      console.error(`[MongoDB] ❌ Live connection error: ${sanitizedMsg}`);
      throw new Error(`MongoDB connection failed: ${sanitizedMsg}`);
    });

  return global._mongoClientPromise;
}

/**
 * Returns the MongoDB Database instance.
 * Defaults to 'LibraHub' or process.env.MONGODB_DB.
 *
 * @param {string} [customDbName]
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDatabase(customDbName) {
  const { dbName: defaultDb } = getMongoConfig();
  const targetDbName = customDbName || defaultDb || 'LibraHub';
  const connectedClient = await getClientPromise();
  return connectedClient.db(targetDbName);
}

/**
 * Helper to get the books collection.
 *
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getBooksCollection() {
  const db = await getDatabase();
  return db.collection('books');
}

/**
 * Verifies live database connectivity and returns connection diagnostics.
 *
 * @returns {Promise<{ ok: boolean, database: string, booksCount?: number, error?: string }>}
 */
export async function pingDatabase() {
  try {
    const { dbName } = getMongoConfig();
    const db = await getDatabase();
    const pingResult = await db.command({ ping: 1 });
    const booksCount = await db.collection('books').countDocuments();
    return {
      ok: pingResult?.ok === 1,
      database: db.databaseName || dbName,
      booksCount,
    };
  } catch (err) {
    return {
      ok: false,
      database: getMongoConfig().dbName,
      error: maskMongoUri(err?.message || 'Database unreachable'),
    };
  }
}

/**
 * Validates whether an ID string is a valid 24-character hexadecimal MongoDB ObjectId.
 *
 * @param {string|any} id
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id) && ObjectId.isValid(id);
}

/**
 * Gracefully close the MongoDB client connection.
 */
export async function closeMongoClient() {
  if (global._mongoClientPromise) {
    try {
      const clientInstance = await global._mongoClientPromise;
      await clientInstance.close();
      console.log('[MongoDB] Connection closed gracefully.');
    } catch (err) {
      console.warn('[MongoDB] Warning during connection close:', maskMongoUri(err?.message));
    } finally {
      global._mongoClientPromise = null;
    }
  }
}

// Default export is client promise getter for compatibility
export const clientPromise = {
  then(...args) {
    return getClientPromise().then(...args);
  },
  catch(...args) {
    return getClientPromise().catch(...args);
  },
};

export { ObjectId };
export default clientPromise;
