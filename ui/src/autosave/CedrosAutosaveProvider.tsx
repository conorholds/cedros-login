/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { createIndexedDbAutosavePersistence } from './persistence';
import type {
  CedrosAutosavePersistence,
  CedrosAutosaveProviderProps,
  CedrosAutosaveProviderValue,
} from './types';

const defaultPersistence = createIndexedDbAutosavePersistence();

const CedrosAutosaveContext = createContext<CedrosAutosaveProviderValue>({
  storage: defaultPersistence,
});

export function CedrosAutosaveProvider({
  children,
  emitTelemetry,
  storage,
}: CedrosAutosaveProviderProps) {
  const value = useMemo(
    () => ({ emitTelemetry, storage: storage ?? defaultPersistence }),
    [emitTelemetry, storage]
  );

  return <CedrosAutosaveContext.Provider value={value}>{children}</CedrosAutosaveContext.Provider>;
}

export function useCedrosAutosaveContext(): CedrosAutosaveProviderValue {
  const value = useContext(CedrosAutosaveContext);
  return value.storage ? value : { ...value, storage: defaultPersistence };
}

export function useCedrosAutosaveTelemetry() {
  return useCedrosAutosaveContext().emitTelemetry;
}

export function createCedrosAutosavePersistence(): CedrosAutosavePersistence {
  return createIndexedDbAutosavePersistence();
}
