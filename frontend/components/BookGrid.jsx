'use client';

import React from 'react';
import BookCard from './BookCard.jsx';
import LoadingState from './LoadingState.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';

export default function BookGrid({
  books = [],
  loading = false,
  error = null,
  onRetry,
  onResetFilters,
  emptyMessage,
  gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}) {
  if (loading) {
    return <LoadingState count={8} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        description={emptyMessage}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {books.map((book, index) => (
        <BookCard key={book._id || book.id || book.isbn || `book-${index}`} book={book} />
      ))}
    </div>
  );
}
