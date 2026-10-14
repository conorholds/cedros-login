import { createContext, useContext } from 'react';
import type { AuthResponse } from '../types';
import type { DeviceAccountHint, DeviceAccountHintMethod } from '../utils/deviceAccountHint';

export type DeviceSignupMethod = DeviceAccountHintMethod | 'instantLink';

export interface DeviceAccountLinkRequest {
  identifier: string;
  method: DeviceSignupMethod;
  linkExisting: (
    hint: DeviceAccountHint,
    signedInResponse?: AuthResponse
  ) => Promise<AuthResponse | void>;
}

export type DeviceAccountLinkResult =
  | { action: 'create' }
  | { action: 'linked'; response?: AuthResponse };

export interface DeviceAccountLinkContextValue {
  requestDeviceAccountLink: (request: DeviceAccountLinkRequest) => Promise<DeviceAccountLinkResult>;
}

const noopValue: DeviceAccountLinkContextValue = {
  requestDeviceAccountLink: async () => ({ action: 'create' }),
};

export const DeviceAccountLinkContext = createContext<DeviceAccountLinkContextValue | null>(null);

export function useDeviceAccountLink(): DeviceAccountLinkContextValue {
  return useContext(DeviceAccountLinkContext) ?? noopValue;
}
