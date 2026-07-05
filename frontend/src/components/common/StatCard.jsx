import React from 'react';

export default function StatCard({ title, value, icon: Icon, description, trend, colorClass = "text-sky-500" }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xl shadow-slate-950/20">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
          {description && <span className="text-xs text-slate-500">{description}</span>}
          {trend && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              trend.startsWith('+') ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-rose-950/50 text-rose-400 border border-rose-900/50'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
