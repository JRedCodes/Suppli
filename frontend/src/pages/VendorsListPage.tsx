import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors, useArchiveVendor } from '../hooks/useVendors';
import { useAuth } from '../hooks/useAuth';
import { Table, type TableColumn } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { Vendor } from '../services/vendors.service';

const orderingMethodLabels: Record<Vendor['ordering_method'], string> = {
  email: 'Email',
  phone: 'Phone',
  portal: 'Portal',
  in_person: 'In-Person',
};

export default function VendorsListPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useVendors({ archived: false });
  const archiveVendor = useArchiveVendor();
  const [archiveTarget, setArchiveTarget] = useState<Vendor | null>(null);

  // Check if user is authenticated
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
          Please sign in to view vendors.
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
      await archiveVendor.mutateAsync(archiveTarget.id);
      setArchiveTarget(null);
    } catch (error) {
      console.error('Failed to archive vendor:', error);
    }
  };

  const columns: TableColumn<Vendor>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (vendor) => <span className="font-medium text-gray-900">{vendor.name}</span>,
      sortable: true,
    },
    {
      key: 'ordering_method',
      header: 'Ordering Method',
      accessor: (vendor) => (
        <Badge variant="default">{orderingMethodLabels[vendor.ordering_method]}</Badge>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (vendor) => (
        <div className="text-sm text-gray-600">
          {vendor.contact_email && <div>{vendor.contact_email}</div>}
          {vendor.contact_phone && <div>{vendor.contact_phone}</div>}
          {!vendor.contact_email && !vendor.contact_phone && <span className="text-gray-400">No contact info</span>}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (vendor) => formatDate(vendor.created_at),
      sortable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading vendors..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load vendors. Please try again.</p>
        </div>
      </div>
    );
  }

  const vendors = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your vendors and suppliers</p>
        </div>
        <Button onClick={() => navigate('/vendors/new')}>Add Vendor</Button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          title="No vendors yet"
          description="Add your first vendor to start generating orders. Vendors are the suppliers you order from."
          action={<Button onClick={() => navigate('/vendors/new')}>Add Your First Vendor</Button>}
        />
      ) : (
        <Table
          columns={columns}
          data={vendors}
          onRowClick={(vendor) => navigate(`/vendors/${vendor.id}`)}
          emptyState="No vendors found"
        />
      )}

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Vendor"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to archive <strong>{archiveTarget?.name}</strong>? Archived vendors won't appear in
            order generation, but their data will be preserved.
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setArchiveTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={archiveVendor.isPending}
            loading={archiveVendor.isPending}
          >
            Archive Vendor
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
