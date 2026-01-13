import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';
import {
  productsService,
  type ProductFilters,
  type CreateProductRequest,
  type UpdateProductRequest,
  type CreateVendorProductRequest,
  type UpdateVendorProductRequest,
  type Product,
} from '../services/products.service';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  vendorProducts: () => [...productKeys.all, 'vendor-products'] as const,
  vendorProductsList: (vendorId?: string, productId?: string) =>
    [...productKeys.vendorProducts(), vendorId, productId] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: [...productKeys.list(filters), selectedBusinessId],
    queryFn: async () => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      console.log('useProducts queryFn called:', {
        filters,
        selectedBusinessId,
        hasToken: !!token,
      });
      const result = await productsService.list(filters, {
        businessId: selectedBusinessId,
        token,
      });
      console.log('useProducts queryFn result:', {
        hasData: !!result,
        dataCount: result?.data?.length || 0,
        meta: result?.meta,
        fullResult: result,
      });
      return result;
    },
    enabled: !!selectedBusinessId && !!session?.access_token,
  });
}

export function useProduct(productId: string | undefined) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: productKeys.detail(productId!),
    queryFn: () => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.get(productId!, {
        businessId: selectedBusinessId,
        token,
      });
    },
    enabled: !!productId && !!selectedBusinessId && !!session?.access_token,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.create(data, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: () => {
      // Invalidate all product list queries - use predicate to match all queries starting with ['products', 'list']
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return key[0] === 'products' && key[1] === 'list';
        },
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.update(productId, data, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(productKeys.detail(variables.productId), data);
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return key[0] === 'products' && key[1] === 'list';
        },
      });
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (productId: string) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.archive(productId, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: (data, productId) => {
      console.log('Archive product success:', { productId, archivedProduct: data });
      // Update the detail query
      queryClient.setQueryData(productKeys.detail(productId), data);
      
      // Remove the archived product from all list queries (only for queries with archived: false)
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            // Match products list queries
            // Query key structure: ['products', 'list', filters, selectedBusinessId]
            if (key[0] !== 'products' || key[1] !== 'list') return false;
            // Only update queries that explicitly filter out archived products (archived: false)
            const filters = key[2] as ProductFilters | undefined;
            const shouldUpdate = filters?.archived === false;
            console.log('Cache update predicate check:', {
              keyLength: key.length,
              keyStructure: key,
              filters,
              shouldUpdate,
            });
            return shouldUpdate;
          },
        },
        (oldData: any) => {
          if (!oldData || !oldData.data) {
            console.log('No oldData to update - query structure:', oldData);
            return oldData;
          }
          const filtered = oldData.data.filter((p: Product) => p.id !== productId);
          console.log('Filtering archived product from cache:', {
            beforeCount: oldData.data.length,
            afterCount: filtered.length,
            productId,
            oldDataKeys: Object.keys(oldData),
          });
          return {
            ...oldData,
            data: filtered,
            meta: {
              ...oldData.meta,
              total: Math.max(0, (oldData.meta?.total || 0) - 1),
            },
          };
        }
      );
      
      // Only invalidate queries that should show non-archived products
      // This ensures the refetch respects the archived: false filter
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (key[0] !== 'products' || key[1] !== 'list') return false;
          const filters = key[2] as ProductFilters | undefined;
          // Only invalidate queries that explicitly filter out archived products
          return filters?.archived === false;
        },
        refetchType: 'active', // Only refetch active queries
      });
    },
  });
}

export function useVendorProducts(vendorId?: string, productId?: string) {
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useQuery({
    queryKey: productKeys.vendorProductsList(vendorId, productId),
    queryFn: () => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.listVendorProducts(
        {
          businessId: selectedBusinessId,
          token,
        },
        vendorId,
        productId
      );
    },
    enabled: !!selectedBusinessId && !!session?.access_token,
  });
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (data: CreateVendorProductRequest) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.createVendorProduct(data, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
}

export function useUpdateVendorProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: ({
      vendorProductId,
      data,
    }: {
      vendorProductId: string;
      data: UpdateVendorProductRequest;
    }) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.updateVendorProduct(vendorProductId, data, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { selectedBusinessId } = useBusiness();

  return useMutation({
    mutationFn: (vendorProductId: string) => {
      const token = session?.access_token;
      if (!token) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      return productsService.deleteVendorProduct(vendorProductId, {
        businessId: selectedBusinessId,
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
}
