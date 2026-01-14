/**
 * React Query hooks for orders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';
import {
  ordersService,
  type OrderFilters,
  type GenerateOrderRequest,
  type UpdateOrderLineRequest,
  type AddOrderLineRequest,
} from '../services/orders.service';

/**
 * Query key factory for orders
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to list orders
 */
export function useOrders(filters: OrderFilters = {}) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: [...orderKeys.list(filters), selectedBusinessId],
    queryFn: () => {
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      return ordersService.list(filters, {
        businessId: selectedBusinessId,
        token: session.access_token,
      });
    },
    enabled: !!selectedBusinessId && !!session?.access_token,
  });
}

/**
 * Hook to get a single order
 */
export function useOrder(orderId: string | undefined) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: orderKeys.detail(orderId!),
    queryFn: () =>
      ordersService.get(orderId!, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    enabled: !!orderId && !!selectedBusinessId && !!session,
  });
}

/**
 * Hook to generate a new order
 */
export function useGenerateOrder() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (data: GenerateOrderRequest) =>
      ordersService.generate(data, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to update an order line
 */
export function useUpdateOrderLine() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({
      orderId,
      lineId,
      data,
    }: {
      orderId: string;
      lineId: string;
      data: UpdateOrderLineRequest;
    }) =>
      ordersService.updateLine(orderId, lineId, data, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the specific order to refetch with updated data
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      // Also invalidate list to update summary counts
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to approve an order
 */
export function useApproveOrder() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (orderId: string) =>
      ordersService.approve(orderId, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (data, orderId) => {
      // Update the detail query with the new data
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      // Invalidate list to update status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to send an order
 */
export function useSendOrder() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (orderId: string) =>
      ordersService.send(orderId, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (data, orderId) => {
      // Update the detail query with the new data
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      // Invalidate list to update status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to add an order line
 */
export function useAddOrderLine() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: AddOrderLineRequest }) =>
      ordersService.addLine(orderId, data, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the specific order to refetch with updated data
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      // Also invalidate list to update summary counts
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to remove an order line
 */
export function useRemoveOrderLine() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({ orderId, lineId }: { orderId: string; lineId: string }) =>
      ordersService.removeLine(orderId, lineId, {
        businessId: selectedBusinessId,
        token: session?.access_token,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the specific order to refetch with updated data
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      // Also invalidate list to update summary counts
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
