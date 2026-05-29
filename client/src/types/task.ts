// mirrors backend Task + Subtask dtos.

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SubtaskDto {
    id: string;
    label: string;
    done: boolean;
    position: number;
}

export interface CreateSubtaskRequest {
    label: string;
}

export interface UpdateSubtaskRequest {
    label?: string;
    done?: boolean;
}

export interface TaskDto {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadline: string;              // LocalDate: YYYY-MM-DD
    estimateHours: number | null;
    subtasks: SubtaskDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    title: string;
    projectId: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    deadline?: string;
    estimateHours?: number;
}

export interface UpdateTaskRequest {
    title: string;
    projectId: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: string;
    estimateHours?: number;
}

export interface UpdateTaskStatusRequest {
    status: TaskStatus;
}
