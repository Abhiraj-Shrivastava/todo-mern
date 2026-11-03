import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onCancel, onConfirm }) {
  const titleId = useId();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center px-6">
      <div className="animate-fade-in absolute inset-0 bg-[#4b4e57]/55" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-pop-in relative w-full max-w-xs rounded-xl bg-white p-5 shadow-2xl"
      >
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] text-muted">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-[4px] border border-line py-2.5 text-[13px] font-medium hover:bg-[#f6f7fb]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[4px] bg-pending-ink py-2.5 text-[13px] font-medium text-white hover:brightness-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
