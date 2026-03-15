"use client";

import * as React from "react";

type FooterWaveOverrideContextValue = {
  setOverride: (color: string | null) => void;
};

const FooterWaveOverrideContext = React.createContext<FooterWaveOverrideContextValue | null>(null);

export function useFooterWaveOverride() {
  return React.useContext(FooterWaveOverrideContext);
}

export function FooterWaveOverrideProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FooterWaveOverrideContextValue;
}) {
  return (
    <FooterWaveOverrideContext.Provider value={value}>
      {children}
    </FooterWaveOverrideContext.Provider>
  );
}
