import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="space-y-4 w-full">
        {items.map((_, idx) => (
          <div key={idx} className="flex items-center space-x-4 animate-pulse p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="h-10 w-10 bg-slate-800 rounded-lg"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-800 rounded w-1/4"></div>
              <div className="h-2 bg-slate-800 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // default to card skeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {items.map((_, idx) => (
        <div key={idx} className="animate-pulse bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-40 flex flex-col justify-between">
          <div>
            <div className="h-2 bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-2 bg-slate-800 rounded w-1/4"></div>
            <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
