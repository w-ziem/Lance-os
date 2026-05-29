type Variant = 'success' | 'accent' | 'warning' | 'neutral' | 'error' | 'agent';

const VARIANT_CLASSES: Record<Variant, string> = {
    success: 'bg-(--status-success-tint) text-(--status-success) border-(--status-success-border)',
    accent:  'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent-border)]',
    warning: 'bg-(--status-warning-tint) text-(--status-warning) border-(--status-warning-border)',
    neutral: 'bg-(--bg-secondary) text-(--text-tertiary) border-(--border-default)',
    error:   'bg-(--status-error-tint) text-(--status-error) border-(--status-error-border)',
    agent:   'bg-(--agent-tint) text-(--agent) border-(--agent-border)',
};

interface StatusBadgeProps {
    label: string;
    variant: Variant;
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-px rounded-full border text-[11px] font-medium whitespace-nowrap ${VARIANT_CLASSES[variant]}`}>
            <span className="w-[5px] h-[5px] rounded-full bg-current inline-block" />
            {label}
        </span>
    );
}
