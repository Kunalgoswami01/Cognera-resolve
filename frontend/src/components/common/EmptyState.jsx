import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function EmptyState({ title, description, actionText, onAction, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/20 max-w-md mx-auto my-8">
      {Icon && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-500 mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="font-semibold text-slate-200 text-base">{title}</h3>
      <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-sky-950/40 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
