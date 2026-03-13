import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import { normalizeNotificationResponse } from '../utils/responseAdapters';

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const formatType = (type) => (type || 'notification').replace(/_/g, ' ').toLowerCase();

/**
 * @param {{limit?: number}} props
 */
export const NotificationDropdown = ({ limit = 5 }) => {
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
      const data = await notificationApi.getNotifications({ limit, page: 1 });
      const normalized = normalizeNotificationResponse(data, 1, limit);
      setNotifications(normalized.notifications);
      setUnreadCount(normalized.unreadCount);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  const markOneRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) => prev.map((notif) => (
        notif.id === notificationId ? { ...notif, read: true } : notif
      )));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      setError('Unable to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch {
      setError('Unable to mark all as read');
    }
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
          <span className="absolute -top-1 -right-1 min-w-5 text-center text-[10px] leading-none bg-crimson text-white rounded-full px-1.5 py-1 font-bold" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-navy border-2 border-graphite rounded-md shadow-2xl z-50" role="menu" aria-label="Notifications list">
          <div className="flex justify-between items-center p-3 border-b border-graphite gap-2">
            <h3 className="text-sm font-bold uppercase text-white tracking-wide">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-primary font-bold focus-visible:ring-2 focus-visible:ring-primary rounded px-1 disabled:opacity-50" disabled={loading || notifications.length === 0 || unreadCount === 0}>
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && <p className="text-center text-gray-400 py-4">Loading...</p>}
            {!loading && error && <p className="text-center text-crimson py-4">{error}</p>}
            {!loading && !error && notifications.length === 0 && <p className="text-center text-gray-500 py-4">No notifications yet.</p>}
            {!loading && !error && notifications.map((notif) => (
              <div
                key={notif.id}
                className={`w-full text-left p-3 rounded mb-1 border ${notif.read ? 'border-transparent text-gray-400' : 'border-primary/40 bg-primary/5 text-white'}`}
              >
                <p className="text-sm font-semibold truncate">{notif.fromUser?.displayName || notif.fromUser?.username || 'System'}</p>
                <p className="text-xs uppercase tracking-wide">{formatType(notif.type)}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                {!notif.read && (
                  <button
                    onClick={() => markOneRead(notif.id)}
                    className="mt-2 text-[11px] font-bold uppercase tracking-wide text-primary hover:text-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-graphite p-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-xs uppercase tracking-wider font-bold py-2 text-primary hover:text-white"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
