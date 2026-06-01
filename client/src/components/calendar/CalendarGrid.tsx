import type { TaskDto } from '@/types/task';
import DroppableSlot from './DroppableSlot';
import TaskBlock from './TaskBlock';

interface CalendarGridProps {
    weekDays: Date[];                    // 7 dates, Monday → Sunday at 00:00 local
    scheduledTasks: TaskDto[];
    workStartHour: number;
    workEndHour: number;
    slotMinutes: number;
    slotHeightPx: number;
    onTaskClick: (task: TaskDto) => void;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

export default function CalendarGrid({
    weekDays,
    scheduledTasks,
    workStartHour,
    workEndHour,
    slotMinutes,
    slotHeightPx,
    onTaskClick,
}: CalendarGridProps) {
    const slotsPerHour = 60 / slotMinutes;
    const totalSlots = (workEndHour - workStartHour) * slotsPerHour;
    const hourLabels = Array.from({ length: workEndHour - workStartHour }, (_, i) => workStartHour + i);
    const today = new Date();

    return (
        <div className="flex-1 overflow-hidden">
            <div className="bg-(--surface) border border-(--border-default) rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

                {/* ── Day header row ─────────────────────────────────────────── */}
                <div className="flex border-b border-(--border-default)">
                    <div className="w-[52px] shrink-0" />
                    {weekDays.map((d, i) => {
                        const isToday = sameDay(d, today);
                        return (
                            <div
                                key={i}
                                className="flex-1 text-center py-2.5 border-l border-(--border-default)"
                            >
                                <div className="text-[10px] uppercase tracking-[0.05em] font-medium text-(--text-tertiary)">
                                    {DAY_LABELS[i]}
                                </div>
                                <div
                                    className={`font-display font-bold text-[15px] tracking-[-0.02em] mt-0.5 ${
                                        isToday ? 'text-(--accent)' : 'text-(--text-primary)'
                                    }`}
                                >
                                    {d.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Hour grid ──────────────────────────────────────────────── */}
                <div className="flex">
                    {/* Time column */}
                    <div className="w-[52px] shrink-0">
                        {hourLabels.map(h => (
                            <div
                                key={h}
                                style={{ height: slotHeightPx * slotsPerHour }}
                                className="flex items-start justify-end pr-2 pt-1"
                            >
                                <span className="text-[10px] font-mono text-(--text-tertiary)">
                                    {String(h).padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map(day => {
                        const dateIso = toDateIso(day);
                        const dayTasks = scheduledTasks.filter(t =>
                            t.scheduledStart && sameDay(new Date(t.scheduledStart), day)
                        );
                        return (
                            <div
                                key={dateIso}
                                className="flex-1 relative border-l border-(--border-default)"
                            >
                                {Array.from({ length: totalSlots }, (_, slotIdx) => (
                                    <DroppableSlot
                                        key={slotIdx}
                                        dateIso={dateIso}
                                        slotIndex={slotIdx}
                                        heightPx={slotHeightPx}
                                        showBorderTop={slotIdx > 0 && slotIdx % slotsPerHour === 0}
                                    />
                                ))}

                                {dayTasks.map(task => {
                                    const start = new Date(task.scheduledStart!);
                                    const end = new Date(task.scheduledEnd!);
                                    const minutesFromWorkStart =
                                        (start.getHours() - workStartHour) * 60 + start.getMinutes();
                                    const top = (minutesFromWorkStart / slotMinutes) * slotHeightPx;
                                    const durationMin = (end.getTime() - start.getTime()) / 60000;
                                    const height = Math.max(
                                        (durationMin / slotMinutes) * slotHeightPx - 2,
                                        slotHeightPx - 2
                                    );
                                    return (
                                        <TaskBlock
                                            key={task.id}
                                            task={task}
                                            style={{ top, height }}
                                            onClick={e => { e.stopPropagation(); onTaskClick(task); }}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
