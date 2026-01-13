import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { Table, type TableColumn } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import type { Order } from '../services/orders.service';

export default function OrdersListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
  const { data, isLoading, error } = useOrders(filters);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const columns: TableColumn<Order>[] = [
    {
      key: 'period',
      header: 'Order Period',
      accessor: (order) => formatDateRange(order.order_period_start, order.order_period_end),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (order) => <OrderStatusBadge status={order.status} />,
      sortable: true,
    },
    {
      key: 'mode',
      header: 'Mode',
      accessor: (order) => (
        <Badge variant="default">
          {order.mode === 'guided' ? 'Guided' : order.mode === 'full_auto' ? 'Full Auto' : 'Simulation'}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (order) => formatDate(order.created_at),
      sortable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load orders. Please try again.</p>
        </div>
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and review your orders</p>
        </div>
        <Button onClick={() => navigate('/orders/generate')}>Generate New Order</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex space-x-2">
          {(['all', 'draft', 'needs_review', 'approved', 'sent', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            statusFilter !== 'all'
              ? `No orders with status "${statusFilter.replace('_', ' ')}"`
              : "You haven't created any orders yet. Generate your first order to get started."
          }
          action={
            statusFilter === 'all' ? (
              <Button onClick={() => navigate('/orders/generate')}>Generate Your First Order</Button>
            ) : (
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                Show All Orders
              </Button>
            )
          }
        />
      ) : (
        <Table
          columns={columns}
          data={orders}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          emptyState="No orders found"
        />
      )}

      {/* Pagination info */}
      {data?.meta && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {orders.length} of {data.meta.total} orders
        </div>
      )}
    </div>
  );
}
