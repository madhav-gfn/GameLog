import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'grid_view' },
  { path: '/library', label: 'Library', icon: 'library_books' },
  { path: '/discover', label: 'Discover', icon: 'monitoring' },
  { path: '/profile', label: 'Profile', icon: 'person' },
  { path: '/notifications', label: 'Notifications', icon: 'notifications' },
];

const labelClass = (expanded) => `overflow-hidden whitespace-nowrap transition-all duration-300 ${expanded ? 'max-w-[11rem] opacity-100' : 'max-w-0 opacity-0'}`;

/**
 * @param {{expanded?: boolean, pinned?: boolean, onTogglePinned?: () => void, onCreateLog?: () => void}} props
 */
export const Sidebar = ({ expanded = false, pinned = false, onTogglePinned, onCreateLog }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => {
    if (path === '/profile' && location.pathname === '/profile') {
      const searchParams = new URLSearchParams(location.search);
      const targetUser = searchParams.get('user');
      if (targetUser && targetUser !== user?.id) {
        return false;
      }
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-full flex-col" aria-label="Sidebar navigation">
      <div className={`border-b-2 border-graphite ${expanded ? 'px-4 py-5' : 'px-2 py-4'}`}>
        <div className={`flex ${expanded ? 'items-center justify-between gap-3' : 'flex-col items-center gap-4'}`}>
          <button
            type="button"
            onClick={onTogglePinned}
            aria-label={pinned ? 'Collapse navigation' : 'Pin navigation open'}
            aria-pressed={pinned}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-graphite bg-background-dark/70 text-gray-300 transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-2xl">{expanded ? 'menu_open' : 'menu'}</span>
          </button>

          <Link
            to="/"
            className={`flex min-w-0 items-center gap-3 text-left hover:no-underline ${expanded ? 'flex-1' : 'flex-col justify-center'}`}
            title="Go to dashboard"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-glow-yellow">
              <span className="material-symbols-outlined text-navy font-bold text-2xl">sports_esports</span>
            </div>
            <div className={labelClass(expanded)}>
              <h1 className="text-white text-lg font-bold uppercase tracking-widest leading-none">GAMELOG</h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Control Center</p>
            </div>
          </Link>
        </div>
      </div>

      <nav className={`flex-1 py-6 ${expanded ? 'px-3' : 'px-2'}`} aria-label="Main links">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className={`group flex items-center rounded-xl font-bold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                expanded
                  ? 'gap-4 px-4 py-3 justify-start'
                  : 'mx-auto h-12 w-12 justify-center'
              } ${
                isActive(item.path) ? 'bg-primary text-navy shadow-glow-yellow' : 'text-white hover:bg-graphite hover:text-primary'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
              <span className={labelClass(expanded)}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className={`mt-auto border-t-2 border-graphite ${expanded ? 'p-4' : 'px-2 py-4'}`}>
        <button
          type="button"
          onClick={onCreateLog}
          className={`mb-4 flex items-center rounded-xl bg-crimson text-white transition-colors shadow-glow-crimson-lg hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-primary ${
            expanded
              ? 'w-full justify-center gap-2 px-4 py-4 font-bold uppercase tracking-widest'
              : 'mx-auto h-12 w-12 justify-center'
          }`}
          aria-label="Create new log entry"
          title="Create new log entry"
        >
          <span className="material-symbols-outlined flex-shrink-0">add_box</span>
          <span className={labelClass(expanded)}>New log</span>
        </button>

        <div className="space-y-2">
          <button
            type="button"
            className={`flex items-center rounded-xl text-gray-400 transition-colors hover:bg-graphite hover:text-white focus-visible:ring-2 focus-visible:ring-primary ${
              expanded
                ? 'w-full justify-start gap-4 px-4 py-3 font-bold uppercase tracking-wider text-left'
                : 'mx-auto h-12 w-12 justify-center'
            }`}
            title="Settings"
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">settings</span>
            <span className={labelClass(expanded)}>Settings</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className={`flex items-center rounded-xl text-gray-400 transition-colors hover:bg-graphite hover:text-crimson focus-visible:ring-2 focus-visible:ring-primary ${
              expanded
                ? 'w-full justify-start gap-4 px-4 py-3 font-bold uppercase tracking-wider'
                : 'mx-auto h-12 w-12 justify-center'
            }`}
            title="Logout"
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
            <span className={labelClass(expanded)}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
