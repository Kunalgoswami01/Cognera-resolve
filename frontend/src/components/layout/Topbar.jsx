import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Bell, Search, ShieldAlert, CircleUser } from 'lucide-react';

export default function Topbar() {
  const location = useLocation();
  const { caseId } = useParams();

  // Simple breadcrumb generator
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/cases/new') return 'New Resolution Case';
    if (path.startsWith('/cases/') && caseId) return `Case Workspace`;
    if (path === '/documents') return 'Document Library';
    if (path === '/history') return 'Case History';
    if (path === '/settings') return 'Settings';
    return 'Cognera Resolve';
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 z-10">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-md font-semibold text-slate-100 tracking-wide">
          {getPageTitle()}
        </h2>
        {caseId && (
          <span className="text-[10px] font-mono text-slate-500">
            ID: {caseId}
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Search Mock */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search cases..."
            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 w-64 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-full transition-colors relative cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
        </button>

        {/* User Profile Mock */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <CircleUser className="h-6 w-6 text-slate-400" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-slate-200">Kunal Goswami</p>
            <p className="text-[9px] text-slate-500">Consumer Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
