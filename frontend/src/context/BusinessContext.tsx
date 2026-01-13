/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

type Business = { id: string; name: string };

interface BusinessContextValue {
  businesses: Business[];
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

const DEFAULT_BUSINESSES: Business[] = [
  { id: 'biz-1', name: 'Demo Business A' },
  { id: 'biz-2', name: 'Demo Business B' },
];

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [selectedBusinessId, setSelectedBusinessId] = useState(DEFAULT_BUSINESSES[0].id);

  const value = useMemo(
    () => ({
      businesses: DEFAULT_BUSINESSES,
      selectedBusinessId,
      setSelectedBusinessId,
    }),
    [selectedBusinessId]
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
