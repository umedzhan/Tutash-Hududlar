import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => (await apiClient.patch('/auth/me', payload)).data,
    onSuccess: (data) => updateUser({ name: data.name, phone: data.phone }),
  });
}
