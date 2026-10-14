import { getBooksCollection } from '../../../lib/mongodb.js';
import { validateBookPayload, seedBooksIfEmpty } from '../../../lib/book-model.js';
import { verifyAdminAuthorization } from '../../../lib/security.js';

/**
 * Helper to escape regex special characters
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * GET /api/books
 * Retrieves books from MongoDB with optional search, category, availability, and sorting filters.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const category = searchParams.get('category');
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sort') || 'title-asc';
    const isFeatured = searchParams.get('isFeatured');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(0, parseInt(searchParams.get('limit') || '0', 10)); // 0 means return all

    let collection;
    try {
      collection = await getBooksCollection();
      // Auto-seed initial books if database is empty on first connect
      await seedBooksIfEmpty(collection);
    } catch (dbErr) {
      return Response.json(
        {
          success: false,
          error: 'Database connection failed. Please verify that MONGODB_URI in .env.local points to an accessible MongoDB instance.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    // Build MongoDB filter query
    const mongoFilter = {};

    // 1. Text search
    if (searchQuery) {
      const sanitizedRegex = new RegExp(escapeRegex(searchQuery), 'i');
      const cleanIsbnRegex = new RegExp(escapeRegex(searchQuery.replace(/[-\s]/g, '')), 'i');

      mongoFilter.$or = [
        { title: sanitizedRegex },
        { subtitle: sanitizedRegex },
        { author: sanitizedRegex },
        { category: sanitizedRegex },
        { publisher: sanitizedRegex },
        { description: sanitizedRegex },
        { isbn: sanitizedRegex },
        { isbn: cleanIsbnRegex },
      ];
    }

    // 2. Category filter
    if (category && category !== 'All Categories' && category !== 'all') {
      mongoFilter.category = category;
    }

    // 3. Availability filter
    if (availability === 'available') {
      mongoFilter.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      mongoFilter.availableCopies = { $lte: 0 };
    }

    // 4. Featured filter
    if (isFeatured === 'true') {
      mongoFilter.isFeatured = true;
    } else if (isFeatured === 'false') {
      mongoFilter.isFeatured = false;
    }

    // 5. Sorting options
    let mongoSort = { title: 1 };
    switch (sortBy) {
      case 'title-asc':
        mongoSort = { title: 1 };
        break;
      case 'title-desc':
        mongoSort = { title: -1 };
        break;
      case 'year-desc':
        mongoSort = { publicationYear: -1, title: 1 };
        break;
      case 'year-asc':
        mongoSort = { publicationYear: 1, title: 1 };
        break;
      case 'recent':
        mongoSort = { createdAt: -1, publicationYear: -1 };
        break;
      default:
        mongoSort = { title: 1 };
    }

    const total = await collection.countDocuments(mongoFilter);

    let queryCursor = collection.find(mongoFilter).sort(mongoSort);

    if (limit > 0) {
      const skip = (page - 1) * limit;
      queryCursor = queryCursor.skip(skip).limit(limit);
    }

    const books = await queryCursor.toArray();

    return Response.json(
      {
        success: true,
        total,
        page: limit > 0 ? page : 1,
        limit: limit > 0 ? limit : total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
        books,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'An unexpected server error occurred while retrieving books.',
        details: err?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/books
 * Validates and inserts a new book document into MongoDB.
 */
export async function POST(request) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.authorized) {
      return Response.json(
        {
          success: false,
          error: authResult.reason || 'Forbidden: Administrator authorization required to add books.',
        },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Malformed JSON payload. Please provide a valid JSON request body.',
        },
        { status: 400 }
      );
    }

    // Validate payload against book schema
    const validation = validateBookPayload(body, false);
    if (!validation.valid) {
      return Response.json(
        {
          success: false,
          error: 'Book validation failed.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    let collection;
    try {
      collection = await getBooksCollection();
    } catch (dbErr) {
      return Response.json(
        {
          success: false,
          error: 'Database connection failed. Unable to insert book record.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    // Check for duplicate ISBN
    const existingBook = await collection.findOne({ isbn: validation.sanitized.isbn });
    if (existingBook) {
      return Response.json(
        {
          success: false,
          error: `A book with ISBN "${validation.sanitized.isbn}" is already cataloged (ID: ${existingBook._id}).`,
        },
        { status: 409 }
      );
    }

    const newBookDocument = {
      ...validation.sanitized,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newBookDocument);

    return Response.json(
      {
        success: true,
        message: 'Book created and cataloged successfully.',
        book: {
          _id: result.insertedId,
          ...newBookDocument,
        },
      },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'An unexpected server error occurred while creating the book record.',
        details: err?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
