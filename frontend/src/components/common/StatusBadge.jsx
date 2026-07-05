import React from 'react';

export default function StatusBadge({ status }) {
  const getStyle = () => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-slate-900 text-slate-400 border-slate-800';
      case 'analyzing':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'evidence_collection':
      case 'collecting':
        return 'bg-sky-950/40 text-sky-400 border-sky-900/50';
      case 'ready':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
      case 'resolved':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-850';
    }
  };

  const getLabel = () => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'analyzing':
        return 'Intake & Audit';
      case 'evidence_collection':
      case 'collecting':
        return 'Evidence Collection';
      case 'ready':
        return 'Ready for Review';
      case 'resolved':
        return 'Disputed / Resolved';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${getStyle()}`}>
      {getLabel()}
    </span>
  );
}
