import React, { useState } from 'react';

export const SessionModal = ({ game, isOpen, onClose }) => {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [platform, setPlatform] = useState('PC');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const duration = hours * 60 + minutes;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/games/${game.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          duration,
          platform,
          notes,
          date: new Date(),
        }),
      });

      if (response.ok) {
        onClose();
        // Reset form
        setHours(1);
        setMinutes(0);
        setPlatform('PC');
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to log session:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative card p-6 max-w-md w-full mx-4 shadow-card-hover dark:shadow-card-hover-dark">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Log Session
          </h2>
          <button
            onClick={onClose}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Game Info */}
        <div className="mb-6 p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border-default dark:border-dark-border-default">
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Playing</p>
          <p className="font-semibold text-light-accent-primary dark:text-dark-accent-primary">{game.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Duration
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary"
                  placeholder="Hours"
                />
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Hours</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary"
                  placeholder="Minutes"
                />
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Minutes</p>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary"
            >
              <option>PC</option>
              <option>PS5</option>
              <option>Xbox</option>
              <option>Switch</option>
              <option>Mobile</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary resize-none h-20"
              placeholder="How did it go?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover text-light-text-primary dark:text-dark-text-primary font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-light-accent-primary dark:bg-dark-accent-primary hover:opacity-90 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
