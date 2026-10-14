import { createContext, useContext, type ReactNode } from 'react';

export interface CedrosLoginAdminOverlayHost {
  show: (ownerId: string, content: ReactNode) => void;
  hide: (ownerId: string) => void;
}

export const CedrosLoginAdminOverlayContext = createContext<CedrosLoginAdminOverlayHost | null>(
  null
);

export function useCedrosLoginAdminOverlay(): CedrosLoginAdminOverlayHost | null {
  return useContext(CedrosLoginAdminOverlayContext);
}
