import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import {
    useScheduleViewQuery,
    useScheduleTask,
    useUnscheduleTask,
} from '@/hooks/useSchedule';
import type { TaskDto } from '@/types/task';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import UnscheduledList from '@/components/calendar/UnscheduledList';
import TaskBlock from '@/components/calendar/TaskBlock';

// ── Working-hours / slot config ─────────────────────────────────────────────
// Mirror of server `app.schedule.*` (application.yml). Will be migrated to a
// per-user preference table later, but for now these two stay in lock-step.
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT_PX = 25; // 30-min slot → 50px per hour, matching design

// ── Date helpers ────────────────────────────────────────────────────────────
function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dayIndex = (d.getDay() + 6) % 7; // 0 = Monday
    d.setDate(d.getDate() - dayIndex);
    return d;
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function fmtWeekLabel(start: Date): string {
    const end = addDays(start, 6);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}, ${end.getFullYear()}`;
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
    const navigate = useNavigate();
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const [activeId, setActiveId] = useState<string | null>(null);

    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart],
    );

    const range = useMemo(() => ({
        startDate: weekStart.toISOString(),
        endDate: addDays(weekStart, 7).toISOString(),
    }), [weekStart]);

    const { data, isLoading, isError } = useScheduleViewQuery(range);
    const scheduleMut = useScheduleTask();
    const unscheduleMut = useUnscheduleTask();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const allTasks = useMemo(
        () => [...(data?.scheduled ?? []), ...(data?.unscheduled ?? [])],
        [data],
    );

    const activeTask = useMemo(
        () => allTasks.find(t => t.id === activeId) ?? null,
        [allTasks, activeId],
    );

    function handleTaskClick(task: TaskDto) {
        // Reschedule happens via drag; click opens the task in the tasks page detail drawer.
        navigate('/tasks', { state: { openTaskId: task.id } });
    }

    function handleTaskResize(task: TaskDto, newDurationMinutes: number) {
        if (!task.scheduledStart) return;
        const start = new Date(task.scheduledStart);
        const end = new Date(start.getTime() + newDurationMinutes * 60000);
        scheduleMut.mutate(
            { id: task.id, data: { startDate: task.scheduledStart, endDate: end.toISOString() } },
            { onError: (err) => toast.error(extractError(err) ?? 'Could not resize task.') },
        );
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = String(active.id);
        const overData = over.data.current as
            | { type: 'slot'; dateIso: string; slotIndex: number }
            | { type: 'unscheduled' }
            | undefined;
        if (!overData) return;

        if (overData.type === 'unscheduled') {
            unscheduleMut.mutate(taskId, {
                onError: (err) => toast.error(extractError(err) ?? 'Could not unschedule.'),
            });
            return;
        }

        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;

        // Compute start from slot, preserve duration (or fall back to estimate / 1h).
        const [y, m, d] = overData.dateIso.split('-').map(Number);
        const start = new Date(y, m - 1, d, 0, 0, 0, 0);
        start.setMinutes(WORK_START_HOUR * 60 + overData.slotIndex * SLOT_MINUTES);

        const durationMin = pickDurationMinutes(task);
        const end = new Date(start.getTime() + durationMin * 60000);

        scheduleMut.mutate(
            { id: taskId, data: { startDate: start.toISOString(), endDate: end.toISOString() } },
            { onError: (err) => toast.error(extractError(err) ?? 'Could not schedule task.') },
        );
    }

    return (
        <div className="flex h-full overflow-hidden">

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-9 pt-8 pb-4 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">
                            Calendar
                        </h1>
                        <p className="text-[12px] text-(--text-tertiary) mt-1">
                            {fmtWeekLabel(weekStart)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setWeekStart(prev => addDays(prev, -7))}
                            className="w-8 h-8 rounded-md border border-(--border-default) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover) flex items-center justify-center cursor-pointer"
                            aria-label="Previous week"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className="h-8 px-3 rounded-md border border-(--border-default) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover) text-[12px] font-medium font-body cursor-pointer"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setWeekStart(prev => addDays(prev, 7))}
                            className="w-8 h-8 rounded-md border border-(--border-default) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover) flex items-center justify-center cursor-pointer"
                            aria-label="Next week"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Grid + sidebar */}
                <div className="flex-1 overflow-hidden px-9 pb-8 flex gap-4">
                    {isLoading && (
                        <p className="text-[13px] text-(--text-tertiary)">Loading schedule…</p>
                    )}
                    {isError && (
                        <p className="text-[13px] text-(--status-error)">Failed to load schedule.</p>
                    )}

                    {data && (
                        <DndContext
                            sensors={sensors}
                            onDragStart={e => setActiveId(String(e.active.id))}
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex-1 overflow-y-auto">
                                <CalendarGrid
                                    weekDays={weekDays}
                                    scheduledTasks={data.scheduled}
                                    workStartHour={WORK_START_HOUR}
                                    workEndHour={WORK_END_HOUR}
                                    slotMinutes={SLOT_MINUTES}
                                    slotHeightPx={SLOT_HEIGHT_PX}
                                    onTaskClick={handleTaskClick}
                                    onTaskResize={handleTaskResize}
                                />
                            </div>

                            <UnscheduledList
                                tasks={data.unscheduled}
                                onTaskClick={handleTaskClick}
                            />

                            <DragOverlay dropAnimation={null}>
                                {activeTask && (
                                    <div className="opacity-95 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                                        <TaskBlock task={activeTask} compact />
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
}

function pickDurationMinutes(task: TaskDto): number {
    if (task.scheduledStart && task.scheduledEnd) {
        return (new Date(task.scheduledEnd).getTime() - new Date(task.scheduledStart).getTime()) / 60000;
    }
    if (task.estimateHours && task.estimateHours > 0) {
        return task.estimateHours * 60;
    }
    return 60;
}

function extractError(err: unknown): string | undefined {
    const axiosErr = err as AxiosError<string>;
    return typeof axiosErr?.response?.data === 'string' ? axiosErr.response.data : undefined;
}
