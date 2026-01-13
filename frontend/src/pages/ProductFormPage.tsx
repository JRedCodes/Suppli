import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUpdateProduct, useProduct } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import type { CreateProductRequest, UpdateProductRequest } from '../services/products.service';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional().or(z.literal('')),
  waste_sensitive: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = !!productId;

  const { data: productData, isLoading: isProductLoading, error: productLoadError } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

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
    },
  });

  useEffect(() => {
    if (isEditMode && productData) {
      reset({
        name: productData.name,
        category: productData.category || '',
        waste_sensitive: productData.waste_sensitive,
      });
    }
  }, [isEditMode, productData, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode && productId) {
        await updateProduct.mutateAsync({ productId, data: data as UpdateProductRequest });
      } else {
        await createProduct.mutateAsync(data as CreateProductRequest);
      }
      navigate('/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
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
