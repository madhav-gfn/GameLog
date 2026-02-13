import React, { useEffect } from 'react';
import { useLists } from '../hooks/useLists';

export const ListsManager = ({ userId }) => {
    const { lists, fetchUserLists, loading, error, deleteList } = useLists();

    useEffect(() => {
        if (userId) fetchUserLists(userId);
    }, [userId, fetchUserLists]);

    if (loading) return <div>Loading lists...</div>;
    if (error) return <div className="text-red-500">Failed to load lists</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Game Lists</h3>

            {lists.length === 0 ? (
                <div className="text-light-text-tertiary dark:text-dark-text-tertiary">No lists created yet.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lists.map(list => (
                        <div key={list.id} className="card p-4 relative group">
                            <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary">{list.title}</h4>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">{list.description}</p>
                            <div className="mt-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                {list._count?.items || 0} games • {list.isPublic ? 'Public' : 'Private'}
                            </div>

                            {/* Actions (delete, etc) - only if looking at own profile (TODO: add check) */}
                            {/* Simple delete button for now */}
                            <button
                                onClick={() => deleteList(list.id)}
                                className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete List"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create new list button could go here */}
        </div>
    );
};
