import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Action {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    aiStub?: boolean;
}

function PlusIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function SparkleIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
    );
}

export default function QuickActions() {
    const navigate = useNavigate();

    const actions: Action[] = [
        {
            label: 'Add client',
            icon: <PlusIcon />,
            onClick: () => navigate('/clients', { state: { openCreate: true } }),
        },
        {
            label: 'Add project',
            icon: <PlusIcon />,
            onClick: () => navigate('/projects', { state: { openCreate: true } }),
        },
        {
            label: 'Add task',
            icon: <PlusIcon />,
            onClick: () => navigate('/tasks', { state: { openCreate: true } }),
        },
        {
            label: 'Schedule',
            icon: <CalendarIcon />,
            onClick: () => navigate('/calendar'),
        },
        {
            label: 'AI: plan my week',
            icon: <SparkleIcon />,
            onClick: () => {},
            disabled: true,
            aiStub: true,
        },
        {
            label: 'AI: suggest tasks',
            icon: <SparkleIcon />,
            onClick: () => {},
            disabled: true,
            aiStub: true,
        },
    ];

    return (
        <div className="flex gap-2.5 flex-wrap">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium border transition-all duration-150 ${
                        action.disabled
                            ? 'bg-(--bg-secondary) text-(--text-tertiary) border-(--border-default) cursor-not-allowed opacity-60'
                            : 'bg-(--surface) text-(--text-primary) border-(--border-default) cursor-pointer hover:border-(--border-strong) hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                    }`}
                >
                    {action.icon}
                    {action.label}
                    {action.aiStub && (
                        <span className="text-[9px] font-semibold text-(--text-tertiary) bg-(--bg-secondary) border border-(--border-default) rounded-full px-1.5 py-0.5 uppercase tracking-wider">
                            Soon
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
