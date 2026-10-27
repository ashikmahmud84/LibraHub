import { getBooksCollection } from '../../../../lib/mongodb.js';
import { seedBooksIfEmpty } from '../../../../lib/book-model.js';
import { INITIAL_BOOKS } from '../../../../data/books.js';
import { verifyAdminAuthorization } from '../../../../lib/security.js';

/**
 * POST /api/books/seed
 * Seeds or resets the books collection with the comprehensive dataset from data/books.js.
 */
export async function POST(request) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.authorized) {
      return Response.json(
        {
          success: false,
          error: authResult.reason || 'Forbidden: Administrator authorization required to seed the catalog.',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceReset = searchParams.get('force') === 'true';

    let collection;
    try {
      collection = await getBooksCollection();
    } catch (dbErr) {
      return Response.json(
        {
          success: false,
          error: 'Database connection failed. Unable to seed books.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    if (forceReset) {
      await collection.deleteMany({});
    }

    const { seeded, count } = await seedBooksIfEmpty(collection);

    return Response.json(
      {
        success: true,
        message: seeded
          ? `Successfully seeded ${count} books into MongoDB.`
          : `Collection already contains ${count} books. Pass ?force=true to reset.`,
        count,
      },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      { success: false, error: 'Failed to seed books.', details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return POST(request);
}
