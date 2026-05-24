import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { ClientDto, CreateClientRequest, UpdateClientRequest } from '@/types/client';

export function useClientsQuery() {
    return useQuery<ClientDto[]>({
        queryKey: ['clients'],
        queryFn: () => api.get<ClientDto[]>('/api/clients').then(r => r.data),
    });
}

export function useClientQuery(id: string) {
    return useQuery<ClientDto>({
        queryKey: ['clients', id],
        queryFn: () => api.get<ClientDto>(`/api/clients/${id}`).then(r => r.data),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const qc = useQueryClient();
    return useMutation<ClientDto, Error, CreateClientRequest>({
        mutationFn: (data) => api.post<ClientDto>('/api/clients', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}

export function useUpdateClient(id: string) {
    const qc = useQueryClient();
    return useMutation<ClientDto, Error, UpdateClientRequest>({
        mutationFn: (data) => api.put<ClientDto>(`/api/clients/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}

export function useDeleteClient() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(`/api/clients/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}
