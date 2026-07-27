import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { District, Purpose, Tariff, Zone } from '../types';

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => (await apiClient.get<District[]>('/references/districts')).data,
  });
}

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => (await apiClient.get<Zone[]>('/references/zones')).data,
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
