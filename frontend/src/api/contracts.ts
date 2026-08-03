import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { downloadFile, excelFilename, wordFilename } from '../lib/download';
import type { Contract } from '../types';

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => (await apiClient.get<Contract[]>('/contracts')).data,
  });
}

export function downloadContractsExcel() {
  return downloadFile('/contracts/export/excel', excelFilename('soliq', 'shartnomalar'));
}

export function downloadContractWord(id: string, contractNumber: string) {
  return downloadFile(`/contracts/${id}/export/word`, wordFilename('soliq', `shartnoma-${contractNumber.replace(/\//g, '-')}`));
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Contract>(`/contracts/${id}/sign`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}
