'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function BookCard({ book }) {
  const [imgError, setImgError] = useState(false);
  const isAvailable = book.availableCopies > 0;
  const bookId = book._id || book.id;

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      
      {/* Cover Showcase Container */}
      <Link href={`/books/${bookId}`} className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {!imgError && book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Book cover of ${book.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          /* Zero-Broken-Image Fallback Container */
          <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-center">
            <BookOpen className="h-10 w-10 text-blue-400 mb-3" />
            <span className="font-serif font-bold text-sm tracking-wide text-balance line-clamp-3">
              {book.title}
            </span>
            <span className="text-xs text-slate-400 mt-2 line-clamp-1">
              {book.author}
            </span>
          </div>
        )}

        {/* Availability Badge (Overlay) */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50/95 text-emerald-800 border border-emerald-200/80 backdrop-blur-xs shadow-xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{book.availableCopies} Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50/95 text-rose-800 border border-rose-200/80 backdrop-blur-xs shadow-xs">
              <XCircle className="h-3 w-3 text-rose-600" />
              <span>Unavailable</span>
            </span>
          )}
        </div>
      </Link>

      {/* Book Metadata & Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Unboxed Metadata (Zero-Pill Rule) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5 flex-wrap">
          <span className="text-blue-700 font-semibold">{book.category}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{book.publicationYear}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{book.pages || 0} pages</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-serif">
          <Link href={`/books/${bookId}`}>
            {book.title}
          </Link>
        </h3>

        {/* Author */}
        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
          By {book.author}
        </p>

        {/* Short Description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">
          {book.description}
        </p>

        {/* Card Footer: Shelf Location & View Details CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px] tabular-nums truncate max-w-[130px]" title={book.shelfLocation}>
            {book.shelfLocation || 'Main Stacks'}
          </span>
          <Link
            href={`/books/${bookId}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

    </article>
  );
}
