import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { AuthUser, UpdateHourlyRateRequest } from '@/types/auth';

export function useMeQuery() {
    return useQuery<AuthUser>({
        queryKey: ['me'],
        queryFn: () => api.get<AuthUser>('/auth/me').then(r => r.data),
    });
}

export function useUpdateHourlyRate() {
    const qc = useQueryClient();
    return useMutation<AuthUser, Error, UpdateHourlyRateRequest>({
        mutationFn: (data) => api.patch<AuthUser>('/auth/me/hourly-rate', data).then(r => r.data),
        // Every scope valuation is hours x this rate, so all of them go stale at once.
        onSuccess: () => Promise.all([
            qc.invalidateQueries({ queryKey: ['me'] }),
            qc.invalidateQueries({ queryKey: ['scope'] }),
        ]),
    });
}
