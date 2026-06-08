// mirrors backend DashboardSummaryDto

export interface DashboardSummaryDto {
    revenue: number;
    activeProjects: number;
    completedProjects: number;
    tasksDueToday: number;
    highPriorityDueToday: number;
    clientCount: number;
}
