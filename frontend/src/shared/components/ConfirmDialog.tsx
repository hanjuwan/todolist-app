import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  destructive,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      data-testid="confirm-dialog"
      ref={ref}
      tabIndex={-1}
    >
      <h2 id="confirm-dialog-title">{title}</h2>
      {description && <div>{description}</div>}
      <div>
        <button type="button" onClick={onCancel} data-testid="confirm-cancel">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-testid="confirm-ok"
          aria-label={destructive ? `${confirmLabel} (위험 작업)` : confirmLabel}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
