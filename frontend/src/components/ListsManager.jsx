import React, { useEffect } from 'react';
import { useLists } from '../hooks/useLists';
import { ListGrid } from './ListGrid';

/** @param {{userId?: string}} props */
export const ListsManager = ({ userId }) => {
  const { lists, fetchUserLists, loading, error, deleteList } = useLists();

  useEffect(() => {
    if (userId) fetchUserLists(userId);
  }, [userId, fetchUserLists]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Game Lists</h3>
      <ListGrid lists={lists} loading={loading} error={error ? 'Failed to load lists' : null} onDelete={deleteList} />
    </div>
  );
};
