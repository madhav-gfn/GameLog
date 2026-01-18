import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, EmptyState, LoadingSkeleton } from '../components/Layout';
import { FeedItem } from '../components/FeedItem';
import { gameApi } from '../api/gameApi';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await gameApi.getUserActivity(user.id);
        setActivities(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to load activity feed');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  if (loading) {
    return (
      <div>
        <Header
          title="Activity Feed"
          subtitle="See what your friends are playing"
        />
        <div className="space-y-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header
          title="Activity Feed"
          subtitle="See what your friends are playing"
        />
        <EmptyState
          icon="⚠️"
          title="Error loading feed"
          description={error}
        />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Activity Feed"
        subtitle="See what your friends are playing"
      />

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
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
