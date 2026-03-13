import React, { useMemo } from 'react';
import { SocialFeed } from '../components/SocialFeed';

export const Home = () => {
  const socialFilterButtons = useMemo(() => ([
    { key: 'all', label: 'All' },
    { key: 'friends', label: 'Friends' },
    { key: 'following', label: 'Following' },
    { key: 'popular', label: 'Popular' },
    { key: 'platform', label: 'Platform' },
    { key: 'status', label: 'Status' },
  ]), []);

  const [feedFilter, setFeedFilter] = React.useState('all');

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-primary pb-4 gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-white">
            Home Feed
          </h2>
          <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">
            Social activity first
          </p>
        </div>
      </header>

      <section className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Social Feed</h3>
          <div className="flex flex-wrap gap-2">
            {socialFilterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setFeedFilter(f.key)}
                className={`px-3 py-2 rounded font-bold uppercase text-xs transition-colors ${feedFilter === f.key
                  ? 'bg-primary text-navy'
                  : 'bg-graphite text-white hover:bg-navy'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <SocialFeed filter={feedFilter} />
      </section>
    </div>
  );
};
