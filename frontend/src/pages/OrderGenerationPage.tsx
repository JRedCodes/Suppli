import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateOrder } from '../hooks/useOrders';
import { useVendors } from '../hooks/useVendors';
import { useBusiness } from '../hooks/useBusiness';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import type { GenerateOrderRequest, OrderGenerationResult } from '../services/orders.service';

// Helper to save draft to localStorage
function saveDraftToLocalStorage(
  businessId: string,
  draftKey: string,
  recommendations: OrderGenerationResult,
  formData: GenerateOrderRequest
): void {
  const draftData = {
    recommendations,
    formData,
    timestamp: Date.now(),
  };
  localStorage.setItem(`draft_order_${businessId}_${draftKey}`, JSON.stringify(draftData));
}

export default function OrderGenerationPage() {
  const navigate = useNavigate();
  const generateOrder = useGenerateOrder();
  const { selectedBusinessId } = useBusiness();
  const { data: vendorsData } = useVendors();
  const vendors = vendorsData?.data || [];

  const [formData, setFormData] = useState<GenerateOrderRequest>({
    orderPeriodStart: new Date().toISOString().split('T')[0],
    orderPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode: 'guided',
    vendorIds: [],
  });

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const result = await generateOrder.mutateAsync({
        ...formData,
        vendorIds: selectedVendors.length > 0 ? selectedVendors : undefined,
      });

      // Store recommendations in localStorage and navigate to draft view
      if (result.recommendations && selectedBusinessId) {
        const draftKey = Date.now().toString();
        saveDraftToLocalStorage(selectedBusinessId, draftKey, result.recommendations, {
          ...formData,
          vendorIds: selectedVendors.length > 0 ? selectedVendors : undefined,
        });
        // Navigate to draft view using a special "draft" orderId
        navigate(`/orders/draft-${draftKey}`);
      }
    } catch (error: unknown) {
      console.error('Failed to generate order:', error);
      // Extract error message from API error
      const message = error instanceof Error ? error.message : 'Failed to generate order. Please try again.';
      setErrorMessage(message);
    }
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Generate New Order</h1>
        <p className="text-sm text-gray-600">
          Create a new order based on sales data, promotions, and learning adjustments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={formData.orderPeriodStart}
              onChange={(e) => setFormData({ ...formData, orderPeriodStart: e.target.value })}
              required
            />
            <Input
              type="date"
              label="End Date"
              value={formData.orderPeriodEnd}
              onChange={(e) => setFormData({ ...formData, orderPeriodEnd: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Generation Mode</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="guided"
                checked={formData.mode === 'guided'}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value as 'guided' | 'full_auto' | 'simulation' })
                }
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Guided Mode</div>
                <div className="text-sm text-gray-600">
                  Orders require review before approval. Recommended for new users.
                </div>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="full_auto"
                checked={formData.mode === 'full_auto'}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value as 'guided' | 'full_auto' | 'simulation' })
                }
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Full Auto Mode</div>
                <div className="text-sm text-gray-600">
                  Orders are automatically approved. Use with caution.
                </div>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="simulation"
                checked={formData.mode === 'simulation'}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value as 'guided' | 'full_auto' | 'simulation' })
                }
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Simulation Mode</div>
                <div className="text-sm text-gray-600">Preview order without creating it.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Vendor Selection */}
        {vendors.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Vendors (Optional)</h2>
            <p className="text-sm text-gray-600">
              Select specific vendors to include. Leave empty to include all vendors.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {vendors.map((vendor) => (
                <label key={vendor.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={() => toggleVendor(vendor.id)}
                    className="text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm text-gray-900">{vendor.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {vendors.length === 0 && (
          <Alert variant="warning" title="No Vendors">
            You need to add vendors before generating orders. <a href="/vendors" className="underline">Add vendors</a>
          </Alert>
        )}

        {/* Error Display */}
        {(generateOrder.isError || errorMessage) && (
          <Alert variant="error" title="Error">
            {errorMessage || 'Failed to generate order. Please try again.'}
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={() => navigate('/orders')} disabled={generateOrder.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={generateOrder.isPending || vendors.length === 0}
            loading={generateOrder.isPending}
            title={vendors.length === 0 ? 'Add at least one vendor to generate orders' : ''}
          >
            Generate Order
          </Button>
        </div>
      </form>
    </div>
  );
}
