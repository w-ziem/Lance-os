import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { ClientDto, CreateClientRequest, UpdateClientRequest } from '@/types/client';

export function useClientsQuery() {
    return useQuery<ClientDto[]>({
        queryKey: ['clients'],
        queryFn: () => api.get<ClientDto[]>('/clients').then(r => r.data),
    });
}

export function useClientQuery(id: string) {
    return useQuery<ClientDto>({
        queryKey: ['clients', id],
        queryFn: () => api.get<ClientDto>(`/clients/${id}`).then(r => r.data),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const qc = useQueryClient();
    return useMutation<ClientDto, Error, CreateClientRequest>({
        mutationFn: (data) => api.post<ClientDto>('/clients', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}

export function useUpdateClient(id: string) {
    const qc = useQueryClient();
    return useMutation<ClientDto, Error, UpdateClientRequest>({
        mutationFn: (data) => api.put<ClientDto>(`/clients/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}

export function useDeleteClient() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(`/clients/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
    });
}
