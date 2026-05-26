import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { ProjectDto, CreateProjectRequest, UpdateProjectRequest, UpdateProjectStatusRequest } from '@/types/project';

export function useProjectsQuery(clientId?: string) {
    return useQuery<ProjectDto[]>({
        queryKey: clientId ? ['projects', { clientId }] : ['projects'],
        queryFn: () => api.get<ProjectDto[]>('/projects', { params: clientId ? { clientId } : {} }).then(r => r.data),
    });
}

export function useProjectQuery(id: string) {
    return useQuery<ProjectDto>({
        queryKey: ['projects', id],
        queryFn: () => api.get<ProjectDto>(`/projects/${id}`).then(r => r.data),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation<ProjectDto, Error, CreateProjectRequest>({
        mutationFn: (data) => api.post<ProjectDto>('/projects', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    });
}

export function useUpdateProject(id: string) {
    const qc = useQueryClient();
    return useMutation<ProjectDto, Error, UpdateProjectRequest>({
        mutationFn: (data) => api.put<ProjectDto>(`/projects/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    });
}

export function useUpdateProjectStatus(id: string) {
    const qc = useQueryClient();
    return useMutation<ProjectDto, Error, UpdateProjectStatusRequest>({
        mutationFn: (data) => api.patch<ProjectDto>(`/projects/${id}/status`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(`/projects/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    });
}
