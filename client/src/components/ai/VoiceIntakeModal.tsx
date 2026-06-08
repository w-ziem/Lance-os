import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceRecorder, useVoiceIntakeMutation } from '@/hooks/useVoiceIntake';
import type { VoiceIntakeResultDto } from '@/types/ai';

type ModalState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

interface Props {
    open: boolean;
    onClose: () => void;
}

function MicIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
}

function Spinner() {
    return <div className="w-10 h-10 rounded-full border-2 border-(--border-default) border-t-(--accent) animate-spin" />;
}

function fmt(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-[13px]">
            <span className="text-(--text-tertiary)">{label}</span>
            <span className="text-(--text-primary) font-medium">{value}</span>
        </div>
    );
}

export default function VoiceIntakeModal({ open, onClose }: Props) {
    const navigate = useNavigate();
    const [modalState, setModalState] = useState<ModalState>('idle');
    const [result, setResult] = useState<VoiceIntakeResultDto | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [seconds, setSeconds] = useState(0);
    const submittingRef = useRef(false);

    const { isRecording, audioBlob, start, stop, reset } = useVoiceRecorder();
    const mutation = useVoiceIntakeMutation();

    // Recording timer
    useEffect(() => {
        if (!isRecording) { setSeconds(0); return; }
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [isRecording]);

    // Auto-submit once recording stops and blob is ready
    useEffect(() => {
        if (!audioBlob || submittingRef.current) return;
        submittingRef.current = true;
        setModalState('processing');
        mutation.mutate(audioBlob, {
            onSuccess: data => { setResult(data); setModalState('success'); },
            onError: () => {
                setErrorMsg('Transcription failed. Check your microphone and try again.');
                setModalState('error');
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioBlob]);

    // Clean up when the modal closes
    useEffect(() => {
        if (!open) {
            setModalState('idle');
            setResult(null);
            setErrorMsg('');
            submittingRef.current = false;
            reset();
        }
    }, [open, reset]);

    async function handleStart() {
        try {
            await start();
            setModalState('recording');
        } catch {
            setErrorMsg('Microphone access denied. Allow access in your browser settings and try again.');
            setModalState('error');
        }
    }

    function handleStop() {
        stop();
    }

    function handleRetry() {
        submittingRef.current = false;
        reset();
        setErrorMsg('');
        setModalState('idle');
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={modalState === 'idle' ? onClose : undefined}
            />
            <div className="relative bg-(--surface) border border-(--border-default) rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] w-[400px] p-8 flex flex-col items-center gap-6">

                {(modalState === 'idle' || modalState === 'error') && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                {modalState === 'idle' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-(--bg-secondary) border border-(--border-default) flex items-center justify-center text-(--text-secondary)">
                            <MicIcon size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-display font-bold text-[18px] text-(--text-primary) tracking-[-0.02em]">
                                Voice client intake
                            </p>
                            <p className="text-[13px] text-(--text-tertiary) mt-1.5 leading-relaxed">
                                Describe your new client: name, company, budget, and the work you'll do for them.
                            </p>
                        </div>
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 bg-(--accent) text-white rounded-full px-6 py-3 text-[14px] font-semibold shadow-[rgba(79,70,229,0.27)_0_2px_12px] hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <MicIcon size={16} />
                            Start recording
                        </button>
                    </>
                )}

                {modalState === 'recording' && (
                    <>
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-(--accent) opacity-20 animate-ping" />
                            <div className="w-16 h-16 rounded-full bg-(--accent) flex items-center justify-center text-white">
                                <MicIcon size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-display font-bold text-[18px] text-(--text-primary)">Recording…</p>
                            <p className="text-[28px] font-mono text-(--accent) mt-1 tabular-nums">{fmt(seconds)}</p>
                            <p className="text-[12px] text-(--text-tertiary) mt-1">Speak clearly about your new client</p>
                        </div>
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 bg-(--status-error) text-white rounded-full px-6 py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                            Stop
                        </button>
                    </>
                )}

                {modalState === 'processing' && (
                    <>
                        <Spinner />
                        <div className="text-center">
                            <p className="font-display font-bold text-[18px] text-(--text-primary)">Processing…</p>
                            <p className="text-[13px] text-(--text-tertiary) mt-1.5">Transcribing and extracting client data</p>
                        </div>
                    </>
                )}

                {modalState === 'success' && result && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-(--status-success)/15 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-(--status-success)">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="text-center w-full">
                            <p className="font-display font-bold text-[18px] text-(--text-primary)">Client created!</p>
                            <div className="mt-4 bg-(--bg-secondary) rounded-xl p-4 text-left space-y-2.5">
                                <Row label="Client" value={result.client.name} />
                                <Row label="Project" value={result.project.name} />
                                <Row label="Tasks" value={`${result.tasks.length} created`} />
                            </div>
                            {result.client.notes?.includes('Email not captured') && (
                                <p className="text-[12px] text-(--text-tertiary) mt-3">
                                    Email was not mentioned — remember to update the client record.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-(--border-default) text-[13px] font-medium text-(--text-secondary) hover:border-(--border-strong) transition-colors cursor-pointer"
                            >
                                Done
                            </button>
                            <button
                                onClick={() => { navigate('/clients'); onClose(); }}
                                className="flex-1 py-2.5 rounded-lg bg-(--accent) text-white text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                View clients
                            </button>
                        </div>
                    </>
                )}

                {modalState === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-(--status-error)/15 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-(--status-error)">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="font-display font-bold text-[18px] text-(--text-primary)">Something went wrong</p>
                            <p className="text-[13px] text-(--text-tertiary) mt-1.5">{errorMsg}</p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 bg-(--accent) text-white rounded-full px-6 py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Try again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
