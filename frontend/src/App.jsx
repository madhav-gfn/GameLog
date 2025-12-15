import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { GameDetail } from './pages/GameDetail';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-retro-dark/90 backdrop-blur-sm border-b border-retro-neon-green/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:no-underline"
          >
            <span className="text-2xl">🎮</span>
            <span className="text-lg font-bold text-retro-neon-green font-pixel hidden sm:inline">
              GAMELOG
            </span>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded font-bold text-sm transition ${
                isActive('/')
                  ? 'bg-retro-neon-green text-black'
                  : 'text-gray-300 hover:text-retro-neon-green'
              }`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`px-3 py-2 rounded font-bold text-sm transition ${
                isActive('/discover')
                  ? 'bg-retro-neon-blue text-black'
                  : 'text-gray-300 hover:text-retro-neon-blue'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/library"
              className={`px-3 py-2 rounded font-bold text-sm transition ${
                isActive('/library')
                  ? 'bg-retro-neon-magenta text-black'
                  : 'text-gray-300 hover:text-retro-neon-magenta'
              }`}
            >
              Library
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded font-bold text-sm transition ${
                isActive('/profile')
                  ? 'bg-retro-neon-yellow text-black'
                  : 'text-gray-300 hover:text-retro-neon-yellow'
              }`}
            >
              Profile
            </Link>
            
            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-2xl">{user?.avatar || '👤'}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-retro-neon-magenta transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-dark flex items-center justify-center">
        <div className="text-retro-neon-green text-xl font-pixel">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-retro-neon-green/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
          <p>🎮 GAMELOG - Track your gaming journey | Built with React + Vite</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
