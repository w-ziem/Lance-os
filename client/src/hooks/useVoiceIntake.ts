import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import api from '@/services/api';
import type { VoiceIntakeResultDto } from '@/types/ai';

export function useVoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const start = async () => {
        setAudioBlob(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            setAudioBlob(blob);
            stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setIsRecording(true);
    };

    const stop = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const reset = () => setAudioBlob(null);

    return { isRecording, audioBlob, start, stop, reset };
}

export function useVoiceIntakeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (blob: Blob) => {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            const res = await api.post<VoiceIntakeResultDto>('/ai/voice-intake', formData, {
                headers: { 'Content-Type': undefined },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
    });
}
