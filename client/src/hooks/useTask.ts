import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type {
    TaskDto,
    TaskStatus,
    CreateTaskRequest,
    UpdateTaskRequest,
    UpdateTaskStatusRequest,
} from '@/types/task';

export function useTasksQuery(projectId?: string) {
    return useQuery<TaskDto[]>({
        queryKey: projectId ? ['tasks', { projectId }] : ['tasks'],
        queryFn: () => api.get<TaskDto[]>('/tasks', {
            params: projectId ? { projectId } : {},
        }).then(r => r.data),
    });
}

export function useTaskQuery(id: string) {
    return useQuery<TaskDto>({
        queryKey: ['tasks', id],
        queryFn: () => api.get<TaskDto>(`/tasks/${id}`).then(r => r.data),
        enabled: !!id,
    });
}

export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, CreateTaskRequest>({
        mutationFn: (data) => api.post<TaskDto>('/tasks', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}

export function useUpdateTask(id: string) {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, UpdateTaskRequest>({
        mutationFn: (data) => api.put<TaskDto>(`/tasks/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}

export function useUpdateTaskStatus(id: string) {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, UpdateTaskStatusRequest>({
        mutationFn: (data) => api.patch<TaskDto>(`/tasks/${id}/status`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}

export function useUpdateAnyTaskStatus() {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, { id: string; status: TaskStatus }>({
        mutationFn: ({ id, status }) => api.patch<TaskDto>(`/tasks/${id}/status`, { status }).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}

export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}
