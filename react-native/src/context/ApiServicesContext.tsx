import React, { createContext, useContext } from "react";
import { getAuthApi, getOrgsApi, type ApiServices } from "../services/api";
import type AuthApi from "../services/api/auth";
import type OrgsApi from "../services/api/orgs";

const ApiServicesContext = createContext<ApiServices | null>(null);

interface ApiServicesProviderProps {
  services: ApiServices;
  children: React.ReactNode;
}

/** Bind package hooks to the client bundle owned by their nearest provider. */
export function ApiServicesProvider({
  services,
  children,
}: ApiServicesProviderProps): React.ReactElement {
  return (
    <ApiServicesContext.Provider value={services}>
      {children}
    </ApiServicesContext.Provider>
  );
}

/** Resolve provider-owned auth, retaining the legacy singleton fallback. */
export function useProviderAuthApi(): AuthApi {
  return useContext(ApiServicesContext)?.auth ?? getAuthApi();
}

/** Resolve provider-owned org access, retaining the legacy singleton fallback. */
export function useProviderOrgsApi(): OrgsApi {
  return useContext(ApiServicesContext)?.orgs ?? getOrgsApi();
}
