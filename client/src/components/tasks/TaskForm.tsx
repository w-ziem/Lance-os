import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateTask, useUpdateTask } from '@/hooks/useTask';
import { useProjectsQuery } from '@/hooks/useProject';
import type { TaskDto, TaskPriority, TaskStatus } from '@/types/task';
import FormField from '../common/FormField';
import SubmitButton from '../common/SubmitButton';

interface TaskFormProps {
    task?: TaskDto;
    defaultProjectId?: string;
    onSuccess: () => void;
}

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskForm({ task, defaultProjectId, onSuccess }: TaskFormProps) {
    const { data: projects = [] } = useProjectsQuery();

    const [data, setData] = useState({
        title: task?.title ?? '',
        projectId: task?.projectId ?? defaultProjectId ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? ('MEDIUM' as TaskPriority),
        status: task?.status ?? ('TODO' as TaskStatus),
        deadline: task?.deadline ?? '',
        estimateHours: task?.estimateHours != null ? String(task.estimateHours) : '',
    });
    const [errors, setErrors] = useState({ title: '', projectId: '' });

    const createMutation = useCreateTask();
    const updateMutation = useUpdateTask(task?.id ?? '');
    const mutation = task?.id ? updateMutation : createMutation;

    function handleChange<K extends keyof typeof data>(field: K) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setData(prev => ({ ...prev, [field]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const newErrors = { title: '', projectId: '' };
        if (!data.title.trim()) newErrors.title = 'Enter a title';
        if (!data.projectId) newErrors.projectId = 'Select a project';
        setErrors(newErrors);
        if (newErrors.title || newErrors.projectId) return;

        const parsedHours = data.estimateHours ? Number(data.estimateHours) : undefined;
        if (parsedHours !== undefined && (!Number.isFinite(parsedHours) || parsedHours <= 0)) {
            toast.error('Estimate must be a positive number of hours.');
            return;
        }

        try {
            await mutation.mutateAsync({
                title: data.title,
                projectId: data.projectId,
                description: data.description || undefined,
                priority: data.priority,
                ...(task ? {} : { status: data.status }),
                deadline: data.deadline || undefined,
                estimateHours: parsedHours,
            });
            toast.success(task ? 'Task updated.' : 'Task added.');
            onSuccess();
        } catch {
            toast.error('Could not save. Try again.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Title *" name="title" value={data.title} onChange={handleChange('title')} placeholder="Write project brief" error={errors.title} />

            <div className="flex flex-col gap-[5px]">
                <label htmlFor="projectId" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Project *</label>
                <select
                    id="projectId"
                    value={data.projectId}
                    onChange={handleChange('projectId')}
                    className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                >
                    <option value="">— Select project —</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                {errors.projectId && <p className="text-[12px] text-(--status-error) m-0">{errors.projectId}</p>}
            </div>

            {task ? (
                <div className="flex flex-col gap-[5px]">
                    <label htmlFor="priority" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Priority</label>
                    <select
                        id="priority"
                        value={data.priority}
                        onChange={handleChange('priority')}
                        className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                    >
                        {PRIORITIES.map(p => (<option key={p} value={p}>{p.toLowerCase()}</option>))}
                    </select>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="priority" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Priority</label>
                        <select
                            id="priority"
                            value={data.priority}
                            onChange={handleChange('priority')}
                            className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                        >
                            {PRIORITIES.map(p => (<option key={p} value={p}>{p.toLowerCase()}</option>))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="status" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Status</label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={handleChange('status')}
                            className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                        >
                            {STATUSES.map(s => (<option key={s} value={s}>{s.toLowerCase().replace('_', ' ')}</option>))}
                        </select>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <FormField label="Deadline" name="deadline" type="date" value={data.deadline} onChange={handleChange('deadline')} />
                <FormField
                    label="Estimate (hours)"
                    name="estimateHours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={data.estimateHours}
                    onChange={handleChange('estimateHours')}
                    placeholder="2.5"
                />
            </div>

            <div className="flex flex-col gap-[5px]">
                <label htmlFor="description" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Description</label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={handleChange('description')}
                    placeholder="Acceptance criteria, notes…"
                    rows={4}
                    className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none resize-y focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                />
            </div>

            <SubmitButton isLoading={mutation.isPending}>
                {task ? 'Update task' : 'Save task'}
            </SubmitButton>
        </form>
    );
}
