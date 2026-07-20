import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { GameDetail } from './pages/GameDetail';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { SearchResults } from './pages/SearchResults';
import { Notifications } from './pages/Notifications';
import { Recommend } from './pages/Recommend';
import { Settings } from './pages/Settings';
import { AppShell } from './components/layout/AppShell';
import './App.css';

const BootScreen = () => {
  const [showColdStartHint, setShowColdStartHint] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowColdStartHint(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <span className="material-symbols-outlined text-primary text-5xl animate-pulse">sports_esports</span>
        <div className="text-white text-xl font-bold uppercase tracking-widest">Loading...</div>
        {showColdStartHint && (
          <div className="mt-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-4">
            <p className="text-primary font-bold uppercase tracking-wider text-sm mb-1">Be patient — the backend is starting up</p>
            <p className="text-gray-300 text-sm leading-6">
              The server sleeps when idle on free hosting, so waking it up can take about a minute. Hang tight, it&apos;s worth it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <BootScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/game/:gameId" element={<GameDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
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
