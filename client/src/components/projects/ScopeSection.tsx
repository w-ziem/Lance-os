import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    useScopeItemsQuery,
    useScopeSummaryQuery,
    useCreateScopeItem,
    useUpdateScopeItem,
    useDeleteScopeItem,
} from '@/hooks/useScopeItem';
import type { ScopeItemDto, ScopeSummaryDto } from '@/types/scopeItem';

interface ScopeSectionProps {
    projectId: string;
}

function money(value: number) {
    return `$${Math.round(value).toLocaleString('en-US')}`;
}

function hours(value: number) {
    return Number.isInteger(value) ? `${value}h` : `${value.toFixed(1)}h`;
}

export default function ScopeSection({ projectId }: ScopeSectionProps) {
    const { data: items = [], isLoading } = useScopeItemsQuery(projectId);
    const { data: summary } = useScopeSummaryQuery(projectId);

    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-3">
            <div className="h-px bg-(--border-default)" />

            <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-[14px] text-(--text-primary) m-0 tracking-[-0.02em]">
                    Scope
                </h3>
                <button
                    onClick={() => { setAdding(v => !v); setEditingId(null); }}
                    className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-[12px] font-medium font-body text-[var(--accent)] p-0"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {adding ? 'Cancel' : 'Add item'}
                </button>
            </div>

            {summary && <ScopeValuation summary={summary} />}

            {adding && (
                <ScopeItemForm
                    projectId={projectId}
                    onDone={() => setAdding(false)}
                />
            )}

            {isLoading && <p className="text-[12px] text-(--text-tertiary) m-0">Loading scope…</p>}

            {!isLoading && items.length === 0 && !adding && (
                <p className="text-[12px] text-(--text-tertiary) m-0 leading-relaxed">
                    Nothing agreed yet. Add what you actually sold — each item priced on its own.
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                {items.map(item =>
                    editingId === item.id ? (
                        <ScopeItemForm
                            key={item.id}
                            projectId={projectId}
                            item={item}
                            onDone={() => setEditingId(null)}
                        />
                    ) : (
                        <ScopeItemRow
                            key={item.id}
                            projectId={projectId}
                            item={item}
                            hourlyRate={summary?.hourlyRate ?? null}
                            onEdit={() => { setEditingId(item.id); setAdding(false); }}
                        />
                    )
                )}
            </div>
        </div>
    );
}

/* ── Valuation panel ──────────────────────────────────────── */

function ScopeValuation({ summary }: { summary: ScopeSummaryDto }) {
    const { totalHours, hourlyRate, totalValue, budget, difference, overBudget } = summary;

    if (hourlyRate === null) {
        return (
            <div className="rounded-lg border border-(--border-default) bg-(--bg-secondary) px-3 py-2.5">
                <p className="text-[12px] text-(--text-secondary) m-0 leading-relaxed">
                    {hours(totalHours)} of work agreed.{' '}
                    <Link to="/settings" className="text-[var(--accent)] font-medium no-underline">
                        Set your hourly rate
                    </Link>{' '}
                    to price it.
                </p>
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg border px-3 py-2.5 flex flex-col gap-1.5 ${
                overBudget
                    ? 'border-(--status-warning-border) bg-(--status-warning-tint)'
                    : 'border-(--border-default) bg-(--bg-secondary)'
            }`}
        >
            <Row
                label={`Scope value · ${hours(totalHours)}`}
                value={totalValue === null ? '—' : money(totalValue)}
            />
            <Row
                label="Budget"
                value={budget === null ? 'not set' : money(budget)}
                muted={budget === null}
            />

            <div className="h-px bg-(--border-default)" />

            {difference === null ? (
                <p className="text-[11px] text-(--text-tertiary) m-0">
                    Add a budget to this project to see the gap.
                </p>
            ) : (
                <div className="flex items-baseline justify-between">
                    <span
                        className={`text-[12px] font-medium ${
                            overBudget ? 'text-(--status-warning)' : 'text-(--status-success)'
                        }`}
                    >
                        {overBudget ? 'Over budget' : 'Within budget'}
                    </span>
                    <span
                        className={`text-[13px] font-display font-bold tabular-nums ${
                            overBudget ? 'text-(--status-warning)' : 'text-(--status-success)'
                        }`}
                    >
                        {difference > 0 ? '+' : ''}{money(difference)}
                    </span>
                </div>
            )}
        </div>
    );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] text-(--text-secondary)">{label}</span>
            <span
                className={`text-[12px] font-medium tabular-nums ${
                    muted ? 'text-(--text-tertiary)' : 'text-(--text-primary)'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

/* ── Item row ─────────────────────────────────────────────── */

function ScopeItemRow({ projectId, item, hourlyRate, onEdit }: {
    projectId: string;
    item: ScopeItemDto;
    hourlyRate: number | null;
    onEdit: () => void;
}) {
    const deleteMutation = useDeleteScopeItem(projectId);

    return (
        <div className="group flex items-start gap-2 rounded-lg border border-(--border-default) bg-(--surface) px-2.5 py-2 hover:bg-(--surface-hover) transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px] text-(--text-primary) font-medium truncate">
                        {item.name}
                    </span>
                    {item.source === 'AI' && (
                        <span className="text-[9px] uppercase tracking-[0.08em] text-(--agent) shrink-0">
                            AI
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-[11px] text-(--text-tertiary) m-0 mt-0.5 line-clamp-2">
                        {item.description}
                    </p>
                )}
            </div>

            <div className="text-right shrink-0">
                <div className="text-[12px] text-(--text-secondary) tabular-nums">
                    {hours(item.estimateHours)}
                </div>
                {hourlyRate !== null && (
                    <div className="text-[11px] text-(--text-tertiary) tabular-nums">
                        {money(item.estimateHours * hourlyRate)}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={onEdit}
                    aria-label={`Edit ${item.name}`}
                    className="p-0.5 rounded bg-transparent border-none cursor-pointer text-(--text-tertiary) hover:text-(--text-primary)"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                    </svg>
                </button>
                <button
                    onClick={() => deleteMutation.mutate(item.id, {
                        onError: () => toast.error('Could not remove item.'),
                    })}
                    aria-label={`Remove ${item.name}`}
                    className="p-0.5 rounded bg-transparent border-none cursor-pointer text-(--status-error)"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/* ── Create / edit form ───────────────────────────────────── */

function ScopeItemForm({ projectId, item, onDone }: {
    projectId: string;
    item?: ScopeItemDto;
    onDone: () => void;
}) {
    const [name, setName] = useState(item?.name ?? '');
    const [description, setDescription] = useState(item?.description ?? '');
    const [estimateHours, setEstimateHours] = useState(item?.estimateHours?.toString() ?? '');
    const [error, setError] = useState('');

    const createMutation = useCreateScopeItem(projectId);
    const updateMutation = useUpdateScopeItem(projectId);
    const isPending = createMutation.isPending || updateMutation.isPending;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const parsedHours = parseFloat(estimateHours);
        if (!name.trim()) return setError('Name is required');
        if (!Number.isFinite(parsedHours) || parsedHours <= 0) return setError('Hours must be above 0');
        setError('');

        try {
            if (item) {
                await updateMutation.mutateAsync({
                    id: item.id,
                    data: { name, description: description || undefined, estimateHours: parsedHours },
                });
            } else {
                await createMutation.mutateAsync({
                    name,
                    description: description || undefined,
                    estimateHours: parsedHours,
                });
            }
            onDone();
        } catch {
            toast.error('Could not save the item.');
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-lg border border-(--accent-border) bg-(--accent-tint) px-2.5 py-2.5"
        >
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Landing page design"
                autoFocus
                className="border border-(--border-default) rounded-md px-2.5 py-[7px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)]"
            />
            <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What exactly was agreed (optional)"
                rows={2}
                className="border border-(--border-default) rounded-md px-2.5 py-[7px] text-[12px] font-body text-(--text-primary) bg-(--surface) outline-none resize-y focus:border-[var(--accent)]"
            />
            <input
                type="number"
                step="0.5"
                min="0"
                value={estimateHours}
                onChange={e => setEstimateHours(e.target.value)}
                placeholder="Hours sold, e.g. 6"
                className="border border-(--border-default) rounded-md px-2.5 py-[7px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)]"
            />

            {error && <p className="text-[11px] text-(--status-error) m-0">{error}</p>}

            <div className="flex gap-1.5">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-[var(--accent)] text-white border-none rounded-md py-[7px] text-[12px] font-semibold font-body cursor-pointer disabled:opacity-60"
                >
                    {isPending ? 'Saving…' : item ? 'Update' : 'Add to scope'}
                </button>
                <button
                    type="button"
                    onClick={onDone}
                    className="px-3 rounded-md border border-(--border-default) bg-(--surface) text-[12px] font-medium font-body text-(--text-secondary) cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
