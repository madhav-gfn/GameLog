import React from 'react';

/** @param {{title?: string, subtitle?: string, loading?: boolean, error?: string|null}} props */
export const ProfileHeader = ({ title = 'Profile', subtitle, loading = false, error = null }) => {
  return (
    <header className="mb-8 border-b-4 border-primary pb-4" aria-live="polite">
      <h2 className="text-5xl font-bold uppercase tracking-tighter text-white">{title}</h2>
      {subtitle && <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">{subtitle}</p>}
      {loading && <p className="text-gray-500 mt-2">Loading profile...</p>}
      {error && <p className="text-crimson mt-2" role="alert">{error}</p>}
    </header>
  );
};
