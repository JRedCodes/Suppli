import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUpdateProduct, useProduct, useCreateVendorProduct } from '../hooks/useProducts';
import { useVendors } from '../hooks/useVendors';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import type { CreateProductRequest, UpdateProductRequest } from '../services/products.service';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional().or(z.literal('')),
  waste_sensitive: z.boolean().default(false),
  max_stock_amount: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return null;
      const num = parseFloat(val);
      return isNaN(num) || num <= 0 ? null : num;
    })
    .pipe(z.number().positive().nullable().optional()),
  vendor_id: z.string().uuid().optional().or(z.literal('')),
  unit_type: z.enum(['case', 'unit']).optional(),
  sku: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = !!productId;

  const { data: productData, isLoading: isProductLoading, error: productLoadError } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createVendorProduct = useCreateVendorProduct();
  const { data: vendorsData } = useVendors({ archived: false });
  const vendors = vendorsData?.data || [];
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      waste_sensitive: false,
      max_stock_amount: '',
      vendor_id: '',
      unit_type: 'unit',
      sku: '',
    },
  });

  useEffect(() => {
    if (isEditMode && productData) {
      reset({
        name: productData.name,
        category: productData.category || '',
        waste_sensitive: productData.waste_sensitive,
        max_stock_amount: productData.max_stock_amount?.toString() || '',
      });
    }
  }, [isEditMode, productData, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setFormError(null);
    try {
      if (isEditMode && productId) {
        await updateProduct.mutateAsync({
          productId,
          data: {
            name: data.name,
            category: data.category,
            waste_sensitive: data.waste_sensitive,
            max_stock_amount: data.max_stock_amount || null,
          } as UpdateProductRequest,
        });
      } else {
        // Create the product
        const product = await createProduct.mutateAsync({
          name: data.name,
          category: data.category,
          waste_sensitive: data.waste_sensitive,
          max_stock_amount: data.max_stock_amount || null,
        } as CreateProductRequest);

        // If a vendor is selected, link the product to the vendor
        if (data.vendor_id && product.id) {
          try {
            await createVendorProduct.mutateAsync({
              vendor_id: data.vendor_id,
              product_id: product.id,
              unit_type: data.unit_type || 'unit',
              sku: data.sku || undefined,
            });
          } catch (linkError: unknown) {
            console.error('Failed to link product to vendor:', linkError);
            const linkErrorMessage = linkError instanceof Error ? linkError.message : 'Unknown error';
            // Product was created, but linking failed - show warning but still navigate
            setFormError(`Product created, but failed to link to vendor: ${linkErrorMessage}`);
            // Still navigate after a short delay
            setTimeout(() => navigate('/products'), 2000);
            return;
          }
        }
      }
      navigate('/products');
    } catch (error: unknown) {
      console.error('Failed to save product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product. Please try again.';
      setFormError(errorMessage);
    }
  };

  if (isEditMode && isProductLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (isEditMode && productLoadError) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert variant="error">
          Failed to load product details: {productLoadError.message}. Please try again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditMode ? `Edit Product: ${productData?.name}` : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formError && <Alert variant="error">{formError}</Alert>}
        <Input label="Product Name" {...register('name')} error={errors.name?.message} required />

        <Input
          label="Category (Optional)"
          {...register('category')}
          error={errors.category?.message}
          placeholder="e.g., Dairy, Produce, Meat"
        />

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('waste_sensitive')}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <div className="font-medium text-gray-900">Waste Sensitive</div>
              <div className="text-sm text-gray-600">
                Check this if the product has a short shelf life or is prone to waste
              </div>
            </div>
          </label>
          {errors.waste_sensitive && (
            <p className="mt-2 text-sm text-red-600">{errors.waste_sensitive.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Max Stock Amount (Optional)"
            type="number"
            step="0.01"
            min="0"
            {...register('max_stock_amount')}
            error={errors.max_stock_amount?.message}
            placeholder="e.g., 100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Set an upper limit safeguard for order quantities. If set, order generation will cap quantities at this value.
          </p>
        </div>

        {!isEditMode && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Link to Vendor (Optional)</h3>
            <p className="text-xs text-gray-600">
              Associate this product with a vendor to include it in order generation. You can add more vendors later.
            </p>
            <div>
              <label htmlFor="vendor_id" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select
                id="vendor_id"
                {...register('vendor_id')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a vendor (optional)</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendor_id && (
                <p className="mt-2 text-sm text-red-600">{errors.vendor_id.message}</p>
              )}
            </div>
            {vendors.length === 0 && (
              <p className="text-xs text-gray-500">
                No vendors available. <a href="/vendors/new" className="text-indigo-600 hover:text-indigo-700 underline">Add a vendor first</a> to link products.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="unit_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Type
                </label>
                <select
                  id="unit_type"
                  {...register('unit_type')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="unit">Unit</option>
                  <option value="case">Case</option>
                </select>
              </div>
              <div>
                <Input
                  label="SKU (Optional)"
                  {...register('sku')}
                  error={errors.sku?.message}
                  placeholder="Vendor SKU"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={() => navigate('/products')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loading size="sm" /> : isEditMode ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
