import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Payment } from '../types';

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => (await apiClient.get<Payment[]>('/payments')).data,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: async () =>
      (await apiClient.get<{ kutilayotgan: number; undirilgan: number; qarzdorlik: number }>('/payments/stats')).data,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contractId: string; amount: number; dueDate: string; method?: string }) =>
      (await apiClient.post('/payments', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Payment>(`/payments/${id}/mark-paid`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
