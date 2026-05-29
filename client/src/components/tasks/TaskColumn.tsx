import type { ReactNode } from 'react';

interface TaskColumnProps {
    title: string;
    count: number;
    dotColor: string;     // tailwind color class, e.g. 'bg-(--status-success)'
    children: ReactNode;
}

export default function TaskColumn({ title, count, dotColor, children }: TaskColumnProps) {
    return (
        <div>
            <div className="flex items-center gap-[7px] mb-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-(--text-tertiary)">{title}</span>
                <span className="bg-(--bg-secondary) text-(--text-tertiary) rounded-full px-[7px] py-px text-[10px] border border-(--border-default)">
                    {count}
                </span>
            </div>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}
