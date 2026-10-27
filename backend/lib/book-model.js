import { INITIAL_BOOKS } from '../data/books.js';

/**
 * Validates book document payload according to LibraHub catalog schema (Step 4).
 * Preserves all fields from mock books: title, subtitle, author, category, isbn,
 * publisher, publicationYear, pages, language, shelfLocation, totalCopies,
 * availableCopies, isFeatured, coverImage, description, tableOfContents.
 *
 * @param {object} payload - Incoming book data
 * @param {boolean} [isUpdate=false] - Whether this is an update (PUT) or full creation (POST)
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
export function validateBookPayload(payload, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Request payload must be a JSON object.'],
      sanitized: {},
    };
  }

  // --- Title ---
  if (!isUpdate || payload.title !== undefined) {
    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      errors.push('Field "title" is required and must be a non-empty string.');
    } else {
      sanitized.title = payload.title.trim();
    }
  }

  // --- Subtitle ---
  if (payload.subtitle !== undefined) {
    if (typeof payload.subtitle === 'string') {
      sanitized.subtitle = payload.subtitle.trim();
    }
  }

  // --- Author ---
  if (!isUpdate || payload.author !== undefined) {
    if (typeof payload.author !== 'string' || !payload.author.trim()) {
      errors.push('Field "author" is required and must be a non-empty string.');
    } else {
      sanitized.author = payload.author.trim();
    }
  }

  // --- Category ---
  if (!isUpdate || payload.category !== undefined) {
    if (typeof payload.category !== 'string' || !payload.category.trim()) {
      errors.push('Field "category" is required and must be a non-empty string.');
    } else {
      sanitized.category = payload.category.trim();
    }
  }

  // --- ISBN ---
  if (!isUpdate || payload.isbn !== undefined) {
    if (typeof payload.isbn !== 'string' || !payload.isbn.trim()) {
      errors.push('Field "isbn" is required and must be a valid ISBN string.');
    } else {
      sanitized.isbn = payload.isbn.trim();
    }
  }

  // --- Publisher ---
  if (!isUpdate || payload.publisher !== undefined) {
    if (typeof payload.publisher !== 'string' || !payload.publisher.trim()) {
      errors.push('Field "publisher" is required and must be a non-empty string.');
    } else {
      sanitized.publisher = payload.publisher.trim();
    }
  }

  // --- Publication Year ---
  if (!isUpdate || payload.publicationYear !== undefined) {
    const year = Number(payload.publicationYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1000 || year > currentYear + 5) {
      errors.push(`Field "publicationYear" must be a valid four-digit year between 1000 and ${currentYear + 5}.`);
    } else {
      sanitized.publicationYear = year;
    }
  }

  // --- Pages ---
  if (payload.pages !== undefined) {
    const pages = Number(payload.pages);
    if (!Number.isInteger(pages) || pages <= 0) {
      errors.push('Field "pages" must be a positive integer.');
    } else {
      sanitized.pages = pages;
    }
  }

  // --- Language ---
  if (payload.language !== undefined) {
    sanitized.language = typeof payload.language === 'string' && payload.language.trim()
      ? payload.language.trim()
      : 'English';
  } else if (!isUpdate) {
    sanitized.language = 'English';
  }

  // --- Shelf Location ---
  if (payload.shelfLocation !== undefined) {
    sanitized.shelfLocation = typeof payload.shelfLocation === 'string' ? payload.shelfLocation.trim() : '';
  }

  // --- Total Copies ---
  let totalCopiesVal = undefined;
  if (!isUpdate || payload.totalCopies !== undefined) {
    const total = Number(payload.totalCopies);
    if (!Number.isInteger(total) || total < 0) {
      errors.push('Field "totalCopies" must be an integer greater than or equal to 0.');
    } else {
      totalCopiesVal = total;
      sanitized.totalCopies = total;
    }
  }

  // --- Available Copies ---
  if (!isUpdate || payload.availableCopies !== undefined) {
    const avail = Number(payload.availableCopies);
    if (!Number.isInteger(avail) || avail < 0) {
      errors.push('Field "availableCopies" must be an integer greater than or equal to 0.');
    } else if (totalCopiesVal !== undefined && avail > totalCopiesVal) {
      errors.push('Field "availableCopies" cannot exceed "totalCopies".');
    } else {
      sanitized.availableCopies = avail;
    }
  }

  // --- Description ---
  if (!isUpdate || payload.description !== undefined) {
    if (typeof payload.description !== 'string' || !payload.description.trim()) {
      errors.push('Field "description" is required and must provide an overview of the book.');
    } else {
      sanitized.description = payload.description.trim();
    }
  }

  // --- Cover Image ---
  if (payload.coverImage !== undefined) {
    if (typeof payload.coverImage === 'string') {
      const trimmed = payload.coverImage.trim();
      // Enforce rule: Do not store raw Base64 image strings directly in MongoDB
      if (trimmed.startsWith('data:image/') && trimmed.length > 512) {
        errors.push('Raw Base64 image data cannot be stored directly in MongoDB. Please upload using the Book Cover Image uploader.');
      } else {
        sanitized.coverImage = trimmed;
      }
    } else {
      sanitized.coverImage = '';
    }
  }

  // --- Cover Image File ID / Storage Key ---
  if (payload.coverImageFileId !== undefined) {
    sanitized.coverImageFileId = typeof payload.coverImageFileId === 'string' ? payload.coverImageFileId.trim() : '';
  }

  // --- Cover Image Storage Provider ('server', 'firebase', 'external') ---
  if (payload.coverImageStorage !== undefined) {
    sanitized.coverImageStorage = typeof payload.coverImageStorage === 'string' ? payload.coverImageStorage.trim() : 'server';
  }

  // --- Is Featured ---
  if (payload.isFeatured !== undefined) {
    sanitized.isFeatured = Boolean(payload.isFeatured);
  } else if (!isUpdate) {
    sanitized.isFeatured = false;
  }

  // --- Table of Contents ---
  if (payload.tableOfContents !== undefined) {
    if (Array.isArray(payload.tableOfContents)) {
      sanitized.tableOfContents = payload.tableOfContents.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof payload.tableOfContents === 'string') {
      sanitized.tableOfContents = payload.tableOfContents.split('\n').map((c) => c.trim()).filter(Boolean);
    }
  }

  // Never allow client to tamper with _id
  delete sanitized._id;

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Seeds the books collection with INITIAL_BOOKS if the collection is empty.
 * @param {import('mongodb').Collection} collection
 * @returns {Promise<{ seeded: boolean, count: number }>}
 */
export async function seedBooksIfEmpty(collection) {
  const count = await collection.countDocuments();
  if (count > 0) {
    return { seeded: false, count };
  }

  const documents = INITIAL_BOOKS.map((book) => ({
    title: book.title,
    subtitle: book.subtitle || '',
    author: book.author,
    category: book.category,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publicationYear,
    pages: book.pages || 0,
    language: book.language || 'English',
    shelfLocation: book.shelfLocation || '',
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    isFeatured: Boolean(book.isFeatured),
    coverImage: book.coverImage || '',
    description: book.description,
    tableOfContents: Array.isArray(book.tableOfContents) ? book.tableOfContents : [],
    legacyId: book.id,
    createdAt: book.createdAt ? new Date(book.createdAt) : new Date(),
    updatedAt: new Date(),
  }));

  const result = await collection.insertMany(documents);
  return { seeded: true, count: result.insertedCount };
}
