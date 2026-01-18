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
      <div className="relative bg-retro-purple border-2 border-retro-neon-green rounded-lg p-6 max-w-md w-full mx-4 shadow-lg shadow-retro-neon-green/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-retro-neon-green font-pixel">
            Log Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-retro-neon-magenta transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Game Info */}
        <div className="mb-6 p-3 bg-retro-dark rounded border border-retro-neon-blue/30">
          <p className="text-xs text-gray-400">Playing</p>
          <p className="font-bold text-retro-neon-blue">{game.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Duration
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value)))}
                  className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-blue/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-blue"
                  placeholder="Hours"
                />
                <p className="text-xs text-gray-400 mt-1">Hours</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value))))
                  }
                  className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-blue/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-blue"
                  placeholder="Minutes"
                />
                <p className="text-xs text-gray-400 mt-1">Minutes</p>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-blue/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-blue"
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
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-blue/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-blue resize-none h-20"
              placeholder="How did it go?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-retro-neon-green hover:bg-retro-neon-green/80 text-black font-bold rounded transition disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
