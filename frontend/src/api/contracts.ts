import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Contract } from '../types';

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => (await apiClient.get<Contract[]>('/contracts')).data,
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Contract>(`/contracts/${id}/sign`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}
