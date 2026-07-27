import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { DashboardSummary, MyDashboardSummary } from '../types';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => (await apiClient.get<DashboardSummary>('/reports/dashboard')).data,
  });
}

export function useMyDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'my-dashboard'],
    queryFn: async () => (await apiClient.get<MyDashboardSummary>('/reports/my-dashboard')).data,
  });
}
