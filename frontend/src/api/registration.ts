import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { District, Zone } from '../types';

export interface RegistrationRequestPayload {
  companyName: string;
  stir: string;
  director: string;
  phone: string;
  email: string;
  password: string;
  districtId?: string;
  zoneId?: string;
  address?: string;
  cadastreNumber?: string;
}

export function useSubmitRegistrationRequest() {
  return useMutation({
    mutationFn: async (payload: RegistrationRequestPayload) =>
      (await apiClient.post<{ id: string; message: string }>('/registration-requests', payload)).data,
  });
}

export type RegistrationRequestStatus = 'kutilmoqda' | 'tasdiqlangan' | 'rad_etilgan';

export interface RegistrationRequest {
  _id: string;
  companyName: string;
  stir: string;
  director: string;
  phone: string;
  email: string;
  districtId: District | string | null;
  zoneId: Zone | string | null;
  address: string;
  cadastreNumber: string;
  status: RegistrationRequestStatus;
  rejectionReason: string;
  reviewedBy: { _id: string; name: string } | null;
  reviewedAt: string | null;
  createdAt: string;
}

export function useRegistrationRequests(status?: RegistrationRequestStatus) {
  return useQuery({
    queryKey: ['registrationRequests', status],
    queryFn: async () =>
      (await apiClient.get<RegistrationRequest[]>('/registration-requests', { params: status ? { status } : {} })).data,
  });
}

export function useApproveRegistrationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post(`/registration-requests/${id}/approve`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrationRequests'] }),
  });
}

export function useRejectRegistrationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      (await apiClient.post(`/registration-requests/${id}/reject`, { reason })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrationRequests'] }),
  });
}
