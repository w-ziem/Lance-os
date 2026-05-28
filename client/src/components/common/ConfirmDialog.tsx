interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div onClick={onCancel} className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
            <div onClick={e => e.stopPropagation()} className="bg-surface border border-border-default rounded-xl p-6 w-[360px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

                <div className="w-10 h-10 rounded-[10px] bg-status-error-tint border border-status-error-border flex items-center justify-center mb-4 text-status-error">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                </div>

                <p className="font-display font-semibold text-[16px] text-text-primary mb-2">{title}</p>
                <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">{message}</p>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-[13px] font-medium font-body cursor-pointer bg-bg-secondary text-text-primary border border-border-default rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-[13px] font-semibold font-body cursor-pointer bg-status-error text-white border-none rounded-lg"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
