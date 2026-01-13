import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendor, useCreateVendor, useUpdateVendor } from '../hooks/useVendors';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Alert } from '../components/ui/Alert';
import type { CreateVendorRequest } from '../services/vendors.service';

export default function VendorFormPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const isEditing = !!vendorId;

  const { data: vendor, isLoading: loadingVendor } = useVendor(vendorId);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const [formData, setFormData] = useState<CreateVendorRequest>({
    name: '',
    ordering_method: 'email',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load vendor data when editing
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        ordering_method: vendor.ordering_method,
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        notes: vendor.notes || '',
      });
    }
  }, [vendor]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required';
    }

    // Validate email if provided
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditing && vendorId) {
        await updateVendor.mutateAsync({
          vendorId,
          data: {
            name: formData.name,
            ordering_method: formData.ordering_method,
            contact_email: formData.contact_email || undefined,
            contact_phone: formData.contact_phone || undefined,
            notes: formData.notes || undefined,
          },
        });
      } else {
        await createVendor.mutateAsync(formData);
      }
      navigate('/vendors');
    } catch (error) {
      console.error('Failed to save vendor:', error);
    }
  };

  if (isEditing && loadingVendor) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading vendor..." />
      </div>
    );
  }

  const mutation = isEditing ? updateVendor : createVendor;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
        </h1>
        <p className="text-sm text-gray-600">
          {isEditing
            ? 'Update vendor information and ordering preferences.'
            : 'Add a new vendor to start generating orders.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <Input
            label="Vendor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            placeholder="e.g., ABC Wholesale"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordering Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ordering_method}
              onChange={(e) =>
                setFormData({ ...formData, ordering_method: e.target.value as CreateVendorRequest['ordering_method'] })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="portal">Portal</option>
              <option value="in_person">In-Person</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              How you typically place orders with this vendor
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>

          <Input
            type="email"
            label="Contact Email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            error={errors.contact_email}
            placeholder="vendor@example.com"
            helperText="Required for email ordering method"
          />

          <Input
            type="tel"
            label="Contact Phone"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            placeholder="(555) 123-4567"
            helperText="Required for phone ordering method"
          />
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Any additional information about this vendor..."
            />
          </div>
        </div>

        {/* Error Display */}
        {mutation.isError && (
          <Alert variant="error" title="Error">
            Failed to {isEditing ? 'update' : 'create'} vendor. Please try again.
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={() => navigate('/vendors')} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} loading={mutation.isPending}>
            {isEditing ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
