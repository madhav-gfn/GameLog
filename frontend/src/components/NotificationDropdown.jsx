import React, { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/notificationApi';

/**
 * @param {{limit?: number}} props
 */
export const NotificationDropdown = ({ limit = 8 }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications({ limit });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (_err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const markAllRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open notifications"
        className="relative p-2 rounded-md text-gray-300 hover:text-white hover:bg-graphite/50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-crimson text-white rounded-full px-1.5 py-1 font-bold" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-navy border-2 border-graphite rounded-md shadow-2xl z-50" role="menu" aria-label="Notifications list">
          <div className="flex justify-between items-center p-3 border-b border-graphite">
            <h3 className="text-sm font-bold uppercase text-white tracking-wide">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-primary font-bold focus-visible:ring-2 focus-visible:ring-primary rounded px-1" disabled={loading || notifications.length === 0}>
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && <p className="text-center text-gray-400 py-4">Loading...</p>}
            {!loading && error && <p className="text-center text-crimson py-4">{error}</p>}
            {!loading && !error && notifications.length === 0 && <p className="text-center text-gray-500 py-4">No notifications yet.</p>}
            {!loading && !error && notifications.map((notif) => (
              <button
                key={notif.id}
                role="menuitem"
                className={`w-full text-left p-3 rounded mb-1 border focus-visible:ring-2 focus-visible:ring-primary ${notif.read ? 'border-transparent text-gray-400' : 'border-primary/40 bg-primary/5 text-white'}`}
              >
                <p className="text-sm font-semibold">{notif.fromUser?.displayName || notif.fromUser?.username || 'System'}</p>
                <p className="text-xs uppercase tracking-wide">{notif.type.replace(/_/g, ' ')}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
