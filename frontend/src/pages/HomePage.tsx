import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export default function HomePage() {
  const { user } = useAuth();
  const { businesses, loading: businessesLoading } = useBusiness();
  const navigate = useNavigate();

  // Redirect to onboarding if no businesses
  if (!businessesLoading && businesses.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert variant="info" title="Welcome to Suppli!">
          <p className="mb-4">
            You need to create your first business to get started. This will set up your account and allow you to
            start managing vendors and orders.
          </p>
          <Button onClick={() => navigate('/onboarding')}>Create Your First Business</Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome to Suppli</h1>
        <p className="text-gray-600 mb-8">Hello, {user?.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Orders</h2>
            <p className="text-sm text-gray-600 mb-4">
              Generate, review, and manage your orders. Review recommendations before sending to vendors.
            </p>
            <div className="flex space-x-3">
              <Link to="/orders">
                <Button>View Orders</Button>
              </Link>
              <Link to="/orders/generate">
                <Button variant="secondary">Generate Order</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendors</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage your vendors and their ordering methods. Add vendors to start generating orders.
            </p>
            <Link to="/vendors">
              <Button>Manage Vendors</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
