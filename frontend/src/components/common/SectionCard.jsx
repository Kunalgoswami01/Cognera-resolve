import React from 'react';

export default function SectionCard({ children, title, subtitle, action }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-slate-950/20">
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/40">
          <div>
            {title && <h3 className="font-semibold text-slate-100 text-sm">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
