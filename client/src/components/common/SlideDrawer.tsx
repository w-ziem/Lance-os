import React, { type ReactNode } from 'react'


interface SlideDrawerProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

export default function SlideDrawer({ open, title, onClose, children }: SlideDrawerProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="w-[380px] shrink-0 h-screen bg-surface border-l border-border-default shadow-[-6px_0_24px_rgba(0,0,0,0.07)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
                    {title}
                </span>
                <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border-default bg-bg-secondary hover:bg-border-default transition-colors cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {children}
            </div>

        </div>
    );
}

