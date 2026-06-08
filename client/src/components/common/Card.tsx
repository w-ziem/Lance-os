import type { ReactNode } from 'react';

interface CardProps {
    title: string;
    badge?: string;
    action?: string;
    onAction?: () => void;
    children: ReactNode;
}

export default function Card({ title, badge, action, onAction, children }: CardProps) {
    return (
        <div className="bg-(--surface) border border-(--border-default) rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-[18px] pt-[12px] pb-[10px] border-b border-(--border-default)">
                <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-[13px] text-(--text-primary)">{title}</span>
                    {badge && (
                        <span className="text-[10px] font-semibold text-(--agent) bg-(--agent-tint) border border-(--agent-border) rounded-full px-[7px] py-[1px] uppercase tracking-[0.04em]">
                            {badge}
                        </span>
                    )}
                </div>
                {action && (
                    <button
                        onClick={onAction}
                        className="text-[11px] text-(--accent) font-medium cursor-pointer bg-transparent border-none p-0 hover:opacity-80"
                    >
                        {action}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}
