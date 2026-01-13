import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';

export default function AppLayout() {
  const { signOut, user } = useAuth();
  const { businesses, selectedBusinessId, setSelectedBusinessId, loading: businessesLoading } = useBusiness();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Suppli
              </Link>
                      <nav className="hidden md:flex items-center space-x-4">
                        <Link
                          to="/orders"
                          className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          Orders
                        </Link>
                        <Link
                          to="/vendors"
                          className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          Vendors
                        </Link>
                        <Link
                          to="/products"
                          className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          Products
                        </Link>
                      </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Business</label>
                {businessesLoading ? (
                  <select disabled className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm">
                    <option>Loading...</option>
                  </select>
                ) : businesses.length === 0 ? (
                  <div className="mt-1">
                    <Link
                      to="/onboarding"
                      className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Create Business
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
