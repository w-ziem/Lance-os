import { useCreateClient, useUpdateClient } from '@/hooks/useClient';
import type { ClientDto } from '@/types/client';
import React, { useState } from 'react'
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

    //hooks outside ternary
    const createMutation = useCreateClient();
    const updateMutation = useUpdateClient(client?.id ?? '');
    const mutation = client?.id ? updateMutation : createMutation;

    function handleChange(field: keyof typeof data) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setData(prev => ({ ...prev, [field]: e.target.value }));
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = { name: '', email: '' };
        if (!data.name.trim()) newErrors.name = 'Enter a name';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) newErrors.email = 'Enter a valid email';
        setErrors(newErrors);
        if (newErrors.name || newErrors.email) return;

        try {
            await mutation.mutateAsync(data);
            onSuccess();
        } catch {
            // error is stored on mutation.isError / mutation.error by react-query
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField
                label="Name *"
                name="name"
                value={data.name}
                onChange={handleChange('name')}
                placeholder="John Smith"
                error={errors.name}
            />
            <FormField
                label="Email *"
                name="email"
                type="email"
                value={data.email}
                onChange={handleChange('email')}
                placeholder="jan@example.com"
                error={errors.email}
            />
            <FormField
                label="Company"
                name="companyName"
                value={data.companyName}
                onChange={handleChange('companyName')}
                placeholder="Acme Sp. z o.o."
            />
            <FormField
                label="Phone"
                name="phone"
                value={data.phone}
                onChange={handleChange('phone')}
                placeholder="+48 600 000 000"
            />

            {/* FormField wraps <input> only, so textarea is styled manually to match */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label
                    htmlFor="notes"
                    style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}
                >
                    Notes
                </label>
                <textarea
                    id="notes"
                    value={data.notes}
                    onChange={handleChange('notes')}
                    placeholder="Dodatkowe informacje..."
                    rows={4}
                    style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--text-primary)',
                        background: 'var(--surface)',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'border 0.14s ease',
                    }}
                />
            </div>

            {mutation.isError && (
                <p style={{ fontSize: 12, color: 'var(--status-error)', margin: 0 }}>
                    Could not save. Try again.
                </p>
            )}

            <SubmitButton isLoading={mutation.isPending}>
                {client ? 'Update client' : 'Save client'}
            </SubmitButton>
        </form>
    );
}

export default ClientForm;
