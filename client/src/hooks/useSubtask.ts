import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { SubtaskDto, CreateSubtaskRequest, UpdateSubtaskRequest } from '@/types/task';
import { invalidateTaskCaches } from '@/hooks/useTask';

export function useCreateSubtask(taskId: string) {
    const qc = useQueryClient();
    return useMutation<SubtaskDto, Error, CreateSubtaskRequest>({
        mutationFn: (data) =>
            api.post<SubtaskDto>(`/tasks/${taskId}/subtasks`, data).then(r => r.data),
        onSuccess: () => invalidateTaskCaches(qc),
    });
}

export function useUpdateSubtask(taskId: string) {
    const qc = useQueryClient();
    return useMutation<SubtaskDto, Error, { id: string; data: UpdateSubtaskRequest }>({
        mutationFn: ({ id, data }) =>
            api.patch<SubtaskDto>(`/tasks/${taskId}/subtasks/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateTaskCaches(qc),
    });
}

export function useDeleteSubtask(taskId: string) {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) =>
            api.delete(`/tasks/${taskId}/subtasks/${id}`).then(r => r.data),
        onSuccess: () => invalidateTaskCaches(qc),
    });
}
