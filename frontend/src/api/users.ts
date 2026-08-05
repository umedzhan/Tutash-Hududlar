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
      (await apiClient.post<Company>('/companies', { ...payload, phones: [payload.phone] })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: ['companies', 'me'],
    queryFn: async () => (await apiClient.get<Company>('/companies/me')).data,
  });
}

export interface UpdateMyCompanyPayload {
  name: string;
  stir: string;
  director: string;
  phones: string[];
  email: string;
  districtId: string;
  zoneId: string;
  address: string;
  cadastreNumber?: string;
  registrationDocument?: File | null;
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateMyCompanyPayload) => {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('stir', payload.stir);
      formData.append('director', payload.director);
      formData.append('phones', JSON.stringify(payload.phones));
      formData.append('email', payload.email);
      formData.append('districtId', payload.districtId);
      formData.append('zoneId', payload.zoneId);
      formData.append('address', payload.address);
      formData.append('cadastreNumber', payload.cadastreNumber ?? '');
      if (payload.registrationDocument) {
        formData.append('registrationDocument', payload.registrationDocument);
      }
      return (await apiClient.patch<Company>('/companies/me', formData)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies', 'me'] }),
  });
}
