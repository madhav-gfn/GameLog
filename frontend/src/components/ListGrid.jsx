import React from 'react';

/** @param {{lists:any[], onDelete?:(id:string)=>void, loading?:boolean, error?:string|null}} props */
export const ListGrid = ({ lists, onDelete, loading = false, error = null }) => {
  if (loading) return <div className="text-gray-400">Loading lists...</div>;
  if (error) return <div className="text-red-500" role="alert">{error}</div>;
  if (!lists?.length) return <div className="text-gray-500">No lists created yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="User lists">
      {lists.map((list) => (
        <div key={list.id} className="card p-4 relative group">
          <h4 className="font-bold text-white">{list.title}</h4>
          <p className="text-sm text-gray-400 line-clamp-2">{list.description}</p>
          <div className="mt-2 text-xs text-gray-500">{list._count?.items || 0} games • {list.isPublic ? 'Public' : 'Private'}</div>
          <button onClick={() => onDelete?.(list.id)} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary rounded" title="Delete List" aria-label={`Delete list ${list.title}`}>✕</button>
        </div>
      ))}
    </div>
  );
};
