import React from 'react';

export default function LoadingState({ count = 8, message = "Loading library catalog..." }) {
  return (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>{message}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse"
          >
            <div className="aspect-[3/4] bg-slate-200/70 w-full" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="space-y-1.5 pt-2">
                <div className="h-2.5 bg-slate-100 rounded w-full" />
                <div className="h-2.5 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
