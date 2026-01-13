import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';

export default function AppLayout() {
  const { signOut, user } = useAuth();
  const { businesses, selectedBusinessId, setSelectedBusinessId } = useBusiness();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Suppli
            </Link>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Ordering & vendor automation
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Business</label>
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
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
