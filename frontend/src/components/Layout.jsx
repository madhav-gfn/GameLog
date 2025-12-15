import React from 'react';

export const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-retro-neon-green font-pixel mb-2">
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
  );
};

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{description}</p>
    </div>
  );
};
