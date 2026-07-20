import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { gameApi } from '../../api/gameApi';
import { Sidebar } from '../Sidebar';
import { SearchBar } from '../SearchBar';
import { NotificationDropdown } from '../NotificationDropdown';
import { LogModal } from '../LogModal';
import { ProfileDropdown } from '../ProfileDropdown';

const navItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/discover', label: 'Discover', icon: 'explore' },
  { path: '/recommend', label: 'AI Pick', icon: 'auto_awesome' },
  { path: '/library', label: 'Library', icon: 'library_books' },
  { path: '/profile', label: 'Profile', icon: 'person' },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 hidden max-[800px]:flex bg-navy border-t-2 border-graphite px-2 py-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded font-bold uppercase tracking-wider text-[11px] transition-colors ${
              isActive ? 'bg-primary text-navy' : 'text-white hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const NavBar = ({ onOpenLog }) => {
  return (
    <header className="bg-navy border-b-2 border-graphite px-3 sm:px-6">
      <div className="flex h-16 w-full items-center gap-2 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 hover:no-underline">
          <span className="material-symbols-outlined text-primary text-3xl">sports_esports</span>
          <div className="hidden sm:block">
            <h1 className="text-white text-lg font-bold uppercase tracking-widest leading-none">GAMELOG</h1>
            <p className="text-primary text-[10px] uppercase tracking-[0.2em]">Control Center</p>
          </div>
        </Link>

        <div className="hidden sm:block flex-1 min-w-0 max-w-2xl">
          <SearchBar className="w-full" />
        </div>

        <Link
          to="/search"
          className="sm:hidden flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-graphite/50"
          aria-label="Search"
        >
          <span className="material-symbols-outlined">search</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <button onClick={onOpenLog} className="hidden md:inline-flex px-3 py-2 rounded bg-crimson text-white text-xs font-bold uppercase tracking-wide focus-visible:ring-2 focus-visible:ring-primary">
            New log (N)
          </button>
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export const AppShell = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const sidebarExpanded = sidebarPinned || sidebarHovered;

  useEffect(() => {
    let awaitingGoTarget = false;

    const onKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      const isEditable = tagName === 'input' || tagName === 'textarea' || event.target?.isContentEditable;

      if (event.key.toLowerCase() === 'g' && !isEditable) {
        awaitingGoTarget = true;
        setTimeout(() => {
          awaitingGoTarget = false;
        }, 800);
        return;
      }

      if (awaitingGoTarget) {
        const key = event.key.toLowerCase();
        if (key === 'h') {
          event.preventDefault();
          navigate('/');
        }
        if (key === 'p') {
          event.preventDefault();
          navigate('/profile');
        }
        awaitingGoTarget = false;
        return;
      }

      if (event.key.toLowerCase() === 'n' && !isEditable) {
        event.preventDefault();
        setLogOpen(true);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const handleCreateLog = async (payload) => {
    const response = await gameApi.addGameToLibrary(payload.gameId, payload);
    window.dispatchEvent(new CustomEvent('gamelog:created', {
      detail: {
        id: `optimistic-${Date.now()}`,
        actor: user?.username || user?.displayName || 'You',
        updatedAt: new Date().toISOString(),
        gameId: payload.gameId,
        game: { title: payload.gameTitle, coverImage: '', platforms: payload.platform ? [payload.platform] : [] },
        userGame: { ...response, ...payload },
      },
    }));
    setToast('Game log saved');
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="app-shell h-screen bg-background-dark text-white overflow-hidden">
      <NavBar onOpenLog={() => setLogOpen(true)} />

      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        <aside
          className={`shrink-0 overflow-hidden border-r-2 border-graphite bg-navy transition-[width] duration-300 max-[800px]:hidden ${sidebarExpanded ? 'w-[260px]' : 'w-[88px]'}`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <Sidebar
            expanded={sidebarExpanded}
            pinned={sidebarPinned}
            onTogglePinned={() => {
              if (sidebarPinned) {
                setSidebarPinned(false);
                setSidebarHovered(false);
              } else {
                setSidebarPinned(true);
              }
            }}
            onCreateLog={() => setLogOpen(true)}
          />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-[800px]:pb-24">
          <div className="page-content">{children}</div>
        </main>
      </div>

      {toast && <div className="fixed top-20 right-4 z-[60] bg-primary text-navy px-4 py-2 rounded font-bold uppercase text-xs">{toast}</div>}

      <LogModal open={logOpen} onClose={() => setLogOpen(false)} onSubmit={handleCreateLog} title="Log game" />
      <MobileBottomNav />
    </div>
  );
};
