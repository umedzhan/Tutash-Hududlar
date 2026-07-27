import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Region } from '../types';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => (await apiClient.get<Region[]>('/regions')).data,
  });
}

export function useMyRegions() {
  return useQuery({
    queryKey: ['regions', 'mine'],
    queryFn: async () => (await apiClient.get<Region[]>('/regions/mine')).data,
  });
}

export function useRegionStats() {
  return useQuery({
    queryKey: ['regions', 'stats'],
    queryFn: async () =>
      (await apiClient.get<{ jami: number; band: number; bosh: number; muammoli: number }>('/regions/stats')).data,
  });
}

export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Region>) => (await apiClient.post<Region>('/regions', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
  });
}
