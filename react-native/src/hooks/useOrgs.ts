import { useExternalEffect } from "./effects";
import { useCallback, useState, useRef } from "react";
import { useProviderOrgsApi } from "../context/ApiServicesContext";
import { useCedrosLogin } from "../context/CedrosLoginProvider";
import type { Organization, OrgWithMembership, AuthError } from "../types";

export interface UseOrgsReturn {
  orgs: OrgWithMembership[];
  activeOrg: OrgWithMembership | null;
  isLoading: boolean;
  error: AuthError | null;
  switchOrg: (orgId: string) => Promise<void>;
  createOrg: (name: string) => Promise<Organization>;
  clearError: () => void;
  refreshOrgs: () => Promise<void>;
}

export function useOrgs(): UseOrgsReturn {
  const orgsApi = useProviderOrgsApi();
  const { user, isAuthenticated } = useCedrosLogin();
  const userId = user?.id;
  const [orgs, setOrgs] = useState<OrgWithMembership[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgWithMembership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const requestIdRef = useRef(0);

  const refreshOrgs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!isAuthenticated || !userId) {
      setOrgs([]);
      setActiveOrg(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await orgsApi.listOrgs();
      if (requestId === requestIdRef.current) {
        const mapped: OrgWithMembership[] = response.orgs.map((o) => ({
          ...o,
          membership: { role: o.role },
        }));
        setOrgs(mapped);
        setActiveOrg(mapped[0] ?? null);
      }
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: "SERVER_ERROR", message: err.message }
          : { code: "SERVER_ERROR", message: "Failed to load organizations" };
      if (requestId === requestIdRef.current) {
        setError(authError);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, orgsApi, userId]);

  useExternalEffect(() => {
    refreshOrgs();
    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshOrgs]);

  const switchOrg = useCallback(
    async (orgId: string): Promise<void> => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const response = await orgsApi.switchOrg({ orgId });
        if (requestId === requestIdRef.current) setActiveOrg(response.org);
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "FORBIDDEN", message: err.message }
            : { code: "FORBIDDEN", message: "Failed to switch organization" };
        if (requestId === requestIdRef.current) setError(authError);
        throw err;
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [orgsApi],
  );

  const createOrg = useCallback(
    async (name: string): Promise<Organization> => {
      setIsLoading(true);
      setError(null);
      try {
        const org = await orgsApi.createOrg({ name });
        await refreshOrgs();
        return org;
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "VALIDATION_ERROR", message: err.message }
            : {
                code: "VALIDATION_ERROR",
                message: "Failed to create organization",
              };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgsApi, refreshOrgs],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    orgs,
    activeOrg,
    isLoading,
    error,
    switchOrg,
    createOrg,
    clearError,
    refreshOrgs,
  };
}
