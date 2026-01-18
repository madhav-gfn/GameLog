import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { GameDetail } from './pages/GameDetail';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-light-text-primary dark:text-dark-text-primary text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
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
      <footer className="border-t border-light-border-default dark:border-dark-border-default mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
          <p>GameFolio - Your Cozy Corner for Gaming Culture | Built with React + Vite</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
