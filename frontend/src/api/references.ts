import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { District, Purpose, Tariff, Zone } from '../types';

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => (await apiClient.get<District[]>('/references/districts')).data,
  });
}

export function useZones(districtId?: string) {
  return useQuery({
    queryKey: ['zones', districtId],
    queryFn: async () => (await apiClient.get<Zone[]>('/references/zones', { params: districtId ? { districtId } : {} })).data,
    enabled: districtId === undefined || Boolean(districtId),
  });
}

export function usePurposes() {
  return useQuery({
    queryKey: ['purposes'],
    queryFn: async () => (await apiClient.get<Purpose[]>('/references/purposes')).data,
  });
}

export function useTariff() {
  return useQuery({
    queryKey: ['tariff'],
    queryFn: async () => (await apiClient.get<Tariff>('/references/tariff')).data,
  });
}

export function useUpdateTariff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Pick<Tariff, 'baseRate' | 'seasonalCoefficient' | 'penaltyRatePerDay' | 'penaltyCapPercent' | 'minAreaM2' | 'maxAreaM2'>>) =>
      (await apiClient.patch<Tariff>('/references/tariff', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tariff'] }),
  });
}
