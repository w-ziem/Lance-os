import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { SubtaskDto } from '@/types/task';
import { useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from '@/hooks/useSubtask';

interface SubtaskListProps {
    taskId: string;
    subtasks: SubtaskDto[];
}

export default function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
    const [newLabel, setNewLabel] = useState('');

    const createMutation = useCreateSubtask(taskId);
    const updateMutation = useUpdateSubtask(taskId);
    const deleteMutation = useDeleteSubtask(taskId);

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const label = newLabel.trim();
        if (!label) return;
        try {
            await createMutation.mutateAsync({ label });
            setNewLabel('');
        } catch {
            toast.error('Could not add subtask.');
        }
    }

    function toggleDone(s: SubtaskDto) {
        updateMutation.mutate({ id: s.id, data: { done: !s.done } });
    }

    function remove(s: SubtaskDto) {
        deleteMutation.mutate(s.id);
    }

    const total = subtasks.length;
    const done = subtasks.filter(s => s.done).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-2.5">
                <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em]">Subtasks</div>
                {total > 0 && (
                    <div className="text-[10px] text-(--text-tertiary) font-mono">{done}/{total}</div>
                )}
            </div>

            {subtasks.length === 0 && (
                <p className="text-[12px] text-(--text-tertiary) mb-2">No subtasks yet.</p>
            )}

            <ul className="flex flex-col">
                {subtasks.map((s, i) => (
                    <li
                        key={s.id}
                        className={`group flex items-center gap-2 py-[7px] ${i < subtasks.length - 1 ? 'border-b border-(--border-default)' : ''}`}
                    >
                        <button
                            type="button"
                            onClick={() => toggleDone(s)}
                            aria-label={s.done ? 'Mark not done' : 'Mark done'}
                            className={`w-[15px] h-[15px] rounded shrink-0 flex items-center justify-center cursor-pointer border-[1.5px] ${
                                s.done
                                    ? 'border-[var(--accent)] bg-[var(--accent)]'
                                    : 'border-(--border-default) bg-transparent'
                            } transition-all duration-150`}
                        >
                            {s.done && (
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                    <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                        <span
                            onClick={() => toggleDone(s)}
                            className={`flex-1 text-[13px] cursor-pointer ${
                                s.done ? 'text-(--text-tertiary) line-through' : 'text-(--text-primary)'
                            } transition-colors`}
                        >
                            {s.label}
                        </span>
                        <button
                            type="button"
                            onClick={() => remove(s)}
                            aria-label="Delete subtask"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-transparent border-none cursor-pointer text-(--status-error)"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAdd} className="flex gap-2 mt-3">
                <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add a subtask…"
                    className="flex-1 border border-(--border-default) rounded-md px-2.5 py-1.5 text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                />
                <button
                    type="submit"
                    disabled={!newLabel.trim() || createMutation.isPending}
                    className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white border-none text-[12px] font-semibold font-body cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add
                </button>
            </form>
        </div>
    );
}
