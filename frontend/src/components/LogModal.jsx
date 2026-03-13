import React, { useEffect, useState } from 'react';

const DEFAULT_PAYLOAD = { status: 'BACKLOG', rating: '', review: '' };

/** @param {{open:boolean,onClose:()=>void,onSubmit:(payload:any)=>Promise<void>|void,initialData?:any,title?:string}} props */
export const LogModal = ({ open, onClose, onSubmit, initialData = DEFAULT_PAYLOAD, title = 'Log game' }) => {
  const [payload, setPayload] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setPayload(initialData); }, [initialData]);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...payload, rating: payload.rating === '' ? null : Number(payload.rating) });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <form className="w-full max-w-lg card p-6" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold uppercase">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-white focus-visible:ring-2 focus-visible:ring-primary rounded">✕</button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm text-gray-300">Status
            <select value={payload.status} onChange={(e) => setPayload((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full bg-graphite text-white rounded p-2" aria-label="Status">
              {['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block text-sm text-gray-300">Rating
            <input type="number" min="1" max="10" value={payload.rating} onChange={(e) => setPayload((p) => ({ ...p, rating: e.target.value }))} className="mt-1 w-full bg-graphite text-white rounded p-2" aria-label="Rating from 1 to 10" />
          </label>
          <label className="block text-sm text-gray-300">Review
            <textarea value={payload.review || ''} onChange={(e) => setPayload((p) => ({ ...p, review: e.target.value }))} className="mt-1 w-full bg-graphite text-white rounded p-2" rows={4} aria-label="Review text" />
          </label>
        </div>
        {error && <p className="text-crimson mt-3" role="alert">{error}</p>}
        <div className="flex justify-end mt-4 gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-graphite text-white">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-primary text-navy font-bold disabled:opacity-60">{submitting ? 'Saving...' : 'Save log'}</button>
        </div>
      </form>
    </div>
  );
};
