import toast from 'react-hot-toast';
import type { TaskDto, TaskPriority, TaskStatus } from '@/types/task';
import { useUpdateTaskPriority, useUpdateTaskStatus } from '@/hooks/useTask';
import SubtaskList from './SubtaskList';

interface TaskDetailDrawerProps {
    task: TaskDto | null;
    projectName?: string;
    open: boolean;
    onClose: () => void;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
    TODO:        'To Do',
    IN_PROGRESS: 'In Progress',
    DONE:        'Done',
};

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const PRIORITY_LABEL: Record<TaskPriority, string> = {
    LOW:    'Low',
    MEDIUM: 'Medium',
    HIGH:   'High',
};

const PRIORITY_COLOR = { HIGH: 'bg-(--status-error)', MEDIUM: 'bg-(--status-warning)', LOW: 'bg-(--status-success)' } as const;

const PRIORITY_ACTIVE_STYLE: Record<TaskPriority, string> = {
    HIGH:   'border-(--status-error) bg-(--status-error-tint) text-(--status-error)',
    MEDIUM: 'border-(--status-warning) bg-amber-50 text-amber-700',
    LOW:    'border-(--status-success) bg-(--status-success-tint) text-(--status-success)',
};

function formatDeadline(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatEstimate(hours: number | null): string {
    if (hours == null || hours <= 0) return '—';
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

export default function TaskDetailDrawer({ task, projectName, open, onClose }: TaskDetailDrawerProps) {
    const statusMutation = useUpdateTaskStatus(task?.id ?? '');
    const priorityMutation = useUpdateTaskPriority(task?.id ?? '');

    async function changeStatus(status: TaskStatus) {
        try {
            await statusMutation.mutateAsync({ status });
            toast.success(`Moved to ${STATUS_LABEL[status]}.`);
        } catch {
            toast.error('Could not move task. Try again.');
        }
    }

    async function changePriority(priority: TaskPriority) {
        try {
            await priorityMutation.mutateAsync({ priority });
            toast.success(`Priority set to ${PRIORITY_LABEL[priority].toLowerCase()}.`);
        } catch {
            toast.error('Could not update priority. Try again.');
        }
    }

    return (
        <div
            className={`fixed top-0 right-0 h-screen w-[340px] bg-(--surface) border-l border-(--border-default) shadow-[-4px_0_20px_rgba(0,0,0,0.06)] flex flex-col overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
            aria-hidden={!open}
        >
            <div className="flex items-start justify-between px-5 py-4 border-b border-(--border-default) gap-2">
                <div>
                    <div className="font-display font-semibold text-[15px] text-(--text-primary) leading-[1.3]">
                        {task?.title ?? ''}
                    </div>
                    <div className="text-[12px] text-(--text-secondary) mt-1">{projectName ?? '—'}</div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-(--border-default) bg-(--bg-secondary) text-(--text-secondary) cursor-pointer shrink-0"
                    aria-label="Close"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {task && (
                <div className="p-5 flex flex-col gap-[18px]">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em] mb-1">Deadline</div>
                            <div className="text-[13px] text-(--text-primary)">{formatDeadline(task.deadline)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em] mb-1">Estimate</div>
                            <div className="text-[13px] text-(--text-primary)">{formatEstimate(task.estimateHours)}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em] mb-2">Priority</div>
                            <div className="flex gap-2">
                                {PRIORITIES.map(p => {
                                    const active = task.priority === p;
                                    return (
                                        <button
                                            key={p}
                                            disabled={active || priorityMutation.isPending}
                                            onClick={() => changePriority(p)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium font-body border cursor-pointer ${
                                                active
                                                    ? PRIORITY_ACTIVE_STYLE[p]
                                                    : 'border-(--border-default) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover)'
                                            } disabled:cursor-default`}
                                        >
                                            <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${PRIORITY_COLOR[p]}`} />
                                            {PRIORITY_LABEL[p]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-(--border-default)" />

                    <div>
                        <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em] mb-2.5">Move to</div>
                        <div className="flex gap-2 flex-wrap">
                            {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(s => {
                                const active = task.status === s;
                                return (
                                    <button
                                        key={s}
                                        disabled={active || statusMutation.isPending}
                                        onClick={() => changeStatus(s)}
                                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium font-body border cursor-pointer ${
                                            active
                                                ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                                                : 'border-(--border-default) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover)'
                                        } disabled:cursor-default`}
                                    >
                                        {STATUS_LABEL[s]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-(--border-default)" />

                    <SubtaskList taskId={task.id} subtasks={task.subtasks} />

                    {task.description && (
                        <>
                            <div className="h-px bg-(--border-default)" />
                            <div>
                                <div className="text-[10px] text-(--text-tertiary) uppercase tracking-[0.06em] mb-2.5">Description</div>
                                <p className="text-[13px] text-(--text-primary) whitespace-pre-wrap m-0 leading-[1.5]">{task.description}</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
