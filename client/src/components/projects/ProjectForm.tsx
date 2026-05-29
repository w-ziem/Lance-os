import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateProject, useUpdateProject, useUpdateProjectStatus } from '@/hooks/useProject';
import { useClientsQuery } from '@/hooks/useClient';
import type { ProjectDto, ProjectStatus } from '@/types/project';
import FormField from '../common/FormField';
import SubmitButton from '../common/SubmitButton';

interface ProjectFormProps {
    project?: ProjectDto;
    onSuccess: () => void;
}

const STATUSES: ProjectStatus[] = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export default function ProjectForm({ project, onSuccess }: ProjectFormProps) {
    const { data: clients = [] } = useClientsQuery();

    const [data, setData] = useState({
        name: project?.name ?? '',
        clientId: project?.clientId ?? '',
        description: project?.description ?? '',
        status: project?.status ?? ('ACTIVE' as ProjectStatus),
        deadline: project?.deadline ?? '',
    });
    const [errors, setErrors] = useState({ name: '', clientId: '' });

    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject(project?.id ?? '');
    const statusMutation = useUpdateProjectStatus(project?.id ?? '');

    const isLoading = project
        ? updateMutation.isPending || statusMutation.isPending
        : createMutation.isPending;

    function handleChange<K extends keyof typeof data>(field: K) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setData(prev => ({ ...prev, [field]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const newErrors = { name: '', clientId: '' };
        if (!data.name.trim()) newErrors.name = 'Enter a name';
        if (!data.clientId) newErrors.clientId = 'Select a client';
        setErrors(newErrors);
        if (newErrors.name || newErrors.clientId) return;

        try {
            if (project) {
                await updateMutation.mutateAsync({
                    name: data.name,
                    clientId: data.clientId,
                    description: data.description || undefined,
                    deadline: data.deadline || undefined,
                });
                if (data.status !== project.status) {
                    await statusMutation.mutateAsync({ status: data.status });
                }
            } else {
                await createMutation.mutateAsync({
                    name: data.name,
                    clientId: data.clientId,
                    description: data.description || undefined,
                    status: data.status,
                    deadline: data.deadline || undefined,
                });
            }
            toast.success(project ? 'Project updated.' : 'Project added.');
            onSuccess();
        } catch {
            toast.error('Could not save. Try again.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Name *" name="name" value={data.name} onChange={handleChange('name')} placeholder="Brand Refresh" error={errors.name} />

            <div className="flex flex-col gap-[5px]">
                <label htmlFor="clientId" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Client *</label>
                <select
                    id="clientId"
                    value={data.clientId}
                    onChange={handleChange('clientId')}
                    className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                >
                    <option value="">— Select client —</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                {errors.clientId && <p className="text-[12px] text-(--status-error) m-0">{errors.clientId}</p>}
            </div>

            <FormField label="Deadline" name="deadline" type="date" value={data.deadline} onChange={handleChange('deadline')} />

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

            <div className="flex flex-col gap-[5px]">
                <label htmlFor="description" className="text-[12px] font-medium text-(--text-secondary) tracking-[0.01em]">Description</label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={handleChange('description')}
                    placeholder="Goals, scope, notes…"
                    rows={4}
                    className="border border-(--border-default) rounded-lg px-3 py-[10px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none resize-y focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                />
            </div>

            <SubmitButton isLoading={isLoading}>
                {project ? 'Update project' : 'Save project'}
            </SubmitButton>
        </form>
    );
}
