import { useState } from 'react';
import VoiceIntakeModal from './VoiceIntakeModal';

interface Props {
    variant?: 'accent' | 'outline';
}

function MicIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
}

export default function VoiceIntakeButton({ variant = 'outline' }: Props) {
    const [open, setOpen] = useState(false);

    const cls = variant === 'accent'
        ? 'bg-(--accent) text-white border-none shadow-[rgba(79,70,229,0.27)_0_2px_12px] hover:opacity-90'
        : 'bg-(--surface) text-(--text-primary) border-(--border-default) hover:border-(--border-strong) hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]';

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={`flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${cls}`}
            >
                <MicIcon />
                Voice intake
            </button>
            <VoiceIntakeModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
