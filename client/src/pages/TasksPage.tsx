import { useEffect, useMemo, useState } from 'react';
import { useTasksQuery, useDeleteTask } from '@/hooks/useTask';
import { useProjectsQuery } from '@/hooks/useProject';
import type { TaskDto } from '@/types/task';
import SlideDrawer from '@/components/common/SlideDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TaskCard from '@/components/tasks/TaskCard';
import TaskColumn from '@/components/tasks/TaskColumn';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDetailDrawer from '@/components/tasks/TaskDetailDrawer';

const COLUMNS = [
    { key: 'TODO' as const,        title: 'To Do',       dotColor: 'bg-[var(--text-tertiary)]', muted: false },
    { key: 'IN_PROGRESS' as const, title: 'In Progress', dotColor: 'bg-[var(--accent)]', muted: false },
    { key: 'DONE' as const,        title: 'Done',        dotColor: 'bg-(--status-success)', muted: true },
];

export default function TasksPage() {
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<TaskDto | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<TaskDto | null>(null);

    const { data: tasks, isLoading, isError } = useTasksQuery();
    const { data: projects = [] } = useProjectsQuery();
    const deleteMutation = useDeleteTask();

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(p => [p.id, p.name])),
        [projects],
    );

    const grouped = useMemo(() => {
        const buckets: Record<TaskDto['status'], TaskDto[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
        (tasks ?? []).forEach(t => { buckets[t.status].push(t); });
        return buckets;
    }, [tasks]);

    const selected = useMemo(
        () => (selectedId ? (tasks ?? []).find(t => t.id === selectedId) ?? null : null),
        [tasks, selectedId],
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (selectedId && !selected) setSelectedId(null);
    }, [selectedId, selected]);

    function openCreate() { setEditing(null); setEditDrawerOpen(true); setSelectedId(null); }
    function openEdit(task: TaskDto) { setEditing(task); setEditDrawerOpen(true); setSelectedId(null); }
    function closeEditDrawer() { setEditDrawerOpen(false); }
    function openDetail(task: TaskDto) { setSelectedId(task.id); setEditDrawerOpen(false); }
    function closeDetail() { setSelectedId(null); }

    return (
        <div className="flex h-full overflow-hidden">

            <div className="flex-1 overflow-y-auto px-9 py-8">

                <div className="flex justify-between items-start mb-[26px]">
                    <div>
                        <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">Tasks</h1>
                        <p className="text-[12px] text-(--text-tertiary) mt-1">Kanban board</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 bg-[var(--accent)] text-white border-none rounded-lg px-3.5 py-[9px] text-[13px] font-semibold font-body cursor-pointer shadow-[rgba(79,70,229,0.27)_0_2px_12px]"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New task
                    </button>
                </div>

                {isLoading && <p className="text-[13px] text-(--text-tertiary)">Loading…</p>}
                {isError && <p className="text-[13px] text-(--status-error)">Failed to load tasks.</p>}

                {!isLoading && !isError && (
                    <div className="grid grid-cols-3 gap-4 items-start">
                        {COLUMNS.map(col => (
                            <TaskColumn key={col.key} title={col.title} count={grouped[col.key].length} dotColor={col.dotColor}>
                                {grouped[col.key].map(t => (
                                    <div key={t.id} className="relative group">
                                        <TaskCard
                                            task={t}
                                            projectName={projectNameById[t.projectId]}
                                            muted={col.muted}
                                            onClick={() => openDetail(t)}
                                        />
                                        <div
                                            onClick={e => e.stopPropagation()}
                                            className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <button
                                                onClick={() => openEdit(t)}
                                                className="p-1 rounded bg-transparent border-none cursor-pointer text-(--text-secondary) hover:text-(--text-primary)"
                                                aria-label="Edit task"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setToDelete(t)}
                                                className="p-1 rounded bg-transparent border-none cursor-pointer text-(--status-error)"
                                                aria-label="Delete task"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14H6L5 6" />
                                                    <path d="M10 11v6M14 11v6" />
                                                    <path d="M9 6V4h6v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {grouped[col.key].length === 0 && (
                                    <p className="text-[12px] text-(--text-tertiary) text-center py-4">No tasks</p>
                                )}
                            </TaskColumn>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <TaskDetailDrawer
                    task={selected}
                    projectName={projectNameById[selected.projectId]}
                    onClose={closeDetail}
                />
            )}

            <ConfirmDialog
                open={toDelete !== null}
                title="Delete task"
                message={`Delete "${toDelete?.title}"? This cannot be undone.`}
                confirmLabel="Delete"
                onCancel={() => setToDelete(null)}
                onConfirm={() => {
                    if (toDelete) deleteMutation.mutate(toDelete.id);
                    setToDelete(null);
                }}
            />

            <SlideDrawer
                open={editDrawerOpen}
                title={editing ? 'Edit task' : 'New task'}
                onClose={closeEditDrawer}
            >
                <TaskForm task={editing ?? undefined} onSuccess={closeEditDrawer} />
            </SlideDrawer>
        </div>
    );
}
