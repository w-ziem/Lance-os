import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMeQuery, useUpdateHourlyRate } from '@/hooks/useUser';
import FormField from '@/components/common/FormField';
import SubmitButton from '@/components/common/SubmitButton';

export default function SettingsPage() {
    const { data: me, isLoading } = useMeQuery();
    const updateMutation = useUpdateHourlyRate();

    // null means "untouched" — the field then mirrors the saved rate. As soon as
    // the user types, local state takes over. Avoids seeding through an effect.
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState('');

    const rate = draft ?? (me?.hourlyRate != null ? me.hourlyRate.toString() : '');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const parsed = parseFloat(rate);
        if (!Number.isFinite(parsed) || parsed < 0) {
            setError('Enter a rate of 0 or more');
            return;
        }
        setError('');

        try {
            await updateMutation.mutateAsync({ hourlyRate: parsed });
            toast.success('Hourly rate saved.');
        } catch {
            toast.error('Could not save the rate.');
        }
    }

    return (
        <div className="flex-1 overflow-y-auto px-9 py-8">
            <div className="mb-[22px]">
                <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">
                    Settings
                </h1>
                <p className="text-[12px] text-(--text-tertiary) mt-1">
                    {me?.email ?? '—'}
                </p>
            </div>

            <div className="max-w-[420px] rounded-xl border border-(--border-default) bg-(--surface) p-5">
                <h2 className="font-display font-semibold text-[15px] text-(--text-primary) m-0 tracking-[-0.02em]">
                    Hourly rate
                </h2>
                <p className="text-[12px] text-(--text-secondary) mt-1.5 mb-4 leading-relaxed">
                    Scope items are estimated in hours, never in money. The price you see on a
                    project is those hours times this rate — change it here and every project
                    is repriced at once.
                </p>

                {isLoading ? (
                    <p className="text-[13px] text-(--text-tertiary)">Loading…</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <FormField
                            label="Rate per hour"
                            name="hourlyRate"
                            type="number"
                            step="1"
                            min="0"
                            value={rate}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="150"
                            error={error}
                        />
                        <SubmitButton isLoading={updateMutation.isPending}>
                            Save rate
                        </SubmitButton>
                    </form>
                )}
            </div>
        </div>
    );
}
