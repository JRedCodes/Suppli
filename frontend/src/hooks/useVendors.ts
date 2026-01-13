/**
 * React Query hooks for vendors
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';
import {
  vendorsService,
  type VendorFilters,
  type CreateVendorRequest,
  type UpdateVendorRequest,
} from '../services/vendors.service';

/**
 * Query key factory for vendors
 */
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: VendorFilters) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

/**
 * Hook to list vendors
 */
export function useVendors(filters: VendorFilters = {}) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: [...vendorKeys.list(filters), selectedBusinessId],
    queryFn: () =>
      vendorsService.list(filters, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    enabled: !!selectedBusinessId && !!session,
  });
}

/**
 * Hook to get a single vendor
 */
export function useVendor(vendorId: string | undefined) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: vendorKeys.detail(vendorId!),
    queryFn: () =>
      vendorsService.get(vendorId!, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    enabled: !!vendorId && !!selectedBusinessId && !!session,
  });
}

/**
 * Hook to create a vendor
 */
export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (data: CreateVendorRequest) =>
      vendorsService.create(data, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: () => {
      // Invalidate vendors list to refetch
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

/**
 * Hook to update a vendor
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: UpdateVendorRequest }) =>
      vendorsService.update(vendorId, data, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (data, variables) => {
      // Update the detail query with the new data
      queryClient.setQueryData(vendorKeys.detail(variables.vendorId), data);
      // Invalidate list to update
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

/**
 * Hook to archive a vendor
 */
export function useArchiveVendor() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (vendorId: string) =>
      vendorsService.archive(vendorId, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (data, vendorId) => {
      // Update the detail query with the new data
      queryClient.setQueryData(vendorKeys.detail(vendorId), data);
      // Invalidate list to update
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}
