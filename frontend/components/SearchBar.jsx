'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search by book title, author, category, or ISBN...",
  size = "md",
  className = "",
  onSubmit
}) {
  const isLarge = size === "lg";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search className={isLarge ? "h-5 w-5 text-slate-400" : "h-4 w-4 text-slate-400"} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search catalog"
          className={`w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
            isLarge
              ? "py-3.5 text-base shadow-sm"
              : "py-2.5 text-sm shadow-xs"
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
