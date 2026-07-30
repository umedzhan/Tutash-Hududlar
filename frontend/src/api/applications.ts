import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Application, PriceBreakdown, Stage } from '../types';

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => (await apiClient.get<Application[]>('/applications')).data,
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => (await apiClient.get<Application>(`/applications/${id}`)).data,
    enabled: Boolean(id),
  });
}

export interface GeometryInput {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface PreviewApplicationPayload {
  geometry: GeometryInput;
  districtId: string;
  purposeId: string;
  zoneId: string;
  usageType: string;
  period: { from: string; to: string };
}

export interface PreviewApplicationResult {
  areaM2: number;
  price: PriceBreakdown;
}

export function usePreviewApplication() {
  return useMutation({
    mutationFn: async (payload: PreviewApplicationPayload) =>
      (await apiClient.post<PreviewApplicationResult>('/applications/preview', payload)).data,
  });
}

export interface ApplicationPhotos {
  shimol: File;
  janub: File;
  sharq: File;
  gharb: File;
}

export interface CreateApplicationPayload {
  geometry: GeometryInput;
  districtId: string;
  purposeId: string;
  zoneId: string;
  purpose: string;
  usageType: string;
  period: { from: string; to: string };
  comment?: string;
  photos: ApplicationPhotos;
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ photos, ...payload }: CreateApplicationPayload) => {
      const formData = new FormData();
      formData.append('geometry', JSON.stringify(payload.geometry));
      formData.append('districtId', payload.districtId);
      formData.append('purposeId', payload.purposeId);
      formData.append('zoneId', payload.zoneId);
      formData.append('purpose', payload.purpose);
      formData.append('usageType', payload.usageType);
      formData.append('period', JSON.stringify(payload.period));
      formData.append('comment', payload.comment ?? '');
      formData.append('shimol', photos.shimol);
      formData.append('janub', photos.janub);
      formData.append('sharq', photos.sharq);
      formData.append('gharb', photos.gharb);
      return (await apiClient.post<Application>('/applications', formData)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}

export interface DecideStagePayload {
  id: string;
  stage: Stage;
  decision: 'approve' | 'approve_with_changes' | 'reject' | 'request_info';
  note: string;
  geometry?: GeometryInput;
}

export function useDecideStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, ...body }: DecideStagePayload) =>
      (await apiClient.post<Application>(`/applications/${id}/stages/${stage}/decide`, body)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}

export function useGeometryConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept, note }: { id: string; accept: boolean; note?: string }) =>
      (await apiClient.post<Application>(`/applications/${id}/geometry-consent`, { accept, note })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}

export function useProvideInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) =>
      (await apiClient.post<Application>(`/applications/${id}/provide-info`, { comment })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
