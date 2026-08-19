import React, { createContext, useContext, useMemo } from 'react';

type Mode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: Mode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

/** App is locked to light theme for consistent branding across panels. */
export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(
    () => ({
      mode: 'light' as Mode,
      toggleColorMode: () => undefined,
    }),
    [],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export const useColorMode = (): ColorModeContextValue => {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
};
