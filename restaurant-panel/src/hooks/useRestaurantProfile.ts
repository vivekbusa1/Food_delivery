import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { restaurantService } from '@/services/restaurantService';
import { extractErrorMessage } from '@/services/apiClient';
import type {
  RestaurantProfile,
  UpdateBusinessDetailsPayload,
  UpdateProfilePayload,
  WorkingHours,
} from '@/types';

export const restaurantKeys = {
  profile: ['restaurant', 'profile'] as const,
  workingHours: ['restaurant', 'working-hours'] as const,
};

export function useRestaurantProfile() {
  return useQuery({
    queryKey: restaurantKeys.profile,
    queryFn: restaurantService.getProfile,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => restaurantService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantKeys.profile, data);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUpdateBusinessDetails() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateBusinessDetailsPayload) =>
      restaurantService.updateBusinessDetails(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantKeys.profile, data);
      enqueueSnackbar('Business details updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useToggleOpenStatus() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (isOpen: boolean) => restaurantService.toggleOpenStatus(isOpen),
    onSuccess: (data) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantKeys.profile, data);
      enqueueSnackbar(
        data.isOpen ? 'You are now accepting orders' : 'You are now offline',
        { variant: 'info' }
      );
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (file: File) => restaurantService.uploadLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantKeys.profile, data);
      enqueueSnackbar('Logo updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUploadCoverImage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (file: File) => restaurantService.uploadCoverImage(file),
    onSuccess: (data) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantKeys.profile, data);
      enqueueSnackbar('Cover image updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useWorkingHours() {
  return useQuery({
    queryKey: restaurantKeys.workingHours,
    queryFn: restaurantService.getWorkingHours,
    staleTime: 60_000,
  });
}

export function useUpdateWorkingHours() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: WorkingHours) => restaurantService.updateWorkingHours(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<WorkingHours>(restaurantKeys.workingHours, data);
      enqueueSnackbar('Working hours updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
