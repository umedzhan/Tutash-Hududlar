import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { RestrictedArea, RestrictedAreaType } from '../types';

export function useRestrictedAreas() {
  return useQuery({
    queryKey: ['restricted-areas'],
    queryFn: async () => (await apiClient.get<RestrictedArea[]>('/restricted-areas')).data,
  });
}

export interface CreateRestrictedAreaPayload {
  type: RestrictedAreaType;
  name: string;
  geometry: { type: 'Polygon'; coordinates: number[][][] };
}

export function useCreateRestrictedArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRestrictedAreaPayload) =>
      (await apiClient.post<RestrictedArea>('/restricted-areas', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restricted-areas'] }),
  });
}

export function useDeleteRestrictedArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/restricted-areas/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restricted-areas'] }),
  });
}
