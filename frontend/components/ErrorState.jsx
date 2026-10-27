import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = "Unable to Load Catalog",
  message = "An error occurred while connecting to the library catalog service.",
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 rounded-2xl border border-rose-200/80 max-w-lg mx-auto my-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 font-serif mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-rose-900 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors shadow-xs active:scale-[0.98]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-rose-600" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
