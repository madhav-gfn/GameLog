import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { followApi } from '../api/followApi';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Player&background=111827&color=ffffff';

/**
 * Modal listing a user's followers or following.
 * @param {{userId: string, mode: 'followers'|'following', onClose: () => void}} props
 */
export const FollowListModal = ({ userId, mode, onClose }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = mode === 'followers'
          ? await followApi.getFollowers(userId, { limit: 100 })
          : await followApi.getFollowing(userId, { limit: 100 });
        setUsers(response?.users || response?.data?.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userId, mode]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [onClose]);

  const openProfile = (person) => {
    onClose();
    navigate(`/profile?user=${person.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'followers' ? 'Followers' : 'Following'}
    >
      <div
        className="w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden rounded-2xl border-2 border-graphite bg-navy shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-graphite px-5 py-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">
            {mode === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-graphite hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && <p className="py-8 text-center text-sm text-gray-500">Loading...</p>}

          {error && <p className="py-8 text-center text-sm text-red-400">{error}</p>}

          {!loading && !error && users.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          )}

          <ul className="space-y-1">
            {users.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => openProfile(person)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-graphite"
                >
                  <img
                    src={person.avatar || DEFAULT_AVATAR}
                    alt={`${person.displayName || person.username} avatar`}
                    className="h-10 w-10 shrink-0 rounded-full border border-gray-700 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{person.displayName || person.username}</p>
                    <p className="truncate text-xs text-gray-400">@{person.username}</p>
                    {person.bio && <p className="truncate text-xs text-gray-500">{person.bio}</p>}
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-gray-500">chevron_right</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
