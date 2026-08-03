import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { downloadFile, excelFilename } from '../lib/download';
import type { InspectionModule, InspectionResult } from '../types';

export function useInspections(filter?: { module?: InspectionModule }) {
  return useQuery({
    queryKey: ['inspections', filter],
    queryFn: async () => (await apiClient.get<InspectionResult[]>('/inspections', { params: filter })).data,
  });
}

export interface CreateInspectionPayload {
  module: InspectionModule;
  inspectionDate: string;
  address: string;
  lat?: number;
  lng?: number;
  areaM2?: number;
  districtId?: string;
  description?: string;
  files?: File[];
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files, ...payload }: CreateInspectionPayload) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });
      (files ?? []).forEach((file) => formData.append('files', file));
      return (await apiClient.post<InspectionResult>('/inspections', formData)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspections'] }),
  });
}

export function downloadInspectionsExcel(filter?: { module?: InspectionModule }) {
  return downloadFile('/inspections/export/excel', excelFilename(filter?.module ?? 'umumiy', 'xatlov_natijalari'), filter);
}
