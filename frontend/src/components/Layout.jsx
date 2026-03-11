import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';

export const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-8 border-b-4 border-primary pb-4">
      <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">{subtitle}</p>
      )}
    </div>
  );
};

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{description}</p>
    </div>
  );
};

export { LoadingSkeleton };
