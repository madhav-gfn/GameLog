import React from 'react';
import { Link } from 'react-router-dom';
import { Header, EmptyState } from '../components/Layout';
import { FeedItem } from '../components/FeedItem';
import { MOCK_ACTIVITIES } from '../data/mockData';

export const Home = () => {
  return (
    <div>
      <Header
        title="Activity Feed"
        subtitle="See what your friends are playing"
      />

      <div className="space-y-4">
        {MOCK_ACTIVITIES.length > 0 ? (
          MOCK_ACTIVITIES.map((activity) => (
            <Link
              key={activity.id}
              to={`/game/${activity.gameId}`}
              className="block hover:no-underline"
            >
              <FeedItem activity={activity} />
            </Link>
          ))
        ) : (
          <EmptyState
            icon="📭"
            title="No activities yet"
            description="Start playing games or follow friends to see activity here."
          />
        )}
      </div>
    </div>
  );
};
