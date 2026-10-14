import { getBooksCollection, isValidObjectId, ObjectId } from '../../../../lib/mongodb.js';
import { validateBookPayload } from '../../../../lib/book-model.js';
import { verifyAdminAuthorization } from '../../../../lib/security.js';
import { deleteStoredImage } from '../../../../lib/image-storage.js';

/**
 * Helper to resolve dynamic route parameters in Next.js App Router (handles both Promise and Object)
 */
async function getParamId(params) {
  const resolved = params instanceof Promise ? await params : params;
  return resolved?.id;
}

/**
 * GET /api/books/[id]
 * Retrieves a single book by its MongoDB ObjectId.
 */
export async function GET(request, { params }) {
  try {
    const id = await getParamId(params);

    if (!id) {
      return Response.json(
        { success: false, error: 'Book ID parameter is required.' },
        { status: 400 }
      );
    }

    const isHexId = isValidObjectId(id);
    const isLegacyId = typeof id === 'string' && id.startsWith('lib-');

    if (!isHexId && !isLegacyId) {
      return Response.json(
        {
          success: false,
          error: `Invalid book ID "${id}". Expected a valid 24-character hexadecimal MongoDB ObjectId.`,
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
          error: 'Database connection failed. Unable to fetch book details.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    let book = null;
    if (isHexId) {
      book = await collection.findOne({ _id: new ObjectId(id) });
    } else {
      // Support lookups by legacy mock ID (e.g., 'lib-101') for backwards compatibility
      book = await collection.findOne({ legacyId: id });
    }

    if (!book) {
      return Response.json(
        { success: false, error: `Book not found in library collection for ID "${id}".` },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, book },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'An unexpected server error occurred while retrieving the book.',
        details: err?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/books/[id]
 * Validates and updates a book document by its MongoDB ObjectId.
 */
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.authorized) {
      return Response.json(
        {
          success: false,
          error: authResult.reason || 'Forbidden: Administrator authorization required to modify catalog.',
        },
        { status: 403 }
      );
    }

    const id = await getParamId(params);

    if (!id || !isValidObjectId(id)) {
      return Response.json(
        {
          success: false,
          error: `Invalid book ID format "${id}". Must be a valid 24-character hexadecimal MongoDB ObjectId.`,
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: 'Malformed JSON payload. Please provide a valid JSON body.' },
        { status: 400 }
      );
    }

    const validation = validateBookPayload(body, true);
    if (!validation.valid) {
      return Response.json(
        {
          success: false,
          error: 'Book update validation failed.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    if (Object.keys(validation.sanitized).length === 0) {
      return Response.json(
        { success: false, error: 'No valid update fields were provided in the request body.' },
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
          error: 'Database connection failed. Unable to update book record.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    // If updating ISBN, ensure no duplicate exists with another book
    if (validation.sanitized.isbn) {
      const duplicateBook = await collection.findOne({
        isbn: validation.sanitized.isbn,
        _id: { $ne: new ObjectId(id) },
      });
      if (duplicateBook) {
        return Response.json(
          {
            success: false,
            error: `Another book with ISBN "${validation.sanitized.isbn}" already exists in the catalog.`,
          },
          { status: 409 }
        );
      }
    }

    // Retrieve existing book to check previous cover image
    const existingBook = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingBook) {
      return Response.json(
        { success: false, error: `Book with ID "${id}" could not be found to update.` },
        { status: 404 }
      );
    }

    // If cover image is replaced or removed, safely clean up previous local file
    if (
      validation.sanitized.coverImage !== undefined &&
      existingBook.coverImage &&
      existingBook.coverImage !== validation.sanitized.coverImage &&
      existingBook.coverImage.startsWith('/uploads/covers/')
    ) {
      deleteStoredImage(existingBook.coverImage);
    }

    const updateDoc = {
      $set: {
        ...validation.sanitized,
        updatedAt: new Date(),
      },
    };

    const updatedBook = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateDoc,
      { returnDocument: 'after' }
    );

    return Response.json(
      {
        success: true,
        message: 'Book updated successfully.',
        book: updatedBook,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'An unexpected server error occurred while updating the book record.',
        details: err?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/books/[id]
 * Deletes a book record from MongoDB by its ObjectId.
 */
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.authorized) {
      return Response.json(
        {
          success: false,
          error: authResult.reason || 'Forbidden: Administrator authorization required to delete books.',
        },
        { status: 403 }
      );
    }

    const id = await getParamId(params);

    if (!id || !isValidObjectId(id)) {
      return Response.json(
        {
          success: false,
          error: `Invalid book ID format "${id}". Must be a valid 24-character hexadecimal MongoDB ObjectId.`,
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
          error: 'Database connection failed. Unable to delete book record.',
          details: dbErr?.message || 'MongoDB connection error',
        },
        { status: 503 }
      );
    }

    // Lookup book before deletion to clean up any stored cover image
    const bookToDelete = await collection.findOne({ _id: new ObjectId(id) });

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return Response.json(
        { success: false, error: `Book with ID "${id}" was not found or has already been deleted.` },
        { status: 404 }
      );
    }

    // Safely clean up local cover image file if present
    if (bookToDelete && bookToDelete.coverImage && bookToDelete.coverImage.startsWith('/uploads/covers/')) {
      deleteStoredImage(bookToDelete.coverImage);
    }

    return Response.json(
      {
        success: true,
        message: 'Book successfully deleted from library database.',
        id,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'An unexpected server error occurred while deleting the book.',
        details: err?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
