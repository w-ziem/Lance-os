// mirrors backend Project dtos api.dto.project.

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface ProjectDto {
    id: string;
    clientId: string;
    name: string;
    description: string;
    status: ProjectStatus;
    deadline: string; // LocalDate: YYYY-MM-DD
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    name: string;
    clientId: string;
    description?: string;
    status?: ProjectStatus;
    deadline?: string; // LocalDate: YYYY-MM-DD
}

export interface UpdateProjectRequest {
    name: string;
    clientId: string;
    description?: string;
    deadline?: string; // LocalDate: YYYY-MM-DD
}

export interface UpdateProjectStatusRequest {
    status: ProjectStatus;
}
