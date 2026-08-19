interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    accentVar: string; // CSS variable name, e.g. '--accent', '--status-success'
}

export default function StatCard({ label, value, sub, accentVar }: StatCardProps) {
    return (
        <div
            className="bg-(--surface) border border-(--border-default) rounded-[10px] px-[18px] py-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
            style={{ borderTop: `3px solid var(${accentVar})` }}
        >
            <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.08em] mb-2">{label}</div>
            <div className="font-display font-bold text-[24px] text-(--text-primary) mb-1 tracking-[-0.02em]">{value}</div>
            {sub && (
                <div className="text-[11px] font-medium" style={{ color: `var(${accentVar})` }}>
                    {sub}
                </div>
            )}
        </div>
    );
}
