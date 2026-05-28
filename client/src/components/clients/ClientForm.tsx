import { useCreateClient, useUpdateClient } from '@/hooks/useClient';
import type { ClientDto } from '@/types/client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import FormField from '../common/FormField';
import SubmitButton from '../common/SubmitButton';

interface ClientFormProps {
    client?: ClientDto;
    onSuccess: () => void;
}

function ClientForm({ client, onSuccess }: ClientFormProps) {
    const [data, setData] = useState({
        name: client?.name ?? '',
        email: client?.email ?? '',
        companyName: client?.companyName ?? '',
        phone: client?.phone ?? '',
        notes: client?.notes ?? '',
    });
    const [errors, setErrors] = useState({ name: '', email: '' });

    const createMutation = useCreateClient();
    const updateMutation = useUpdateClient(client?.id ?? '');
    const mutation = client?.id ? updateMutation : createMutation;

    function handleChange(field: keyof typeof data) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setData(prev => ({ ...prev, [field]: e.target.value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = { name: '', email: '' };
        if (!data.name.trim()) newErrors.name = 'Enter a name';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) newErrors.email = 'Enter a valid email';
        setErrors(newErrors);
        if (newErrors.name || newErrors.email) return;

        try {
            await mutation.mutateAsync(data);
            toast.success(client ? 'Client updated.' : 'Client added.');
            onSuccess();
        } catch {
            toast.error('Could not save. Try again.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Name *" name="name" value={data.name} onChange={handleChange('name')} placeholder="John Smith" error={errors.name} />
            <FormField label="Email *" name="email" type="email" value={data.email} onChange={handleChange('email')} placeholder="jan@example.com" error={errors.email} />
            <FormField label="Company" name="companyName" value={data.companyName} onChange={handleChange('companyName')} placeholder="Acme Sp. z o.o." />
            <FormField label="Phone" name="phone" value={data.phone} onChange={handleChange('phone')} placeholder="+48 600 000 000" />

            <div className="flex flex-col gap-[5px]">
                <label htmlFor="notes" className="text-[12px] font-medium text-text-secondary tracking-[0.01em]">
                    Notes
                </label>
                <textarea
                    id="notes"
                    value={data.notes}
                    onChange={handleChange('notes')}
                    placeholder="Additional notes..."
                    rows={4}
                    className="border border-border-default rounded-lg px-3 py-[10px] text-[13px] font-body text-text-primary bg-surface outline-none resize-y transition-[border,box-shadow] duration-[140ms] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.13)]"
                />
            </div>

            <SubmitButton isLoading={mutation.isPending}>
                {client ? 'Update client' : 'Save client'}
            </SubmitButton>
        </form>
    );
}

export default ClientForm;
