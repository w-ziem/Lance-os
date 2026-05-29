interface ProgressBarProps {
    value: number;       // 0-100
    colorVar?: string;   // CSS variable name, defaults to '--accent'
}

export default function ProgressBar({ value, colorVar = '--accent' }: ProgressBarProps) {
    const clamped = Math.max(0, Math.min(100, value));
    return (
        <div className="h-[3px] bg-(--bg-secondary) rounded-sm overflow-hidden">
            <div
                className="h-full rounded-sm transition-[width] duration-300 ease-out"
                style={{ width: `${clamped}%`, background: `var(${colorVar})` }}
            />
        </div>
    );
}
