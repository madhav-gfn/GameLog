import React, { useState } from 'react';
import { useStore } from '../store/gameStore';
import { MOCK_PLAY_SESSIONS } from '../data/mockData';

export const SessionModal = ({ game, isOpen, onClose }) => {
  const { addPlaySession } = useStore();
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [platform, setPlatform] = useState('PC');
  const [notes, setNotes] = useState('');
  const [streamed, setStreamed] = useState(false);
  const [streamPlatform, setStreamPlatform] = useState('Twitch');
  const [streamLink, setStreamLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = hours * 60 + minutes;

    const newSession = {
      id: Math.random().toString(),
      duration,
      platform,
      date: new Date(),
      notes,
      streamed,
      ...(streamed && {
        streamPlatform,
        streamLink,
      }),
    };

    addPlaySession(newSession);
    onClose();

    // Reset form
    setHours(1);
    setMinutes(0);
    setPlatform('PC');
    setNotes('');
    setStreamed(false);
    setStreamPlatform('Twitch');
    setStreamLink('');
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

          {/* Streamed */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={streamed}
                onChange={(e) => setStreamed(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-300">
                This was a streaming session
              </span>
            </label>
          </div>

          {/* Stream Details */}
          {streamed && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Stream Platform
                </label>
                <select
                  value={streamPlatform}
                  onChange={(e) => setStreamPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-magenta/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-magenta"
                >
                  <option>Twitch</option>
                  <option>YouTube</option>
                  <option>Kick</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Stream/VOD Link
                </label>
                <input
                  type="url"
                  value={streamLink}
                  onChange={(e) => setStreamLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-retro-dark border border-retro-neon-magenta/50 rounded text-white font-mono focus:outline-none focus:border-retro-neon-magenta text-sm"
                />
              </div>
            </>
          )}

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
              className="flex-1 px-4 py-2 bg-retro-neon-green hover:bg-retro-neon-green/80 text-black font-bold rounded transition"
            >
              Log Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
