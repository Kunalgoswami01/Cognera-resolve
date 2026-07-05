import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, History, Settings, Scale, PlusCircle } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <Scale className="h-6 w-6 text-sky-500" />
          <span className="font-bold text-lg tracking-wider text-slate-100 uppercase">
            Cognera Resolve
          </span>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <NavLink
            to="/cases/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-950/50 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Case</span>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="mt-2 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/80 text-sky-400 border border-slate-700/55'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Tagline */}
      <div className="p-4 border-t border-slate-800/70 text-center text-[10px] text-slate-500 uppercase tracking-widest">
        From Problem to Resolution
      </div>
    </aside>
  );
}
