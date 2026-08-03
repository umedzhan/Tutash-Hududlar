import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { downloadFile, excelFilename, wordFilename } from '../lib/download';
import type { InspectionModule, LandViolation, ViolationStatus } from '../types';

export function useViolations(filter?: { status?: ViolationStatus; module?: InspectionModule }) {
  return useQuery({
    queryKey: ['violations', filter],
    queryFn: async () => (await apiClient.get<LandViolation[]>('/violations', { params: filter })).data,
  });
}

export interface CreateViolationPayload {
  module: InspectionModule;
  inspectionId?: string;
  address: string;
  lat?: number;
  lng?: number;
  areaM2?: number;
  districtId?: string;
  detectedDate: string;
  description?: string;
  files?: File[];
}

export function useCreateViolation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files, ...payload }: CreateViolationPayload) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });
      (files ?? []).forEach((file) => formData.append('files', file));
      return (await apiClient.post<LandViolation>('/violations', formData)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violations'] }),
  });
}

export function useUpdateViolationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, resolutionNote }: { id: string; status: ViolationStatus; resolutionNote?: string }) =>
      (await apiClient.patch<LandViolation>(`/violations/${id}/status`, { status, resolutionNote })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violations'] }),
  });
}

export function downloadViolationAct(id: string) {
  return downloadFile(`/violations/${id}/act`, `dalolatnoma-${id}.pdf`);
}

export function downloadViolationWord(id: string) {
  return downloadFile(`/violations/${id}/export/word`, wordFilename('umumiy', `noqonuniy-foydalanish-${id}`));
}

export function downloadViolationsExcel(filter?: { status?: ViolationStatus; module?: InspectionModule }) {
  return downloadFile('/violations/export/excel', excelFilename(filter?.module ?? 'umumiy', 'noqonuniy_foydalanish'), filter);
}
