import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { DashboardSummaryDto } from '@/types/dashboard';

export function useDashboardSummaryQuery() {
    return useQuery<DashboardSummaryDto>({
        queryKey: ['dashboard', 'summary'],
        queryFn: () => api.get<DashboardSummaryDto>('/dashboard/summary').then(r => r.data),
    });
}
