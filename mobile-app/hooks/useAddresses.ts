import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { addressService, type AddressPayload } from "../services/addressService";
import { getErrorMessage } from "../services/api";

export function useAddresses() {
  return useQuery({ queryKey: queryKeys.addresses.all, queryFn: addressService.list });
}

export function useAddress(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.addresses.detail(id ?? ""),
    queryFn: () => addressService.detail(id as string),
    enabled: !!id,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => addressService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      Toast.show({ type: "success", text1: "Address saved" });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Could not save address", text2: getErrorMessage(error) }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) =>
      addressService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      Toast.show({ type: "success", text1: "Address updated" });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
