import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, useUpdateOrderLine, useApproveOrder, useSendOrder } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Alert } from '../components/ui/Alert';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { OrderLineRow } from '../components/orders/OrderLineRow';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(orderId);
  const updateLine = useUpdateOrderLine();
  const approveOrder = useApproveOrder();
  const sendOrder = useSendOrder();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    if (!orderId) return;
    try {
      await updateLine.mutateAsync({
        orderId,
        lineId,
        data: { finalQuantity: quantity },
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleApprove = async () => {
    if (!orderId) return;
    try {
      await approveOrder.mutateAsync(orderId);
      setShowApproveModal(false);
    } catch (error) {
      console.error('Failed to approve order:', error);
    }
  };

  const handleSend = async () => {
    if (!orderId) return;
    try {
      await sendOrder.mutateAsync(orderId);
      setShowSendModal(false);
    } catch (error) {
      console.error('Failed to send order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading order..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error">
          {error ? 'Failed to load order. Please try again.' : 'Order not found.'}
        </Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const canApprove = order.status === 'needs_review' || order.status === 'draft';
  const canSend = order.status === 'approved';
  const isReadOnly = order.status === 'sent' || order.status === 'cancelled';

  // Calculate summary stats
  const totalLines = order.vendor_orders?.reduce((sum, vo) => sum + vo.order_lines.length, 0) || 0;
  const needsReviewCount =
    order.vendor_orders?.reduce(
      (sum, vo) => sum + vo.order_lines.filter((line) => line.confidence_level === 'needs_review').length,
      0
    ) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Order: {formatDateRange(order.order_period_start, order.order_period_end)}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-600">
              Created {formatDate(order.created_at)} • {order.mode === 'guided' ? 'Guided Mode' : order.mode}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
            {canApprove && (
              <Button
                onClick={() => setShowApproveModal(true)}
                disabled={approveOrder.isPending}
                loading={approveOrder.isPending}
              >
                Approve Order
              </Button>
            )}
            {canSend && (
              <Button
                variant="primary"
                onClick={() => setShowSendModal(true)}
                disabled={sendOrder.isPending}
                loading={sendOrder.isPending}
              >
                Send Order
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="text-2xl font-semibold text-gray-900">{totalLines}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Needs Review</div>
              <div className="text-2xl font-semibold text-yellow-600">{needsReviewCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Vendors</div>
              <div className="text-2xl font-semibold text-gray-900">{order.vendor_orders?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Orders */}
      {order.vendor_orders && order.vendor_orders.length > 0 ? (
        <div className="space-y-6">
          {order.vendor_orders.map((vendorOrder) => (
            <div key={vendorOrder.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {vendorOrder.vendors?.name || 'Unknown Vendor'}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommended
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Explanation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendorOrder.order_lines.map((line) => (
                      <OrderLineRow
                        key={line.id}
                        line={line}
                        onQuantityChange={handleQuantityChange}
                        disabled={isReadOnly || updateLine.isPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info" title="No Order Lines">
          This order doesn't have any items yet.
        </Alert>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Order"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve this order? Once approved, you'll be able to send it to vendors.
          </p>
          {needsReviewCount > 0 && (
            <Alert variant="warning" title="Review Required">
              This order has {needsReviewCount} item{needsReviewCount !== 1 ? 's' : ''} that need review. Please
              review all items before approving.
            </Alert>
          )}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveOrder.isPending || needsReviewCount > 0}
            loading={approveOrder.isPending}
          >
            Approve Order
          </Button>
        </ModalFooter>
      </Modal>

      {/* Send Modal */}
      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Order" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will mark the order as sent. You'll need to manually send the order to vendors based on their
            ordering method (email, phone, portal, etc.).
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSendModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendOrder.isPending} loading={sendOrder.isPending}>
            Mark as Sent
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
