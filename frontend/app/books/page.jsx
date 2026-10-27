'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  RotateCcw,
  PlusCircle,
  Database,
  Sparkles,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { INITIAL_BOOKS, CATEGORIES } from '../../data/books.js';
import SearchBar from '../../components/SearchBar.jsx';
import CategoryFilter from '../../components/CategoryFilter.jsx';
import BookGrid from '../../components/BookGrid.jsx';
import SectionHeading from '../../components/SectionHeading.jsx';
import Pagination from '../../components/Pagination.jsx';
import BookCoverUpload from '../../components/BookCoverUpload.jsx';
import { useAuth } from '../../lib/auth-context.jsx';
import { apiUrl, getAuthHeaders } from '../../lib/api.js';

const PAGE_SIZE = 8;

export default function BooksPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  // State from URL query or defaults
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [sortBy, setSortBy] = useState('title-asc'); // 'title-asc', 'title-desc', 'year-desc', 'year-asc', 'recent'
  const [currentPage, setCurrentPage] = useState(1);
  
  // API & Database state
  const [booksList, setBooksList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [dbConnected, setDbConnected] = useState(null); // true = live MongoDB, false = fallback
  const [actionNotification, setActionNotification] = useState(null);

  // Modal state for Add Book (POST /api/books)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    subtitle: '',
    author: '',
    category: 'Computer Science',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    pages: 350,
    shelfLocation: '2nd Floor · Stacks B-04',
    totalCopies: 5,
    availableCopies: 5,
    description: '',
    coverImage: '',
    coverImageFileId: '',
    coverImageStorage: 'cloudinary',
    isFeatured: false,
  });

  // Simulation toggles for QA preview
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  // Sync state if URL query parameters change externally
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q !== null) setSearch(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Reset to page 1 whenever search, category, availability, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, availabilityFilter, sortBy]);

  // Fetch books from /api/books API
  const fetchBooksFromApi = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set('q', search.trim());
      if (selectedCategory && selectedCategory !== 'All Categories') queryParams.set('category', selectedCategory);
      if (availabilityFilter !== 'all') queryParams.set('availability', availabilityFilter);
      if (sortBy) queryParams.set('sort', sortBy);

      const res = await fetch(apiUrl(`/api/books?${queryParams.toString()}`));
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.books)) {
          setBooksList(data.books);
          setDbConnected(true);
          setIsLoading(false);
          return;
        }
      }

      // If database not configured or offline (503/error), handle gracefully with local dataset
      const errJson = await res.json().catch(() => ({}));
      setDbConnected(false);
      
      // Perform client-side filtering on INITIAL_BOOKS fallback
      let fallback = [...INITIAL_BOOKS];
      const trimmedSearch = search.trim().toLowerCase();
      if (trimmedSearch) {
        fallback = fallback.filter((b) => {
          return (
            b.title?.toLowerCase().includes(trimmedSearch) ||
            b.author?.toLowerCase().includes(trimmedSearch) ||
            b.isbn?.toLowerCase().replace(/[-\s]/g, '').includes(trimmedSearch.replace(/[-\s]/g, '')) ||
            b.category?.toLowerCase().includes(trimmedSearch) ||
            b.publisher?.toLowerCase().includes(trimmedSearch) ||
            b.description?.toLowerCase().includes(trimmedSearch)
          );
        });
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        fallback = fallback.filter((b) => b.category === selectedCategory);
      }
      if (availabilityFilter === 'available') {
        fallback = fallback.filter((b) => b.availableCopies > 0);
      } else if (availabilityFilter === 'unavailable') {
        fallback = fallback.filter((b) => b.availableCopies === 0);
      }
      fallback.sort((a, b) => {
        switch (sortBy) {
          case 'title-asc': return a.title.localeCompare(b.title);
          case 'title-desc': return b.title.localeCompare(a.title);
          case 'year-desc': return b.publicationYear - a.publicationYear;
          case 'year-asc': return a.publicationYear - b.publicationYear;
          case 'recent': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default: return 0;
        }
      });

      setBooksList(fallback);
      setIsLoading(false);
    } catch (err) {
      setDbConnected(false);
      setBooksList(INITIAL_BOOKS);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksFromApi();
  }, [search, selectedCategory, availabilityFilter, sortBy]);

  // Paginated books slice
  const totalPages = Math.ceil(booksList.length / PAGE_SIZE) || 1;
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return booksList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [booksList, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setAvailabilityFilter('all');
    setSortBy('title-asc');
    setCurrentPage(1);
    setSimulateError(false);
    setSimulateLoading(false);
  };

  // Seed or Reset MongoDB database
  const handleSeedDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(apiUrl('/api/books/seed?force=true'), {
        method: 'POST',
        headers: await getAuthHeaders(user),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotification({ type: 'success', message: data.message });
        setDbConnected(true);
        await fetchBooksFromApi();
      } else {
        setActionNotification({ 
          type: 'error', 
          message: data.error || 'Could not seed database. Please check MONGODB_URI in .env.local.' 
        });
      }
    } catch (err) {
      setActionNotification({ 
        type: 'error', 
        message: 'Failed to contact seed endpoint. Verify MongoDB connection.' 
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionNotification(null), 5000);
    }
  };

  // Handle Add Book Submission (POST /api/books)
  const handleCreateBook = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmittingBook(true);

    try {
      const res = await fetch(apiUrl('/api/books'), {
        method: 'POST',
        headers: await getAuthHeaders(user, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(newBookForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAddModalOpen(false);
        setActionNotification({
          type: 'success',
          message: `Book "${data.book.title}" cataloged successfully with MongoDB ObjectId: ${data.book._id || 'assigned'}`
        });
        // Reset form
        setNewBookForm({
          title: '',
          subtitle: '',
          author: '',
          category: 'Computer Science',
          isbn: '',
          publisher: '',
          publicationYear: new Date().getFullYear(),
          pages: 350,
          shelfLocation: '2nd Floor · Stacks B-04',
          totalCopies: 5,
          availableCopies: 5,
          description: '',
          coverImage: '',
          coverImageFileId: '',
          coverImageStorage: 'cloudinary',
          isFeatured: false,
        });
        await fetchBooksFromApi();
      } else {
        if (data.details && Array.isArray(data.details)) {
          setFormErrors(data.details);
        } else {
          setFormErrors([data.error || 'Failed to create book record.']);
        }
      }
    } catch (err) {
      setFormErrors(['Network or server error while submitting book record.']);
    } finally {
      setIsSubmittingBook(false);
    }
  };

  const hasActiveFilters = 
    search.trim() !== '' || 
    selectedCategory !== 'All Categories' || 
    availabilityFilter !== 'all' || 
    sortBy !== 'title-asc';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <SectionHeading
            kicker="Catalog Holdings · Step 4 MongoDB"
            title="Library Books & Research Monographs"
            subtitle="Explore our comprehensive physical holdings, modern monographs, and reservable research volumes stored in MongoDB with full RESTful API query support."
          />
        </div>

        {/* Action Buttons: Add Book & Sync/Seed Database */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSeedDatabase}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            title="Populate or reset MongoDB collection with all 14 sample books"
          >
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Seed Database</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-blue-400" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Database Status & Notification Banners */}
      {actionNotification && (
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 text-xs sm:text-sm ${
          actionNotification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionNotification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{actionNotification.message}</div>
          <button
            type="button"
            onClick={() => setActionNotification(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {dbConnected === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>MongoDB Notice:</strong> Live database connection unreachable. Showing local fallback catalog. To sync live MongoDB, verify <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">MONGODB_URI</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
            </span>
          </div>
          <button
            type="button"
            onClick={fetchBooksFromApi}
            className="text-amber-900 font-semibold underline hover:text-amber-950 shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {dbConnected === true && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3.5 py-2 mb-6 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>MongoDB Connected:</strong> Serving live book documents from collection <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono text-[11px]">librahub.books</code>.
          </span>
        </div>
      )}

      {/* Control Strip (Search + Filter Controls) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-8 space-y-5">
        
        {/* Row 1: Search & Dropdown Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search by title, author, ISBN, category, or publisher..."
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Availability Filter dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="avail-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Availability:
              </label>
              <select
                id="avail-select"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Books ({booksList.length})</option>
                <option value="available">Available (Copies &gt; 0)</option>
                <option value="unavailable">Unavailable (0 Copies)</option>
              </select>
            </div>

            {/* Sorting dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
                <option value="year-desc">Publication Year: Newest First</option>
                <option value="year-asc">Publication Year: Oldest First</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Categories Segmented Control */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Developer / Design State Preview Toggles */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                setSimulateLoading(true);
                setTimeout(() => setSimulateLoading(false), 1200);
              }}
              className="px-2.5 py-1 text-[11px] rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Test skeleton loading state"
            >
              Preview Loading
            </button>
            <button
              type="button"
              onClick={() => setSimulateError(!simulateError)}
              className="px-2.5 py-1 text-[11px] rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Test error state banner"
            >
              {simulateError ? 'Clear Error' : 'Preview Error'}
            </button>
          </div>
        </div>

      </div>

      {/* Active Filter Chips & Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">
            Total results:{' '}
            <strong className="font-bold text-slate-900 tabular-nums">
              {booksList.length}
            </strong>{' '}
            {booksList.length === 1 ? 'book' : 'books'}
          </span>

          {/* Active Filter Tags */}
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
              <span>Query: "{search}"</span>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="hover:text-blue-950 p-0.5"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'All Categories' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
              <span>{selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('All Categories')}
                className="hover:text-blue-950 p-0.5"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {availabilityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
              <span>Status: {availabilityFilter === 'available' ? 'Available Only' : 'Unavailable Only'}</span>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className="hover:text-blue-950 p-0.5"
                aria-label="Remove availability filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Book Grid Component */}
      <BookGrid
        books={paginatedBooks}
        loading={isLoading || simulateLoading}
        error={simulateError ? "Simulated API Network Timeout: Failed to reach catalog microservice." : apiError}
        onRetry={fetchBooksFromApi}
        onResetFilters={handleResetFilters}
        emptyMessage={
          search || selectedCategory !== 'All Categories' || availabilityFilter !== 'all'
            ? `No titles match your combined search and filter criteria. Try clearing some filters or searching with different keywords.`
            : "No books are currently indexed in the catalog."
        }
      />

      {/* Pagination Component */}
      {!isLoading && !simulateLoading && !simulateError && booksList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            setCurrentPage(newPage);
            window.scrollTo({ top: 200, behavior: 'smooth' });
          }}
          totalItems={booksList.length}
          pageSize={PAGE_SIZE}
        />
      )}

      {/* Modal: Add Book to Catalog (POST /api/books) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block">
                  Catalog Acquisition
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Add New Book to MongoDB
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>Please resolve the following:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleCreateBook} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                    placeholder="e.g. Distributed Consensus Systems"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBookForm.subtitle}
                    onChange={(e) => setNewBookForm({ ...newBookForm, subtitle: e.target.value })}
                    placeholder="e.g. Theory & Architecture"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    placeholder="e.g. Dr. Leslie Sterling"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    placeholder="e.g. 978-0-12-345678-9"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publisher *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookForm.publisher}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
                    placeholder="e.g. MIT Press"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publication Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={newBookForm.publicationYear}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publicationYear: parseInt(e.target.value, 10) || '' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newBookForm.totalCopies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10) || 0;
                      setNewBookForm({
                        ...newBookForm,
                        totalCopies: total,
                        availableCopies: Math.min(newBookForm.availableCopies, total),
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Copies *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={newBookForm.totalCopies}
                    required
                    value={newBookForm.availableCopies}
                    onChange={(e) => setNewBookForm({ ...newBookForm, availableCopies: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={newBookForm.shelfLocation}
                    onChange={(e) => setNewBookForm({ ...newBookForm, shelfLocation: e.target.value })}
                    placeholder="e.g. 3rd Floor · Tech Stacks A-14"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Abstract *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newBookForm.description}
                    onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                    placeholder="Provide a scholarly overview of the book's core themes and topics..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Clearly labeled Book Cover Image Upload Field */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <BookCoverUpload
                    currentCoverUrl={newBookForm.coverImage}
                    currentFileId={newBookForm.coverImageFileId}
                    bookTitle={newBookForm.title}
                    bookAuthor={newBookForm.author}
                    disabled={isSubmittingBook}
                    onCoverChange={({ url, fileId }) => {
                      setNewBookForm((prev) => ({
                        ...prev,
                        coverImage: url,
                        coverImageFileId: fileId,
                        coverImageStorage: 'cloudinary',
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBook}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmittingBook ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Validating & Cataloging...</span>
                    </>
                  ) : (
                    <span>Insert Book into MongoDB</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
