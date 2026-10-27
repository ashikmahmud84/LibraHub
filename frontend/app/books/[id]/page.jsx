'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  MapPin, 
  Bookmark, 
  Share2, 
  AlertCircle,
  FileText,
  Lock,
  Building,
  RotateCcw,
  Sparkles,
  Trash2,
  Edit3,
  Loader2,
  Database,
  X
} from 'lucide-react';
import { getBookById, getRelatedBooks, INITIAL_BOOKS } from '../../../data/books.js';
import BookCard from '../../../components/BookCard.jsx';
import SectionHeading from '../../../components/SectionHeading.jsx';
import BookCoverUpload from '../../../components/BookCoverUpload.jsx';
import { useAuth } from '../../../lib/auth-context.jsx';
import { apiUrl, coverImageUrl, getAuthHeaders } from '../../../lib/api.js';

export default function BookDetailPage({ params: propParams }) {
  const router = useRouter();
  const hookParams = useParams();
  const { user } = useAuth();
  const id = propParams?.id || hookParams?.id;

  // Local state
  const [book, setBook] = useState(() => getBookById(id));
  const [loading, setLoading] = useState(!book);
  const [fetchError, setFetchError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Edit / Delete state for MongoDB API
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    shelfLocation: '',
    totalCopies: 0,
    availableCopies: 0,
    coverImage: '',
    coverImageFileId: '',
  });
  const [actionNotice, setActionNotice] = useState(null);

  // Fetch book details from /api/books/[id]
  useEffect(() => {
    let isMounted = true;
    async function loadBookData() {
      if (!id) return;
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch(apiUrl(`/api/books/${id}`));
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.book) {
            setBook(data.book);
            setEditForm({
              title: data.book.title,
              shelfLocation: data.book.shelfLocation || '',
              totalCopies: data.book.totalCopies,
              availableCopies: data.book.availableCopies,
              coverImage: data.book.coverImage || '',
              coverImageFileId: data.book.coverImageFileId || '',
              coverImageStorage: data.book.coverImageStorage || '',
            });
            setLoading(false);
            return;
          }
        }

        // If not found in API or server offline, fall back to INITIAL_BOOKS
        const local = getBookById(id);
        if (isMounted) {
          if (local) {
            setBook(local);
            setEditForm({
              title: local.title,
              shelfLocation: local.shelfLocation || '',
              totalCopies: local.totalCopies,
              availableCopies: local.availableCopies,
              coverImage: local.coverImage || '',
              coverImageFileId: local.coverImageFileId || '',
              coverImageStorage: local.coverImageStorage || '',
            });
          } else {
            setFetchError(`Catalog record "${id}" was not found.`);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const local = getBookById(id);
          if (local) {
            setBook(local);
          } else {
            setFetchError(err.message || 'Error retrieving book details.');
          }
          setLoading(false);
        }
      }
    }

    loadBookData();
    return () => { isMounted = false; };
  }, [id]);

  // Handle Book Deletion (DELETE /api/books/[id])
  const handleConfirmDelete = async () => {
    const bookId = book?._id || book?.id;
    if (!bookId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(apiUrl(`/api/books/${bookId}`), {
        method: 'DELETE',
        headers: await getAuthHeaders(user, {
          'Content-Type': 'application/json',
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsDeleteModalOpen(false);
        setActionNotice({ type: 'success', message: 'Book successfully deleted from MongoDB.' });
        setTimeout(() => {
          router.push('/books');
        }, 1200);
      } else {
        setActionNotice({ type: 'error', message: data.error || 'Failed to delete book record.' });
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: 'Error contacting server to delete book record.' });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Book Update (PUT /api/books/[id])
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const bookId = book?._id || book?.id;
    if (!bookId) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(apiUrl(`/api/books/${bookId}`), {
        method: 'PUT',
        headers: await getAuthHeaders(user, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok && data.success && data.book) {
        setBook(data.book);
        setImgError(false);
        setIsEditModalOpen(false);
        setActionNotice({ type: 'success', message: 'Book record updated in MongoDB successfully!' });
      } else {
        setActionNotice({ type: 'error', message: data.error || 'Failed to update book record.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: 'Network error updating book record.' });
    } finally {
      setIsSavingEdit(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-bold font-serif text-slate-800">
          Querying Library Catalog & MongoDB...
        </h2>
        <p className="text-sm text-slate-500 mt-1">Retrieving catalog monograph record for ID {id}</p>
      </div>
    );
  }

  // Not Found display
  if (!book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-5 border border-slate-200">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block mb-2">
          Catalog Lookup Error
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mb-3">
          Book Not Found
        </h1>
        <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
          No catalog record was found matching ID <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono text-xs">{id || 'unknown'}</code>. The title may have been de-indexed or moved to special archives.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Books Catalog</span>
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const bookIdentifier = book._id || book.id;
  const relatedBooks = getRelatedBooks(book.id || book._id, book.category, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          {book._id && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-sans text-[11px] font-medium">
              <Database className="h-3 w-3" />
              <span>MongoDB ID</span>
            </span>
          )}
          <span>ID: {bookIdentifier}</span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-xl border mb-6 text-xs sm:text-sm flex items-center gap-2.5 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Main Book Detail Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10">
          
          {/* Left Column: Book Cover Display */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/80">
              {!imgError && book.coverImage ? (
                <img
                  src={coverImageUrl(book.coverImage)}
                  alt={`Cover of ${book.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
                  <BookOpen className="h-16 w-16 text-blue-400 mb-4" />
                  <h2 className="font-serif font-bold text-xl">{book.title}</h2>
                  <p className="text-slate-400 text-sm mt-2">{book.author}</p>
                </div>
              )}
            </div>

            {/* Quick Actions (Bookmark & Share) */}
            <div className="w-full max-w-md mt-4 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSavedBookmark(!savedBookmark)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border transition-colors ${
                  savedBookmark
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${savedBookmark ? 'fill-blue-600 text-blue-600' : ''}`} />
                <span>{savedBookmark ? 'Saved to Reading List' : 'Bookmark Title'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                title="Copy link"
              >
                <Share2 className="h-4 w-4" />
                <span>{copyFeedback ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Catalog Admin Actions (Edit / Delete via MongoDB APIs) */}
            <div className="w-full max-w-md mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                title="Update copies or details (PUT /api/books/[id])"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                <span>Edit Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-medium transition-colors disabled:opacity-50"
                title="Delete from database (DELETE /api/books/[id])"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Description, and Borrow Module */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Category & Availability Status Tag */}
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {book.category}
              </span>

              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Available ({book.availableCopies} of {book.totalCopies} copies in stock)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Unavailable (All {book.totalCopies} copies in circulation)</span>
                </span>
              )}
            </div>

            {/* Title & Author */}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif tracking-tight leading-tight mb-2">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-base text-slate-600 font-medium mb-3">
                {book.subtitle}
              </p>
            )}
            <p className="text-sm text-slate-700 font-medium mb-6">
              By <span className="font-semibold text-slate-900">{book.author}</span>
            </p>

            {/* Specification Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">ISBN</span>
                <span className="text-slate-900 font-mono tabular-nums font-semibold mt-0.5 block">{book.isbn}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Publisher</span>
                <span className="text-slate-900 font-semibold mt-0.5 block truncate" title={book.publisher}>{book.publisher}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Publication Year</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{book.publicationYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Copies</span>
                <span className="text-slate-900 tabular-nums font-semibold mt-0.5 block">{book.totalCopies} volumes</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Description & Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Table of Contents Preview */}
            {book.tableOfContents && book.tableOfContents.length > 0 && (
              <div className="space-y-3 mb-8">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Chapter Directory
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {book.tableOfContents.map((chapter, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shelf Location & Borrow Module */}
            <div className="mt-auto p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Shelf Call Number: <strong className="font-semibold text-slate-900">{book.shelfLocation || 'Main Wing A'}</strong>
                </span>
              </div>

              {/* Borrow Button Container */}
              <div className="shrink-0 flex items-center gap-3">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={() => setBorrowModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-[0.98]"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Borrow Book</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={true}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300"
                    aria-disabled="true"
                    title="No copies currently available in library inventory"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Currently Unavailable</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Borrow Book Modal */}
      {borrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              {user ? <CheckCircle2 className="h-6 w-6 text-blue-600" /> : <Lock className="h-6 w-6" />}
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">
              {user ? 'Patron Authorization Verified' : 'Patron Sign In Required'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {user ? (
                <>
                  You are signed in as <strong className="text-slate-900">{user.displayName || user.email}</strong>. Live catalog checkout records and circulation queuing will be wired in Step 4 with MongoDB.
                </>
              ) : (
                <>
                  To borrow <strong className="text-slate-900">{book.title}</strong>, please sign in to your library account. A return route has been preserved so you will return directly to this book after signing in.
                </>
              )}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-6">
              <div className="flex items-center justify-between">
                <span>Available Copies:</span>
                <strong className="text-emerald-700 font-semibold tabular-nums">{book.availableCopies} left</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Loan Allocation:</span>
                <span className="font-medium text-slate-900">21 Days Standard</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pickup Location:</span>
                <span className="font-medium text-slate-900">{book.shelfLocation || 'Main Stacks'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBorrowModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {user ? 'Close' : 'Cancel'}
              </button>
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setBorrowModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/books/${bookIdentifier}`)}`}
                  onClick={() => setBorrowModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span>Continue to Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal (PUT /api/books/[id]) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block">
                  Catalog Curator Area
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Edit Book & Inventory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-5">
              Updates record in MongoDB via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">PUT /api/books/[id]</code>.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-5 text-xs">
              {/* Title Field */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Shelf Location & Copies Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={editForm.shelfLocation}
                    onChange={(e) => setEditForm({ ...editForm, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.totalCopies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10) || 0;
                      setEditForm({
                        ...editForm,
                        totalCopies: total,
                        availableCopies: Math.min(editForm.availableCopies, total),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Available Copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editForm.totalCopies}
                    required
                    value={editForm.availableCopies}
                    onChange={(e) => setEditForm({ ...editForm, availableCopies: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Book Cover Image Upload Section */}
              <div className="pt-4 border-t border-slate-100">
                <BookCoverUpload
                  currentCoverUrl={editForm.coverImage}
                  currentFileId={editForm.coverImageFileId}
                  bookTitle={editForm.title || book?.title}
                  bookAuthor={book?.author}
                  disabled={isSavingEdit}
                  onCoverChange={({ url, fileId }) => {
                    setEditForm((prev) => ({
                      ...prev,
                      coverImage: url,
                      coverImageFileId: fileId,
                      coverImageStorage: url ? 'cloudinary' : '',
                    }));
                  }}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs text-xs"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoids window.confirm / window.alert) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">
              Remove Book from Catalog
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">"{book.title}"</strong>? This will permanently remove the record from MongoDB.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs text-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section className="mt-12">
          <SectionHeading
            kicker="Related Holdings"
            title="More in this Discipline"
            subtitle={`Explore other curated monographs in ${book.category}.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id || relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
