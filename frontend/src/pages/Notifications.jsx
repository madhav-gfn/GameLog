import React, { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';

const PAGE_SIZE = 20;

const formatType = (type) => (type || 'notification').replace(/_/g, ' ').toLowerCase();

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString();
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPage = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const data = await notificationApi.getNotifications({ page: targetPage, limit: PAGE_SIZE });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination || { page: targetPage, pages: 1, total: 0 });
    } catch (_err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const markOneRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) => prev.map((notif) => (
        notif.id === notificationId ? { ...notif, read: true } : notif
      )));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (_err) {
      setError('Unable to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (_err) {
      setError('Unable to mark all as read');
    }
  };

  const currentPage = pagination.page || 1;
  const totalPages = pagination.pages || 1;

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-primary pb-4 gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-white">Notifications</h2>
          <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">Unread: {unreadCount}</p>
        </div>

        <button
          onClick={markAllRead}
          disabled={loading || notifications.length === 0 || unreadCount === 0}
          className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-navy font-bold uppercase tracking-wide px-4 py-2 rounded"
        >
          Mark all as read
        </button>
      </header>

      {loading && <p className="text-gray-400">Loading notifications...</p>}
      {!loading && error && <p className="text-crimson">{error}</p>}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-12 border border-dashed border-graphite rounded-lg">
          <span className="material-symbols-outlined text-graphite text-5xl">notifications_off</span>
          <p className="text-gray-400 mt-2">You are all caught up.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <article
              key={notif.id}
              className={`p-4 rounded border ${notif.read ? 'border-graphite bg-navy/50' : 'border-primary/60 bg-primary/10'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-semibold">{notif.fromUser?.displayName || notif.fromUser?.username || 'System'}</p>
                  <p className="text-xs uppercase tracking-wider text-primary">{formatType(notif.type)}</p>
                  {notif.payload?.message && <p className="mt-2 text-sm text-gray-200">{notif.payload.message}</p>}
                  <p className="mt-2 text-xs text-gray-500">{formatDateTime(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markOneRead(notif.id)}
                    className="text-xs uppercase font-bold tracking-wide text-primary hover:text-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <footer className="mt-8 flex items-center justify-between gap-3 border-t border-graphite pt-4">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 rounded border border-graphite text-sm font-bold uppercase tracking-wide disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 rounded border border-graphite text-sm font-bold uppercase tracking-wide disabled:opacity-50"
          >
            Next
          </button>
        </footer>
      )}
    </div>
  );
};
