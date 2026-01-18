import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';

export const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
        {title}
      </h1>
      {subtitle && <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">{subtitle}</p>}
    </div>
  );
};

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{title}</h3>
      <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm max-w-sm">{description}</p>
    </div>
  );
};

export { LoadingSkeleton };
