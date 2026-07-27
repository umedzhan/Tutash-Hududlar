import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { AppUser, Company } from '../types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => (await apiClient.get<AppUser[]>('/users')).data,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; phone: string; password: string; role: string; companyId?: string }) =>
      (await apiClient.post('/users', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await apiClient.get<Company[]>('/companies')).data,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; stir: string; director: string; phone: string }) =>
      (await apiClient.post<Company>('/companies', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}
