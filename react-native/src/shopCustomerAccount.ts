import { useCallback, useMemo } from "react";
import { useCedrosLogin } from "./context";
import { useProviderAuthApi } from "./context/ApiServicesContext";
import type { AuthUser, UpdateProfileRequest } from "./types";

interface LoginProfileSource {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface CedrosShopCustomerInfo {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  isSignedIn?: boolean;
}

export interface CedrosShopCustomerProfile {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  marketingOptIn?: boolean;
}

export interface CedrosShopCustomerAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  label?: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export interface CedrosShopCustomerAccount {
  profile: CedrosShopCustomerProfile;
  addresses: CedrosShopCustomerAddress[];
}

export interface CedrosShopCustomerProfileUpdate {
  email?: string;
  name?: string;
  phone?: string;
  marketingOptIn?: boolean;
}

export interface CedrosShopCustomerAdapter {
  getCustomerAccount(): Promise<CedrosShopCustomerAccount | null>;
  updateCustomerProfile(
    payload: CedrosShopCustomerProfileUpdate,
  ): Promise<CedrosShopCustomerProfile>;
}

export interface CedrosShopCustomerBindings {
  customer: CedrosShopCustomerInfo;
  adapter: CedrosShopCustomerAdapter;
}

export function authUserToShopCustomerInfo(
  user: AuthUser | null,
  isAuthenticated = Boolean(user),
): CedrosShopCustomerInfo {
  if (!isAuthenticated || !user) return { isSignedIn: false };
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isSignedIn: true,
  };
}

export function authUserToShopCustomerProfile(
  user: LoginProfileSource,
): CedrosShopCustomerProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.picture,
  };
}

export function authUserToShopCustomerAccount(
  user: LoginProfileSource,
): CedrosShopCustomerAccount {
  return {
    profile: authUserToShopCustomerProfile(user),
    addresses: [],
  };
}

export function createLoginOwnedShopProfileUpdate(
  payload: CedrosShopCustomerProfileUpdate,
  currentProfile: LoginProfileSource,
): UpdateProfileRequest | null {
  const unsupported = unsupportedProfileFields(payload, currentProfile);
  if (unsupported.length) {
    throw new Error(
      `Cedros Login cannot update Shop profile field(s) through this adapter: ${unsupported.join(", ")}`,
    );
  }

  const nextName = normalizeOptionalText(payload.name);
  if (
    nextName === undefined ||
    nextName === normalizeOptionalText(currentProfile.name)
  ) {
    return null;
  }
  return { name: nextName };
}

/** Returns Shop-compatible customer context and adapter methods backed by Cedros Login. */
export function useCedrosShopCustomerBindings(): CedrosShopCustomerBindings {
  const { user, isAuthenticated, refreshUser } = useCedrosLogin();
  const authApi = useProviderAuthApi();

  const getCustomerAccount = useCallback(async () => {
    if (!isAuthenticated || !user) return null;
    return authUserToShopCustomerAccount(user);
  }, [isAuthenticated, user]);

  const updateCustomerProfile = useCallback(
    async (payload: CedrosShopCustomerProfileUpdate) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be authenticated to update customer profile");
      }

      const update = createLoginOwnedShopProfileUpdate(payload, user);
      if (!update) return authUserToShopCustomerProfile(user);

      const updated = await authApi.updateProfile(update);
      await refreshUser();
      return authUserToShopCustomerProfile(updated);
    },
    [authApi, isAuthenticated, refreshUser, user],
  );

  const adapter = useMemo(
    () => ({ getCustomerAccount, updateCustomerProfile }),
    [getCustomerAccount, updateCustomerProfile],
  );

  return {
    customer: authUserToShopCustomerInfo(user, isAuthenticated),
    adapter,
  };
}

function unsupportedProfileFields(
  payload: CedrosShopCustomerProfileUpdate,
  currentProfile: LoginProfileSource,
): string[] {
  const unsupported: string[] = [];
  const nextEmail = normalizeOptionalEmail(payload.email);
  const currentEmail = normalizeOptionalEmail(currentProfile.email);
  if (nextEmail !== undefined && nextEmail !== currentEmail)
    unsupported.push("email");
  if (normalizeOptionalText(payload.phone) !== undefined)
    unsupported.push("phone");
  if (payload.marketingOptIn !== undefined) unsupported.push("marketingOptIn");
  return unsupported;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOptionalEmail(value: string | undefined): string | undefined {
  return normalizeOptionalText(value)?.toLowerCase();
}
