# Suppli — Data Fetching Strategy

## Purpose of This Document
This document defines Suppli's data fetching patterns, caching strategies, and state management approach for API interactions.
The goal is to ensure predictable, performant, and maintainable data flows between frontend and backend.

TanStack Query (React Query) is the primary data fetching library.

---

## Core Principles
1. **Server is the source of truth**
2. **Caching reduces unnecessary requests**
3. **Optimistic updates only when safe**
4. **Errors are handled gracefully**
5. **Loading states are explicit**

---

## TanStack Query Setup

### Query Client Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Default Behaviors
- Queries are considered stale after 5 minutes
- Cache persists for 10 minutes
- Automatic retry on failure (1 attempt)
- No refetch on window focus (to reduce noise)

---

## Query Key Patterns

### Query Key Structure
Query keys must be:
- Explicit and stable
- Hierarchical
- Include all dependencies

### Naming Convention
```typescript
// List queries
['orders', { businessId }]
['vendors', { businessId }]

// Detail queries
['orders', orderId]
['vendors', vendorId]

// Filtered queries
['orders', { businessId, status: 'needs_review' }]
['invoices', { businessId, vendorId }]
```

### Rules
- Always include businessId in query keys
- Include filters in query key
- Use objects for complex keys

---

## Query Patterns

### List Queries

#### Pattern
```typescript
const useOrders = (businessId: string, filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['orders', { businessId, ...filters }],
    queryFn: () => ordersService.list(businessId, filters),
  });
};
```

#### Usage
```typescript
const { data: orders, isLoading, error } = useOrders(businessId, {
  status: 'needs_review',
});
```

---

### Detail Queries

#### Pattern
```typescript
const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersService.get(orderId),
    enabled: !!orderId,
  });
};
```

#### Usage
```typescript
const { data: order } = useOrder(orderId);
```

---

### Dependent Queries
Queries that depend on other queries.

#### Pattern
```typescript
const useOrderLines = (orderId: string) => {
  const { data: order } = useOrder(orderId);
  
  return useQuery({
    queryKey: ['orders', orderId, 'lines'],
    queryFn: () => orderLinesService.list(orderId),
    enabled: !!order,
  });
};
```

---

## Mutation Patterns

### Standard Mutation

#### Pattern
```typescript
const useApproveOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => ordersService.approve(orderId),
    onSuccess: (data, orderId) => {
      // Invalidate list queries
      queryClient.invalidateQueries(['orders']);
      // Update detail query
      queryClient.setQueryData(['orders', orderId], data);
    },
  });
};
```

#### Usage
```typescript
const approveOrder = useApproveOrder();

const handleApprove = async () => {
  try {
    await approveOrder.mutateAsync(orderId);
    toast.success('Order approved');
  } catch (error) {
    toast.error('Failed to approve order');
  }
};
```

---

### Optimistic Updates

#### When to Use
- User-initiated actions
- High confidence of success
- Reversible operations

#### Pattern
```typescript
const useUpdateOrderLine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lineId, quantity }: UpdateLineParams) =>
      orderLinesService.update(lineId, quantity),
    onMutate: async ({ lineId, quantity }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['orders', orderId]);
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(['orders', orderId]);
      
      // Optimistically update
      queryClient.setQueryData(['orders', orderId], (old: Order) => ({
        ...old,
        lines: old.lines.map(line =>
          line.id === lineId ? { ...line, finalQuantity: quantity } : line
        ),
      }));
      
      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(['orders', orderId], context.previousOrder);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['orders', orderId]);
    },
  });
};
```

---

## Cache Invalidation Strategy

### When to Invalidate

#### After Mutations
- Create → invalidate list queries
- Update → invalidate list + detail queries
- Delete → invalidate list queries

#### After Related Actions
- Order approved → invalidate orders list
- Invoice uploaded → invalidate invoices + related orders

### Invalidation Patterns
```typescript
// Invalidate all orders
queryClient.invalidateQueries(['orders']);

// Invalidate specific order
queryClient.invalidateQueries(['orders', orderId]);

// Invalidate filtered list
queryClient.invalidateQueries(['orders', { businessId, status: 'needs_review' }]);
```

---

## Error Handling

### Query Error Handling

#### Pattern
```typescript
const { data, error, isError } = useOrders(businessId);

if (isError) {
  return <ErrorState error={error} />;
}
```

### Mutation Error Handling

#### Pattern
```typescript
const approveOrder = useApproveOrder();

const handleApprove = async () => {
  try {
    await approveOrder.mutateAsync(orderId);
  } catch (error) {
    if (error.code === 'ORDER_INVALID_STATE') {
      toast.error('This order must be reviewed before approval');
    } else {
      toast.error('Failed to approve order');
    }
  }
};
```

### Global Error Boundary
- Catch unhandled query errors
- Display fallback UI
- Log errors for monitoring

---

## Loading States

### Query Loading States

#### Pattern
```typescript
const { data, isLoading, isFetching } = useOrders(businessId);

if (isLoading) {
  return <SkeletonTable />;
}

if (isFetching) {
  // Show subtle loading indicator
}
```

### Mutation Loading States

#### Pattern
```typescript
const approveOrder = useApproveOrder();

<Button
  disabled={approveOrder.isLoading}
  onClick={handleApprove}
>
  {approveOrder.isLoading ? 'Approving...' : 'Approve Order'}
</Button>
```

---

## Refetching Strategies

### Manual Refetch
```typescript
const { refetch } = useOrders(businessId);

<Button onClick={() => refetch()}>Refresh</Button>
```

### Automatic Refetch
- On window focus (disabled by default)
- On network reconnect
- On query mount (if stale)

### Polling (When Needed)
```typescript
const useOrderStatus = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId, 'status'],
    queryFn: () => ordersService.getStatus(orderId),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: isProcessing, // Only poll when processing
  });
};
```

---

## Service Layer Pattern

### API Service Structure
```typescript
// services/ordersService.ts
export const ordersService = {
  list: async (businessId: string, filters?: OrderFilters): Promise<Order[]> => {
    const response = await apiClient.get('/orders', {
      params: { businessId, ...filters },
    });
    return response.data.data;
  },
  
  get: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data;
  },
  
  approve: async (orderId: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/approve`);
    return response.data.data;
  },
};
```

### Rules
- All API calls in service layer
- Services return typed data
- Errors thrown for query/mutation handling

---

## Business Context Integration

### Business ID in Queries
All queries must include businessId.

#### Pattern
```typescript
const { businessId } = useBusiness();
const { data: orders } = useOrders(businessId);
```

### Business Switching
When business changes:
- Invalidate all queries
- Clear cache for previous business
- Refetch for new business

---

## File Upload Patterns

### Upload Mutation
```typescript
const useUploadInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => invoicesService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    },
  });
};
```

### Progress Tracking (Later)
- Use mutation for upload
- Track progress via callback
- Update UI with progress

---

## MVP vs Later

### MVP
- TanStack Query for all data fetching
- Basic caching strategy
- Manual refetch buttons
- Simple error handling

### Later
- Advanced caching strategies
- Background sync
- Offline support
- Real-time subscriptions (if needed)

---

## Success Criteria
- No duplicate API calls
- Loading states are clear
- Errors are handled gracefully
- Cache is used effectively
- Data stays in sync with server

---

## Summary
Data fetching in Suppli exists to:
- Reduce unnecessary requests
- Provide smooth user experience
- Keep data in sync
- Handle errors gracefully

If data fetching is complex, simplify it.
If cache is stale, invalidate it.
If errors are silent, surface them.
