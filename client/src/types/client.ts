// mirrors backend Client dtos api.dto.client.

export interface ClientDto {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    phone: string;
    notes?: string;
    createdAt: string;
}

export interface ClientDetailDto extends ClientDto {
    activeProjects: number;
    completedProjects: number;
    revenue: number;
    projectedRevenue: number;
}

export interface CreateClientRequest {
    name: string;
    email: string;
    companyName?: string;
    phone?: string;
    notes?: string;
}

export type UpdateClientRequest = CreateClientRequest;
