// mirrors backend Schedule dtos.

import type { TaskDto } from '@/types/task';

export interface ScheduleConfigDto {
    workStartHour: number;
    workEndHour: number;
    slotMinutes: number;
}

export interface ScheduleViewRequest {
    startDate: string; // ISO-8601 Instant
    endDate: string;
}

export interface ScheduleViewDto {
    scheduled: TaskDto[];
    unscheduled: TaskDto[];
    config: ScheduleConfigDto;
}

export interface ScheduleTaskRequest {
    startDate: string;
    endDate: string;
}

export interface UpdateTaskLockRequest {
    locked: boolean;
}
