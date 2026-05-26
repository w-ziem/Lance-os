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
        // Backdrop 
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 50,
            }}
        >
            {/* Dialog box */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: '24px 24px 20px',
                    width: 360,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--status-error-tint)',
                    border: '1px solid var(--status-error-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                </div>

                <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                    color: 'var(--text-primary)', margin: '0 0 8px',
                }}>
                    {title}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '8px 16px', fontSize: 13, fontWeight: 500,
                            fontFamily: 'var(--font-body)', cursor: 'pointer',
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-default)', borderRadius: 8,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 16px', fontSize: 13, fontWeight: 600,
                            fontFamily: 'var(--font-body)', cursor: 'pointer',
                            background: 'var(--status-error)', color: '#fff',
                            border: 'none', borderRadius: 8,
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
