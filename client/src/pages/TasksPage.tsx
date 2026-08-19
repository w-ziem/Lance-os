import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
    type DragEndEvent,
} from '@dnd-kit/core';
import { useTasksQuery, useDeleteTask, useUpdateAnyTaskStatus } from '@/hooks/useTask';
import { useProjectsQuery } from '@/hooks/useProject';
import type { TaskDto, TaskStatus } from '@/types/task';
import SlideDrawer from '@/components/common/SlideDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TaskCard from '@/components/tasks/TaskCard';
import TaskColumn from '@/components/tasks/TaskColumn';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDetailDrawer from '@/components/tasks/TaskDetailDrawer';

const COLUMNS: { key: TaskStatus; title: string; dotColor: string; muted: boolean }[] = [
    { key: 'TODO',        title: 'To Do',       dotColor: 'bg-[var(--text-tertiary)]', muted: false },
    { key: 'IN_PROGRESS', title: 'In Progress', dotColor: 'bg-[var(--accent)]',        muted: false },
    { key: 'DONE',        title: 'Done',         dotColor: 'bg-(--status-success)',      muted: true },
];

// ── Droppable column wrapper ──────────────────────────────────────────────────
function DroppableColumn({ id, isOver, children }: { id: string; isOver: boolean; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`min-h-[120px] rounded-lg p-1.5 -m-1.5 transition-colors duration-150 ${isOver ? 'bg-[var(--accent-tint)]' : ''}`}
        >
            {children}
        </div>
    );
}

