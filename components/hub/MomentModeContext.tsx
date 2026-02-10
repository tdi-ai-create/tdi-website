'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MomentModeContextValue {
  isMomentModeActive: boolean;
  setMomentModeActive: (active: boolean) => void;
}

const MomentModeContext = createContext<MomentModeContextValue>({
  isMomentModeActive: false,
  setMomentModeActive: () => {},
});

/**
 * Hook to access Moment Mode state
 * When Moment Mode is active, all notifications/toasts should be suppressed
 */
export function useMomentMode() {
  return useContext(MomentModeContext);
}

interface MomentModeProviderProps {
  children: ReactNode;
}

/**
 * Provider for Moment Mode state
 * Should be placed at the root level so all components can access it
 */
export function MomentModeProvider({ children }: MomentModeProviderProps) {
  const [isMomentModeActive, setMomentModeActive] = useState(false);

  return (
    <MomentModeContext.Provider value={{ isMomentModeActive, setMomentModeActive }}>
      {children}
    </MomentModeContext.Provider>
  );
}
