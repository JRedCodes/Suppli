/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { onboardingService } from '../services/onboarding.service';

type Business = { id: string; name: string };

interface BusinessContextValue {
  businesses: Business[];
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  loading: boolean;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch user's businesses when session is available
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await onboardingService.getBusinesses({
          token: session.access_token,
        });
        setBusinesses(data);
        
        // Auto-select first business if available and none selected
        if (data.length > 0 && !selectedBusinessId) {
          setSelectedBusinessId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        setBusinesses([]);
        // If no businesses and we have a session, user needs to initialize
        // This will be handled by redirecting to onboarding if needed
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [session?.access_token, selectedBusinessId]);

  const value = useMemo(
    () => ({
      businesses,
      selectedBusinessId,
      setSelectedBusinessId,
      loading,
    }),
    [businesses, selectedBusinessId, loading]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error('useBusinessContext must be used within BusinessProvider');
  }
  return ctx;
}
