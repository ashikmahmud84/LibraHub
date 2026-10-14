import React from 'react';
import { BookX, RotateCcw } from 'lucide-react';

export default function EmptyState({
  title = "No Books Found",
  description = "We couldn't find any titles matching your current search criteria or category filter.",
  onReset,
  resetLabel = "Reset Filters"
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto my-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
        <BookX className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
}
