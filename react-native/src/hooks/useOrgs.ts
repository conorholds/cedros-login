import { useCallback, useState, useEffect, useRef } from "react";
import { orgsAPI } from "../services/api";
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
  const [orgs, setOrgs] = useState<OrgWithMembership[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgWithMembership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const isMountedRef = useRef(true);

  const refreshOrgs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orgsAPI!.listOrgs();
      const current = await orgsAPI!.getCurrentOrg();
      if (isMountedRef.current) {
        setOrgs(response.orgs);
        setActiveOrg(current);
      }
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: "SERVER_ERROR", message: err.message }
          : { code: "SERVER_ERROR", message: "Failed to load organizations" };
      if (isMountedRef.current) {
        setError(authError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refreshOrgs();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshOrgs]);

  const switchOrg = useCallback(async (orgId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orgsAPI!.switchOrg({ orgId });
      setActiveOrg(response.org);
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: "FORBIDDEN", message: err.message }
          : { code: "FORBIDDEN", message: "Failed to switch organization" };
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrg = useCallback(
    async (name: string): Promise<Organization> => {
      setIsLoading(true);
      setError(null);
      try {
        const org = await orgsAPI!.createOrg({ name });
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
    [refreshOrgs],
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
