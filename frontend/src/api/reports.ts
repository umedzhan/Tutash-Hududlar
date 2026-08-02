import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  ApplicationFunnelResult,
  DashboardFilter,
  DashboardSummary,
  DistrictRankingResult,
  ExpiringContract,
  MyDashboardSummary,
  PaymentTrendResult,
} from '../types';

function filterParams(filter?: DashboardFilter) {
  if (!filter) return {};
  if (filter.zoneId) return { zoneId: filter.zoneId };
  if (filter.districtId) return { districtId: filter.districtId };
  return {};
}

export function useDashboardSummary(filter?: DashboardFilter) {
  return useQuery({
    queryKey: ['reports', 'dashboard', filter],
    queryFn: async () => (await apiClient.get<DashboardSummary>('/reports/dashboard', { params: filterParams(filter) })).data,
  });
}

export function useMyDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'my-dashboard'],
    queryFn: async () => (await apiClient.get<MyDashboardSummary>('/reports/my-dashboard')).data,
  });
}

export function useApplicationFunnel(filter?: DashboardFilter) {
  return useQuery({
    queryKey: ['reports', 'application-funnel', filter],
    queryFn: async () =>
      (await apiClient.get<ApplicationFunnelResult>('/reports/application-funnel', { params: filterParams(filter) })).data,
  });
}

export function usePaymentTrend(filter?: DashboardFilter) {
  return useQuery({
    queryKey: ['reports', 'payment-trend', filter],
    queryFn: async () => (await apiClient.get<PaymentTrendResult>('/reports/payment-trend', { params: filterParams(filter) })).data,
  });
}

export function useExpiringContracts(filter?: DashboardFilter, range?: 30 | 60 | 90) {
  return useQuery({
    queryKey: ['reports', 'expiring-contracts', filter, range],
    queryFn: async () =>
      (
        await apiClient.get<ExpiringContract[]>('/reports/expiring-contracts', {
          params: { ...filterParams(filter), ...(range ? { range } : {}) },
        })
      ).data,
  });
}

export function useDistrictRanking() {
  return useQuery({
    queryKey: ['reports', 'district-ranking'],
    queryFn: async () => (await apiClient.get<DistrictRankingResult>('/reports/district-ranking')).data,
  });
}
