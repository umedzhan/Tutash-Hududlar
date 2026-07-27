import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { MonitoringRecord } from '../types';

export function useMonitoring() {
  return useQuery({
    queryKey: ['monitoring'],
    queryFn: async () => (await apiClient.get<MonitoringRecord[]>('/monitoring')).data,
  });
}

export function useCreateMonitoring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { hududId: string; contractId: string; inspectionDate: string; status: string; notes?: string }) =>
      (await apiClient.post<MonitoringRecord>('/monitoring', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitoring'] }),
  });
}
