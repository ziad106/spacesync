import { useEffect } from 'react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm fade-in"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="modal-panel card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{title}</h3>
        {message && <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>{message}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button
            type="button"
            className={danger ? 'btn-danger min-w-[100px]' : 'btn-primary min-w-[100px]'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (<><span className="spinner" /> Working…</>) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
