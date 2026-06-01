import { useDroppable } from '@dnd-kit/core';
import type { TaskDto } from '@/types/task';
import TaskBlock from './TaskBlock';

interface UnscheduledListProps {
    tasks: TaskDto[];
    onTaskClick: (task: TaskDto) => void;
}

export default function UnscheduledList({ tasks, onTaskClick }: UnscheduledListProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'unscheduled',
        data: { type: 'unscheduled' },
    });

    return (
        <aside className="w-[240px] shrink-0 flex flex-col border-l border-(--border-default) bg-(--surface)">
            <div className="px-4 py-3 border-b border-(--border-default)">
                <div className="text-[10px] uppercase tracking-[0.08em] text-(--text-tertiary) font-semibold">
                    Unscheduled
                </div>
                <div className="text-[11px] text-(--text-tertiary) mt-0.5">
                    {tasks.length} task{tasks.length === 1 ? '' : 's'}
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2 transition-colors ${
                    isOver ? 'bg-(--accent-tint)' : ''
                }`}
            >
                {tasks.length === 0 && (
                    <p className="text-[12px] text-(--text-tertiary) text-center py-4">
                        Nothing here.
                    </p>
                )}
                {tasks.map(task => (
                    <TaskBlock
                        key={task.id}
                        task={task}
                        compact
                        onClick={() => onTaskClick(task)}
                    />
                ))}
            </div>
        </aside>
    );
}
