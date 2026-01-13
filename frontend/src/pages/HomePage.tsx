import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  const { user } = useAuth();

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
