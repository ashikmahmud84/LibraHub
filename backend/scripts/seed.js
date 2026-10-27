/**
 * Standalone One-Time Database Seeding Script for LibraHub (Step 4)
 * 
 * Usage:
 *   node scripts/seed.js
 *   or:
 *   npm run seed
 * 
 * Safely inserts initial library catalog books from data/books.js into MongoDB.
 * Checks each book by its ISBN to prevent duplicate records.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBooksCollection, closeMongoClient } from '../lib/mongodb.js';
import { INITIAL_BOOKS } from '../data/books.js';
import { seedBooksIfEmpty } from '../lib/book-model.js';

// Load environment variables (.env.local first, then .env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

async function runSeed() {
  console.log('----------------------------------------------------');
  console.log('📚 LibraHub Database Seeder');
  console.log('----------------------------------------------------');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'LibraHub';

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local or .env.');
    console.error('Please configure your MongoDB connection string before running this script.');
    process.exit(1);
  }

  console.log(`Connecting to database: "${dbName}"...`);

  try {
    const collection = await getBooksCollection();
    const existingCount = await collection.countDocuments();
    console.log(`Existing documents in "books" collection: ${existingCount}`);

    if (existingCount > 0) {
      console.log('Checking for missing books by ISBN to avoid duplicate records...');
    }

    const result = await seedBooksIfEmpty(collection);

    const finalCount = await collection.countDocuments();
    console.log(`\n✅ Seeding finished successfully!`);
    console.log(`- Inserted new books: ${result.seeded ? result.count : 0}`);
    console.log(`- Total books now in catalog: ${finalCount}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('\n❌ Seeding failed with error:');
    console.error(error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  } finally {
    await closeMongoClient();
    process.exit(0);
  }
}

runSeed();
