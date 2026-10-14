'use client';

import React from 'react';

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ""
}) {
  return (
    <div className={`overflow-x-auto pb-2 scrollbar-none ${className}`}>
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
