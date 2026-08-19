import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type {
    ScopeItemDto,
    ScopeSummaryDto,
    CreateScopeItemRequest,
    UpdateScopeItemRequest,
} from '@/types/scopeItem';

// ['scope', projectId] is a prefix of ['scope', projectId, 'summary'], so one
// invalidation refreshes both the list and the valuation.
const scopeKey = (projectId: string) => ['scope', projectId];

function basePath(projectId: string) {
    return `/projects/${projectId}/scope-items`;
}

export function useScopeItemsQuery(projectId: string) {
    return useQuery<ScopeItemDto[]>({
        queryKey: scopeKey(projectId),
        queryFn: () => api.get<ScopeItemDto[]>(basePath(projectId)).then(r => r.data),
        enabled: !!projectId,
    });
}

export function useScopeSummaryQuery(projectId: string) {
    return useQuery<ScopeSummaryDto>({
        queryKey: [...scopeKey(projectId), 'summary'],
        queryFn: () => api.get<ScopeSummaryDto>(`${basePath(projectId)}/summary`).then(r => r.data),
        enabled: !!projectId,
    });
}

export function useCreateScopeItem(projectId: string) {
    const qc = useQueryClient();
    return useMutation<ScopeItemDto, Error, CreateScopeItemRequest>({
        mutationFn: (data) => api.post<ScopeItemDto>(basePath(projectId), data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: scopeKey(projectId) }),
    });
}

export function useUpdateScopeItem(projectId: string) {
    const qc = useQueryClient();
    return useMutation<ScopeItemDto, Error, { id: string; data: UpdateScopeItemRequest }>({
        mutationFn: ({ id, data }) =>
            api.patch<ScopeItemDto>(`${basePath(projectId)}/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: scopeKey(projectId) }),
    });
}

export function useDeleteScopeItem(projectId: string) {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(`${basePath(projectId)}/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: scopeKey(projectId) }),
    });
}
