import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { TaskDto } from '@/types/task';
import type {
    ScheduleConfigDto,
    ScheduleTaskRequest,
    ScheduleViewDto,
    ScheduleViewRequest,
    UpdateTaskLockRequest,
} from '@/types/schedule';

export function useScheduleViewQuery(range: ScheduleViewRequest) {
    return useQuery<ScheduleViewDto>({
        queryKey: ['schedule', range.startDate, range.endDate],
        queryFn: () => api.post<ScheduleViewDto>('/tasks/schedule/view', range).then(r => r.data),
    });
}

export function useScheduleConfigQuery() {
    return useQuery<ScheduleConfigDto>({
        queryKey: ['schedule', 'config'],
        queryFn: () => api.get<ScheduleConfigDto>('/tasks/schedule/config').then(r => r.data),
        staleTime: 60 * 60 * 1000,
    });
}

export function useScheduleTask() {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, { id: string; data: ScheduleTaskRequest }>({
        mutationFn: ({ id, data }) =>
            api.patch<TaskDto>(`/tasks/schedule/${id}`, data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['schedule'] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUnscheduleTask() {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, string>({
        mutationFn: (id) => api.delete<TaskDto>(`/tasks/schedule/${id}`).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['schedule'] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useToggleTaskLock() {
    const qc = useQueryClient();
    return useMutation<TaskDto, Error, { id: string; data: UpdateTaskLockRequest }>({
        mutationFn: ({ id, data }) =>
            api.patch<TaskDto>(`/tasks/schedule/${id}/lock`, data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['schedule'] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}
