import type { TaskDto } from '@/types/task';
import Card from '@/components/common/Card';

const PRIORITY_DOT: Record<string, string> = {
    HIGH:   'var(--status-error)',
    MEDIUM: 'var(--status-warning)',
    LOW:    'var(--status-success)',
};

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

function formatDuration(start: string, end: string): string {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface TodaysScheduleProps {
    tasks: TaskDto[];
}

export default function TodaysSchedule({ tasks }: TodaysScheduleProps) {
    return (
        <Card title="Today's schedule">
            {tasks.length === 0 ? (
                <p className="px-[18px] py-[14px] text-[13px] text-(--text-tertiary)">
                    Nothing scheduled today.
                </p>
            ) : (
                tasks.map((task, i) => (
                    <div
                        key={task.id}
                        className={`flex items-center gap-[11px] px-[18px] py-[10px] ${
                            i < tasks.length - 1 ? 'border-b border-(--border-default)' : ''
                        }`}
                    >
                        <div className="text-[11px] font-mono text-(--text-tertiary) min-w-[42px]">
                            {task.scheduledStart ? formatTime(task.scheduledStart) : '—'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-(--text-primary) truncate">
                                {task.title}
                            </div>
                            <div className="text-[11px] text-(--text-tertiary) mt-[1px]">
                                {task.scheduledStart && task.scheduledEnd
                                    ? formatDuration(task.scheduledStart, task.scheduledEnd)
                                    : ''}
                            </div>
                        </div>
                        <div
                            className="w-[7px] h-[7px] rounded-full shrink-0"
                            style={{ background: PRIORITY_DOT[task.priority] ?? 'var(--text-tertiary)' }}
                        />
                    </div>
                ))
            )}
        </Card>
    );
}
