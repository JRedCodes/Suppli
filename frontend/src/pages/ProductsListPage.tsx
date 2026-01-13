import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useArchiveProduct } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { Table, type TableColumn } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import type { Product } from '../services/products.service';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useProducts({ archived: false });
  const archiveProduct = useArchiveProduct();
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Authentication Required">
          Please sign in to view products.
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveProduct.mutateAsync(archiveTarget.id);
      setArchiveTarget(null);
    } catch (error) {
      console.error('Failed to archive product:', error);
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (product) => product.name,
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (product) => product.category || '-',
    },
    {
      key: 'waste_sensitive',
      header: 'Waste Sensitive',
      accessor: (product) => (
        <Badge variant={product.waste_sensitive ? 'default' : 'info'}>
          {product.waste_sensitive ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: (product) => formatDate(product.created_at),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (product) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setArchiveTarget(product);
            }}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error">Failed to load products. Please try again. {error.message}</Alert>
      </div>
    );
  }

  const products = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => navigate('/products/new')}>Add Product</Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="You haven't added any products yet. Add your first product to start generating orders."
          action={<Button onClick={() => navigate('/products/new')}>Add Your First Product</Button>}
        />
      ) : (
        <Table
          columns={columns}
          data={products}
          rowKey={(product) => product.id}
          onRowClick={(product) => navigate(`/products/${product.id}`)}
        />
      )}

      {data?.meta && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {products.length} of {data.meta.total} products
        </div>
      )}

      {archiveTarget && (
        <Modal
          isOpen={!!archiveTarget}
          onClose={() => setArchiveTarget(null)}
          title={`Archive ${archiveTarget.name}?`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to archive this product? Archived products won't appear in order generation.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setArchiveTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleArchive}>
                Archive
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
