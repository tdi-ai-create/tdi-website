'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { HubProfile } from '@/lib/hub-auth';
import type { User } from '@supabase/supabase-js';

interface HubContextValue {
  user: User | null;
  profile: HubProfile | null;
  isLoading: boolean;
}

// Use undefined as default so the if (!context) guard in useHub() actually fires
// when a component calls useHub() outside a HubProvider tree.
const HubContext = createContext<HubContextValue | undefined>(undefined);

export function useHub() {
  const context = useContext(HubContext);
  if (!context) {
    // Return safe defaults instead of throwing -- prevents white-screen crashes
    // when components render briefly before HubProvider mounts
    return { user: null, profile: null, isLoading: true } as HubContextValue;
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
