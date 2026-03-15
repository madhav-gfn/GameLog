import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from '../utils/motionCompat';
import { gameApi } from '../api/gameApi';
import { getTransition, modalBackdropVariants, modalContentVariants } from './animations/variants';

const STATUS_OPTIONS = ['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'];
const DEFAULT_FORM = {
  gameId: '',
  gameTitle: '',
  platform: '',
  status: 'BACKLOG',
  playtimeHours: '',
  progressPercent: '',
  playedAt: '',
  rating: '',
  reviewText: '',
  screenshotUrl: '',
  platforms: [],
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/** @param {{open:boolean,onClose:()=>void,onSubmit:(payload:any)=>Promise<void>|void,initialData?:any,title?:string,lockGame?:boolean,onScreenshotFileSelected?:(file:File)=>void}} props */
export const LogModal = ({
  open,
  onClose,
  onSubmit,
  initialData = DEFAULT_FORM,
  title = 'Log game',
  lockGame = false,
  onScreenshotFileSelected,
}) => {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [gameResults, setGameResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setForm({
      ...DEFAULT_FORM,
      ...initialData,
      playedAt: toDateInputValue(initialData?.playedAt),
      reviewText: initialData?.reviewText || '',
      platforms: initialData?.platforms || [],
    });
  }, [initialData]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || lockGame || !form.gameTitle || form.gameTitle.trim().length < 2) {
      setGameResults([]);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await gameApi.getGames({ search: form.gameTitle.trim(), page: 1 });
        if (!active) return;
        setGameResults((response.games || []).slice(0, 6));
      } catch {
        if (active) setGameResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.gameTitle, lockGame, open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const canSubmit = useMemo(() => Boolean(form.gameId && form.status), [form.gameId, form.status]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const mapPayload = () => ({
    gameId: form.gameId,
    status: form.status,
    platform: form.platform || null,
    playtimeHours: form.playtimeHours === '' ? null : Number(form.playtimeHours),
    progressPercent: form.progressPercent === '' ? null : Number(form.progressPercent),
    playedAt: form.playedAt || null,
    rating: form.rating === '' ? null : Number(form.rating),
    reviewText: form.reviewText.trim() || null,
    screenshotUrl: form.screenshotUrl.trim() || null,
    gameTitle: form.gameTitle,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Please select a game and status.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(mapPayload());
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <Motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={onClose}
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={getTransition(reduceMotion, 'modalBackdrop')}
        >
          <Motion.form
            ref={modalRef}
            className="w-full max-w-2xl card p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={getTransition(reduceMotion, 'modal')}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold uppercase">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-white focus-visible:ring-2 focus-visible:ring-primary rounded">✕</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm text-gray-300 sm:col-span-2">Game
                <input
                  ref={firstInputRef}
                  type="text"
                  value={form.gameTitle}
                  onChange={(e) => {
                    if (lockGame) return;
                    setForm((prev) => ({ ...prev, gameTitle: e.target.value, gameId: '' }));
                  }}
                  placeholder="Search game title"
                  disabled={lockGame}
                  className="mt-1 w-full bg-graphite text-white rounded p-2"
                  aria-label="Game search"
                />
                {!lockGame && searching && <p className="text-xs text-gray-500 mt-1">Searching…</p>}
                {!lockGame && gameResults.length > 0 && (
                  <div className="mt-2 max-h-36 overflow-y-auto border border-graphite rounded">
                    {gameResults.map((game) => (
                      <button
                        type="button"
                        key={game.id}
                        onClick={() => {
                          const platforms = game.platforms || [];
                          setForm((prev) => ({ 
                            ...prev, 
                            gameId: String(game.id), 
                            gameTitle: game.title || game.name || '',
                            platforms,
                            platform: platforms.includes(prev.platform) ? prev.platform : (platforms[0] || '')
                          }));
                          setGameResults([]);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-navy"
                      >
                        {game.title || game.name}
                      </button>
                    ))}
                  </div>
                )}
              </label>

              <label className="block text-sm text-gray-300">Platform
                {form.platforms && form.platforms.length > 0 ? (
                  <select value={form.platform} onChange={(e) => setField('platform', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" aria-label="Platform">
                    <option value="">Select Platform</option>
                    {form.platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <input value={form.platform} onChange={(e) => setField('platform', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" aria-label="Platform" placeholder="Enter platform" />
                )}
              </label>

              <label className="block text-sm text-gray-300">Status
                <select value={form.status} onChange={(e) => setField('status', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" aria-label="Status">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="block text-sm text-gray-300">Playtime (hours)
                <input type="number" min="0" step="0.1" value={form.playtimeHours} onChange={(e) => setField('playtimeHours', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" />
              </label>

              <label className="block text-sm text-gray-300">Progress (%)
                <input type="number" min="0" max="100" value={form.progressPercent} onChange={(e) => setField('progressPercent', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" />
              </label>

              <label className="block text-sm text-gray-300">Date played
                <input type="date" value={form.playedAt} onChange={(e) => setField('playedAt', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" />
              </label>

              <label className="block text-sm text-gray-300">Rating (1-10)
                <input type="number" min="1" max="10" value={form.rating} onChange={(e) => setField('rating', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" />
              </label>

              <label className="block text-sm text-gray-300 sm:col-span-2">Review (0-280)
                <textarea
                  value={form.reviewText}
                  onChange={(e) => setField('reviewText', e.target.value.slice(0, 280))}
                  className="mt-1 w-full bg-graphite text-white rounded p-2"
                  rows={4}
                  maxLength={280}
                />
                <p className="mt-1 text-xs text-gray-500 text-right">{form.reviewText.length}/280</p>
              </label>

              <label className="block text-sm text-gray-300">Screenshot URL
                <input type="url" value={form.screenshotUrl} onChange={(e) => setField('screenshotUrl', e.target.value)} className="mt-1 w-full bg-graphite text-white rounded p-2" placeholder="https://" />
              </label>

              <label className="block text-sm text-gray-300">Screenshot file (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onScreenshotFileSelected) onScreenshotFileSelected(file);
                  }}
                  className="mt-1 w-full bg-graphite text-white rounded p-2"
                />
              </label>
            </div>

            {error && <p className="text-crimson mt-3" role="alert">{error}</p>}
            <div className="flex justify-end mt-4 gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-graphite text-white">Cancel</button>
              <button type="submit" disabled={submitting || !canSubmit} className="px-4 py-2 rounded bg-primary text-navy font-bold disabled:opacity-60">{submitting ? 'Saving...' : 'Save log'}</button>
            </div>
          </Motion.form>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
};
