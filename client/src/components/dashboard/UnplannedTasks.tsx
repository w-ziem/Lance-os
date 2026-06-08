import type { TaskDto, TaskPriority } from '@/types/task';
import Card from '@/components/common/Card';

const PRIORITY_ORDER: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const PRIORITY_COLOR: Record<TaskPriority, string> = {
    HIGH:   'var(--status-error)',
    MEDIUM: 'var(--status-warning)',
    LOW:    'var(--status-success)',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = { HIGH: 'High', MEDIUM: 'Med', LOW: 'Low' };

function formatEstimate(hours: number | null): string {
    if (!hours) return '';
    const total = Math.round(hours * 60);
    if (total < 60) return `${total}m`;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface UnplannedTasksProps {
    tasks: TaskDto[];
    projectNameById: Record<string, string>;
}

export default function UnplannedTasks({ tasks, projectNameById }: UnplannedTasksProps) {
    const sorted = [...tasks].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

    return (
        <Card title="Unplanned tasks">
            {sorted.length === 0 ? (
                <p className="px-[18px] py-[14px] text-[13px] text-(--text-tertiary)">
                    All tasks planned. ✓
                </p>
            ) : (
                sorted.map((task, i) => (
                    <div
                        key={task.id}
                        className={`flex items-center gap-[11px] px-[18px] py-[10px] ${
                            i < sorted.length - 1 ? 'border-b border-(--border-default)' : ''
                        }`}
                    >
                        <div
                            className="w-[7px] h-[7px] rounded-full shrink-0 mt-[1px]"
                            style={{ background: PRIORITY_COLOR[task.priority] }}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-(--text-primary) truncate">
                                {task.title}
                            </div>
                            <div className="text-[11px] text-(--text-tertiary) mt-[1px]">
                                {projectNameById[task.projectId] ?? '—'}
                                <span
                                    className="ml-1.5 font-medium"
                                    style={{ color: PRIORITY_COLOR[task.priority] }}
                                >
                                    · {PRIORITY_LABEL[task.priority]}
                                </span>
                            </div>
                        </div>
                        <div className="text-[11px] text-(--text-tertiary) whitespace-nowrap shrink-0 font-mono">
                            {formatEstimate(task.estimateHours)}
                        </div>
                    </div>
                ))
            )}
        </Card>
    );
}
