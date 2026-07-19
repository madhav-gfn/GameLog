import React from 'react';
import { useNavigate } from 'react-router-dom';

const fakeSettings = [
  { label: 'Gamer mode', value: 'Permanently ON', icon: 'sports_esports' },
  { label: 'Backlog guilt notifications', value: 'Cannot be disabled', icon: 'notifications_active' },
  { label: 'Touch grass reminders', value: 'OFF (forever)', icon: 'grass' },
  { label: 'Skill issue detection', value: 'Always watching', icon: 'visibility' },
  { label: '"Just one more run" limiter', value: 'Broken since launch', icon: 'all_inclusive' },
  { label: 'Dark mode', value: 'There is no light mode. This is GameLog.', icon: 'dark_mode' },
];

export const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">Settings</p>

      <h1 className="mt-4 text-7xl sm:text-8xl font-bold uppercase tracking-tighter text-primary drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">
        lol.
      </h1>

      <p className="mt-4 max-w-md text-gray-300 leading-7">
        You really thought there were settings? Everything is already perfect.
        This button exists purely for decoration and you clicked it anyway.
      </p>

      <div className="mt-8 w-full max-w-lg space-y-2 text-left">
        {fakeSettings.map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between gap-4 rounded-xl border-2 border-graphite bg-navy px-4 py-3 opacity-80"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-primary shrink-0">{setting.icon}</span>
              <span className="text-sm font-bold uppercase tracking-wide text-white truncate">{setting.label}</span>
            </div>
            <span className="text-xs text-gray-400 text-right shrink-0">{setting.value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-10 rounded-xl bg-primary px-8 py-3 font-bold uppercase tracking-[0.22em] text-navy shadow-glow-yellow transition-colors hover:bg-yellow-400"
      >
        OK take me back
      </button>

      <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gray-600">
        Achievement unlocked: clicked a useless button
      </p>
    </div>
  );
};
