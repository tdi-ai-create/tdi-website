'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { HubProfile } from '@/lib/hub-auth';
import type { User } from '@supabase/supabase-js';

interface HubContextValue {
  user: User | null;
  profile: HubProfile | null;
  isLoading: boolean;
}

const HubContext = createContext<HubContextValue>({
  user: null,
  profile: null,
  isLoading: true,
});

export function useHub() {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}

interface HubProviderProps {
  children: ReactNode;
  user: User | null;
  profile: HubProfile | null;
  isLoading?: boolean;
}

export function HubProvider({ children, user, profile, isLoading = false }: HubProviderProps) {
  return (
    <HubContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </HubContext.Provider>
  );
}
