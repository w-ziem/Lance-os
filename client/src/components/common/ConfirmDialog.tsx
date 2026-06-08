import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    warning?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, warning, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;

    return createPortal(
        <div onClick={onCancel} className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
            <div onClick={e => e.stopPropagation()} className="bg-(--surface) border border-(--border-default) rounded-xl p-6 w-[380px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

                <div className="w-10 h-10 rounded-[10px] bg-(--status-error-tint) border border-(--status-error-border) flex items-center justify-center mb-4 text-(--status-error)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                </div>

                <p className="font-display font-semibold text-[16px] text-(--text-primary) mb-2">{title}</p>
                <p className="text-[13px] text-(--text-secondary) leading-relaxed">{message}</p>

                {warning && (
                    <div className="flex gap-2.5 items-start mt-3 mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 mt-[1px] shrink-0">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p className="text-[12.5px] text-amber-800 leading-relaxed">{warning}</p>
                    </div>
                )}

                <div className="flex gap-2 justify-end mt-5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-[13px] font-medium font-body cursor-pointer bg-(--bg-secondary) text-(--text-primary) border border-(--border-default) rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-[13px] font-semibold font-body cursor-pointer bg-(--status-error) text-white border-none rounded-lg"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
