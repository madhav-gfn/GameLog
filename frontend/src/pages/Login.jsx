import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/env.js';

const authHighlights = [
  {
    title: 'Track every run',
    description: 'Capture progress, ratings, notes, and playtime without losing the thread.',
  },
  {
    title: 'Keep your library sharp',
    description: 'Sort backlog, completed runs, and wishlist picks from one control center.',
  },
  {
    title: 'Jump back in fast',
    description: 'Search, discover, and update your games from a layout that stays focused.',
  },
];

export const Login = () => {
  const { signup, signin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showColdStartHint, setShowColdStartHint] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });

  React.useEffect(() => {
    if (!loading) {
      setShowColdStartHint(false);
      return undefined;
    }
    const timer = setTimeout(() => setShowColdStartHint(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!form.username || !form.email || !form.password) {
          throw new Error('Please fill in all required fields');
        }
        await signup({
          username: form.username,
          email: form.email,
          password: form.password,
          displayName: form.displayName || form.username,
        });
      } else {
        if (!form.email || !form.password) {
          throw new Error('Please fill in all fields');
        }
        await signin({ email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const inputClass = 'w-full rounded-xl border border-graphite/80 bg-background-dark/70 px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary transition-colors';

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-dark px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background-dark to-navy" aria-hidden="true" />
      <div className="absolute left-[10%] top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-12 right-[10%] h-56 w-56 rounded-full bg-crimson/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.05fr)_420px] lg:items-center">
          <section className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-navy/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-primary shadow-glow-yellow">
              <span className="material-symbols-outlined text-base">sports_esports</span>
              GameLog Pro Edition
            </div>

            <h1 className="mt-6 text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
              Run your game log like a control room.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:text-base lg:max-w-2xl">
              Keep your play history, ratings, backlog, and discovery flow in one place with a layout that stays centered and easy to scan.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {authHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-graphite/80 bg-navy/65 p-4 text-left shadow-card-dark backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-wide text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-gray-400 lg:justify-start">
              <span className="rounded-full border border-graphite/80 px-3 py-2">Fast auth</span>
              <span className="rounded-full border border-graphite/80 px-3 py-2">Clean library flow</span>
              <span className="rounded-full border border-graphite/80 px-3 py-2">Focused dashboards</span>
            </div>
          </section>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[1.75rem] border border-primary/20 bg-navy/90 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow-yellow">
                  <span className="material-symbols-outlined text-3xl font-bold text-navy">sports_esports</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Member Access</p>
                <h2 className="mt-3 text-2xl font-bold uppercase tracking-wide text-white">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {isSignUp ? 'Set up your profile and start tracking instantly.' : 'Pick up where you left off and keep your library moving.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-crimson bg-crimson/15 px-4 py-3 text-center text-sm font-bold text-crimson">
                  {error}
                </div>
              )}

              {showColdStartHint && (
                <div className="mb-5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-primary">Be patient — the backend is starting</p>
                  <p className="mt-1 text-xs leading-5 text-gray-300">
                    The server sleeps when idle on free hosting. Waking it up can take about a minute.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-gray-400">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        className={inputClass}
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-gray-400">
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={form.displayName}
                        onChange={handleChange}
                        placeholder="How others see you"
                        className={inputClass}
                        autoComplete="nickname"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-gray-400">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-gray-400">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={inputClass}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3 font-bold uppercase tracking-[0.22em] text-navy shadow-glow-yellow transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-graphite" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-navy px-3 font-bold uppercase tracking-wider text-gray-500">or</span>
                </div>
              </div>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    try {
                      await signin({ email: 'demo@gamelog.app', password: 'demo1234' });
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-graphite bg-navy py-3 font-bold uppercase tracking-wider text-white transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Try Demo Account
                </button>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-graphite bg-graphite/80 py-3 font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-graphite"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <p className="mt-6 text-center text-xs uppercase tracking-[0.22em] text-gray-500">
                By continuing, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
