import { useDraggable } from '@dnd-kit/core';
import type { TaskDto, TaskPriority } from '@/types/task';

const PRIORITY_CLASS: Record<TaskPriority, string> = {
    HIGH:   'bg-(--status-error-tint) border-(--status-error-border) text-(--status-error)',
    MEDIUM: 'bg-(--status-warning-tint) border-(--status-warning-border) text-(--status-warning)',
    LOW:    'bg-(--status-success-tint) border-(--status-success-border) text-(--status-success)',
};

interface TaskBlockProps {
    task: TaskDto;
    style?: React.CSSProperties;
    compact?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

// Single draggable kafelek, used both on the calendar grid (positioned absolutely
// via `style.top` / `style.height`) and in the unscheduled sidebar (flow layout, compact).
export default function TaskBlock({ task, style, compact, onClick }: TaskBlockProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        disabled: task.locked,
        data: { task },
    });

    const color = PRIORITY_CLASS[task.priority];

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            onClick={onClick}
            className={`${color} border rounded-md overflow-hidden select-none transition-opacity duration-100 ${
                compact ? 'px-2 py-1.5' : 'absolute left-[3px] right-[3px] px-[7px] py-[5px]'
            } ${task.locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
                isDragging ? 'opacity-40' : ''
            }`}
        >
            <div className="text-[11px] font-semibold leading-[1.2] flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {task.locked && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                )}
                {task.title}
            </div>
            {!compact && task.scheduledStart && task.scheduledEnd && (
                <div className="text-[10px] opacity-70 mt-0.5">
                    {formatRange(task.scheduledStart, task.scheduledEnd)}
                </div>
            )}
        </div>
    );
}

function formatRange(startIso: string, endIso: string): string {
    const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(startIso)} – ${fmt(endIso)}`;
}
