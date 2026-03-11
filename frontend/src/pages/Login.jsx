import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/env.js';

export const Login = () => {
  const { signup, signin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });

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

  const inputClass = "w-full px-4 py-3 bg-navy border-2 border-graphite rounded text-white placeholder-gray-500 font-medium focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary w-14 h-14 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-navy text-3xl font-bold">sports_esports</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white uppercase tracking-widest mb-2">
            GAMELOG
          </h1>
          <p className="text-primary font-bold uppercase tracking-widest text-sm">
            PRO EDITION
          </p>
        </div>

        {/* Card */}
        <div className="bg-navy border-2 border-graphite rounded p-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-crimson/20 border border-crimson rounded text-crimson text-sm font-bold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="How others see you"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-yellow-400 text-navy font-bold py-3 rounded uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-yellow"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle signup/signin */}
          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-primary hover:underline font-bold"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-graphite"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-navy text-gray-500 uppercase font-bold tracking-wider">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-graphite hover:bg-gray-600 text-white font-bold py-3 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-3 border-2 border-graphite hover:border-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center text-xs text-gray-600 uppercase tracking-wider">
            By continuing, you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
};