import { useState } from 'react';
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
    /** Show a bottom drag-handle that lets the user resize the block. Only useful on the grid. */
    resizable?: boolean;
    /** Slot grid metrics; required when `resizable`. */
    slotHeightPx?: number;
    slotMinutes?: number;
    onClick?: (e: React.MouseEvent) => void;
    /** Called with the *new total duration in minutes* after a resize gesture ends. */
    onResize?: (newDurationMinutes: number) => void;
}

// Single draggable kafelek, used both on the calendar grid (positioned absolutely
// via `style.top` / `style.height`) and in the unscheduled sidebar (flow layout, compact).
export default function TaskBlock({
    task,
    style,
    compact,
    resizable,
    slotHeightPx = 25,
    slotMinutes = 30,
    onClick,
    onResize,
}: TaskBlockProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        disabled: task.locked,
        data: { task },
    });

    // Live delta in pixels while the user is dragging the bottom edge.
    const [resizeDeltaPx, setResizeDeltaPx] = useState(0);

    function handleResizeStart(e: React.MouseEvent) {
        // Critical: keep this gesture out of dnd-kit's listeners on the parent.
        e.stopPropagation();
        e.preventDefault();

        if (!task.scheduledStart || !task.scheduledEnd) return;
        const startY = e.clientY;
        let snappedDeltaPx = 0;

        function onMove(ev: MouseEvent) {
            const raw = ev.clientY - startY;
            // Snap to nearest slot height so the preview lines up with the grid.
            snappedDeltaPx = Math.round(raw / slotHeightPx) * slotHeightPx;
            setResizeDeltaPx(snappedDeltaPx);
        }
        function onUp() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            setResizeDeltaPx(0);

            if (snappedDeltaPx === 0 || !onResize) return;
            const deltaMinutes = (snappedDeltaPx / slotHeightPx) * slotMinutes;
            const currentMinutes =
                (new Date(task.scheduledEnd!).getTime() - new Date(task.scheduledStart!).getTime()) / 60000;
            const newMinutes = Math.max(currentMinutes + deltaMinutes, slotMinutes);
            if (newMinutes !== currentMinutes) {
                onResize(newMinutes);
            }
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }

    const color = PRIORITY_CLASS[task.priority];

    // Live preview: extend the rendered height while the user holds the resize handle.
    const baseHeight = typeof style?.height === 'number' ? style.height : 0;
    const minHeight = slotHeightPx - 2;
    const effectiveStyle = resizeDeltaPx !== 0 && style
        ? { ...style, height: Math.max(baseHeight + resizeDeltaPx, minHeight) }
        : style;

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={effectiveStyle}
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

            {resizable && !compact && !task.locked && (
                <div
                    onMouseDown={handleResizeStart}
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-0.5"
                    aria-label="Resize task"
                >
                    <span className="w-6 h-[2px] rounded-full bg-current opacity-60" />
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