// ── Draggable card wrapper ────────────────────────────────────────────────────
function DraggableCard({
    task,
    projectName,
    muted,
    onEdit,
    onDelete,
    onDetail,
}: {
    task: TaskDto;
    projectName?: string;
    muted?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDetail: () => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`relative group transition-opacity duration-100 ${isDragging ? 'opacity-40' : ''}`}
        >
            <TaskCard task={task} projectName={projectName} muted={muted} onClick={onDetail} />
            <div
                onClick={e => e.stopPropagation()}
                className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <button
                    onClick={onEdit}
                    className="p-1 rounded bg-transparent border-none cursor-pointer text-(--text-secondary) hover:text-(--text-primary)"
                    aria-label="Edit task"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
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
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TasksPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [editDrawerOpen, setEditDrawerOpen] = useState(
        () => !!(location.state as { openCreate?: boolean } | null)?.openCreate
    );
    const [editing, setEditing] = useState<TaskDto | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(
        () => (location.state as { openTaskId?: string } | null)?.openTaskId ?? null,
    );
    const [toDelete, setToDelete] = useState<TaskDto | null>(null);
    const [projectFilter, setProjectFilter] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    // Clear router state so a refresh doesn't re-open drawers.
    useEffect(() => {
        const state = location.state as { openTaskId?: string; openCreate?: boolean } | null;
        if (state?.openTaskId || state?.openCreate) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    const { data: tasks, isLoading, isError } = useTasksQuery();
    const { data: projects = [] } = useProjectsQuery();
    const deleteMutation = useDeleteTask();
    const dndStatusMutation = useUpdateAnyTaskStatus();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(p => [p.id, p.name])),
        [projects],
    );

    const filteredTasks = useMemo(
        () => (tasks ?? []).filter(t => projectFilter === null || t.projectId === projectFilter),
        [tasks, projectFilter],
    );

    const grouped = useMemo(() => {
        const buckets: Record<TaskStatus, TaskDto[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
        filteredTasks.forEach(t => { buckets[t.status].push(t); });
        return buckets;
    }, [filteredTasks]);

    const selected = useMemo(
        () => (selectedId ? (tasks ?? []).find(t => t.id === selectedId) ?? null : null),
        [tasks, selectedId],
    );

    const activeTask = useMemo(
        () => (activeId ? (tasks ?? []).find(t => t.id === activeId) ?? null : null),
        [tasks, activeId],
    );

    // Preserve last selected task so the detail drawer can animate out with content
    const lastSelectedRef = useRef<TaskDto | null>(null);
    if (selected) lastSelectedRef.current = selected;

    useEffect(() => {
        // Only clear once tasks have actually loaded — otherwise we'd reset the
        // id passed in via router state before the lookup can resolve.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (selectedId && tasks && !selected) setSelectedId(null);
    }, [selectedId, selected, tasks]);

    function openCreate() { setEditing(null); setEditDrawerOpen(true); setSelectedId(null); }
    function openEdit(task: TaskDto) { setEditing(task); setEditDrawerOpen(true); setSelectedId(null); }
    function closeEditDrawer() { setEditDrawerOpen(false); }
    function openDetail(task: TaskDto) { setSelectedId(task.id); setEditDrawerOpen(false); }
    function closeDetail() { setSelectedId(null); }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        setOverId(null);
        if (!over) return;
        const task = (tasks ?? []).find(t => t.id === active.id);
        if (!task) return;
        const newStatus = String(over.id) as TaskStatus;
        if (task.status === newStatus) return;
        dndStatusMutation.mutate({ id: task.id, status: newStatus });
    }

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
                        className="btn-accent flex items-center gap-1.5 bg-[var(--accent)] text-white border-none rounded-lg px-3.5 py-[9px] text-[13px] font-semibold font-body cursor-pointer shadow-[rgba(79,70,229,0.27)_0_2px_12px]"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New task
                    </button>
                </div>

                {/* Project filter pills */}
                {projects.length > 0 && (
                    <div className="flex gap-1.5 mb-5 flex-wrap">
                        <button
                            onClick={() => setProjectFilter(null)}
                            className={`px-3.5 py-[5px] rounded-full text-[12px] font-medium font-body cursor-pointer border ${
                                projectFilter === null
                                    ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                                    : 'border-(--border-default) bg-(--surface) text-(--text-secondary)'
                            }`}
                        >
                            All
                        </button>
                        {projects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setProjectFilter(p.id)}
                                className={`px-3.5 py-[5px] rounded-full text-[12px] font-medium font-body cursor-pointer border ${
                                    projectFilter === p.id
                                        ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                                        : 'border-(--border-default) bg-(--surface) text-(--text-secondary)'
                                }`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && <p className="text-[13px] text-(--text-tertiary)">Loading…</p>}
                {isError && <p className="text-[13px] text-(--status-error)">Failed to load tasks.</p>}

                {!isLoading && !isError && (
                    <DndContext
                        sensors={sensors}
                        onDragStart={e => { setActiveId(String(e.active.id)); setSelectedId(null); }}
                        onDragOver={e => setOverId(e.over?.id ? String(e.over.id) : null)}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => { setActiveId(null); setOverId(null); }}
                    >
                        <div className="grid grid-cols-3 gap-4 items-start">
                            {COLUMNS.map(col => (
                                <DroppableColumn key={col.key} id={col.key} isOver={overId === col.key}>
                                    <TaskColumn title={col.title} count={grouped[col.key].length} dotColor={col.dotColor}>
                                        {grouped[col.key].map(t => (
                                            <DraggableCard
                                                key={t.id}
                                                task={t}
                                                projectName={projectNameById[t.projectId]}
                                                muted={col.muted}
                                                onEdit={() => openEdit(t)}
                                                onDelete={() => setToDelete(t)}
                                                onDetail={() => openDetail(t)}
                                            />
                                        ))}
                                        {grouped[col.key].length === 0 && (
                                            <p className="text-[12px] text-(--text-tertiary) text-center py-4">No tasks</p>
                                        )}
                                    </TaskColumn>
                                </DroppableColumn>
                            ))}
                        </div>

                        <DragOverlay dropAnimation={null}>
                            {activeTask && (
                                <div className="rotate-1 opacity-95 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                                    <TaskCard
                                        task={activeTask}
                                        projectName={projectNameById[activeTask.projectId]}
                                        onClick={() => {}}
                                    />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            <TaskDetailDrawer
                task={lastSelectedRef.current}
                projectName={lastSelectedRef.current ? projectNameById[lastSelectedRef.current.projectId] : undefined}
                open={selected !== null}
                onClose={closeDetail}
            />

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
