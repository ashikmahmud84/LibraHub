import React from 'react';

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  centered = false,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${centered ? 'text-center items-center' : ''} ${className}`}>
      <div className={`space-y-1.5 ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
        {kicker && (
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {kicker}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-600 text-pretty">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 pt-2 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}
