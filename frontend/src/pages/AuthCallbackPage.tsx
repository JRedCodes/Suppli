import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth/email confirmation callback from Supabase
 * This page is shown when users click confirmation links in their email
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from the URL (contains the auth tokens)
        const { data, error: callbackError } = await supabase.auth.getSession();

        if (callbackError) {
          setError(callbackError.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          navigate('/', { replace: true });
        } else {
          // No session, might be an error or expired link
          setError('Invalid or expired confirmation link. Please try signing up again.');
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Confirmation Error</h1>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
