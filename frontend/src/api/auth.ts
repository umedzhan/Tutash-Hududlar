import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';

export interface NotificationPrefs {
  applications: boolean;
  payments: boolean;
  expiringContracts: boolean;
  violations: boolean;
  dailyEmailSummary: boolean;
}

export interface MyProfile {
  id: string;
  name: string;
  role: string;
  phone: string;
  notificationPrefs: NotificationPrefs;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  notificationPrefs?: Partial<NotificationPrefs>;
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await apiClient.get<MyProfile>('/auth/me')).data,
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => (await apiClient.patch('/auth/me', payload)).data,
    onSuccess: (data) => {
      updateUser({ name: data.name, phone: data.phone });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
