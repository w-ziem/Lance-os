import type { TaskDto, TaskPriority } from '@/types/task';

interface TaskCardProps {
    task: TaskDto;
    projectName?: string;
    muted?: boolean;
    onClick: () => void;
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
    HIGH:   'bg-status-error',
    MEDIUM: 'bg-status-warning',
    LOW:    'bg-status-success',
};

function formatDeadline(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Smart display: under one hour show minutes ("45m"), 1h and up show hours ("2h" or "2h 30m").
function formatEstimate(hours: number | null): string {
    if (hours == null || hours <= 0) return '';
    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes}m`;
    }
    const whole = Math.floor(hours);
    const remainderMinutes = Math.round((hours - whole) * 60);
    if (remainderMinutes === 0) return `${whole}h`;
    if (remainderMinutes === 60) return `${whole + 1}h`;
    return `${whole}h ${remainderMinutes}m`;
}

export default function TaskCard({ task, projectName, muted, onClick }: TaskCardProps) {
    const subtaskCount = task.subtasks.length;
    const subtaskDone = task.subtasks.filter(s => s.done).length;

    return (
        <div
            onClick={onClick}
            className={`bg-surface border border-border-default rounded-[9px] px-[13px] py-[11px] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_3px_10px_rgba(0,0,0,0.07)] transition-all duration-150 ${muted ? 'opacity-65' : ''}`}
        >
            <div className="text-[13px] font-medium text-text-primary leading-[1.3] mb-1">
                {task.title}
            </div>
            <div className="text-[11px] text-text-tertiary mb-[9px] flex items-center gap-2">
                <span>{projectName ?? '—'}</span>
                {subtaskCount > 0 && (
                    <span className="font-mono">· {subtaskDone}/{subtaskCount}</span>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="text-[11px] text-text-tertiary flex items-center gap-[3px]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatDeadline(task.deadline)}
                </div>
                <div className="flex items-center gap-1.5">
                    {task.estimateHours != null && (
                        <span className="text-[11px] text-text-tertiary font-mono">{formatEstimate(task.estimateHours)}</span>
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLOR[task.priority]}`} />
                </div>
            </div>
        </div>
    );
}
