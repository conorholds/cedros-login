import type { AuthMethod } from '../../../types';

export const TEST_SERVER_URL = 'http://localhost:8080';
export const TEST_SERVER_AUTH_URL = `${TEST_SERVER_URL}/auth`;

export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  name: 'Test User',
  picture: null as string | null,
  emailVerified: false,
  authMethods: ['email'] as AuthMethod[],
};

/** A wallet the /solana/link mock treats as belonging to another account (409). */
export const TAKEN_WALLET_ADDRESS = 'So11111111111111111111111111111111111111112';

export const mockTokens = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 900,
};

export const sessions = new Map<
  string,
  { userId: string; refreshToken: string; authMethods: AuthMethod[] }
>();

export const registeredUsers = new Map<
  string,
  { email: string; passwordHash: string; name?: string }
>();

export function setSession(
  tokens: { accessToken: string; refreshToken: string },
  user: { id: string; authMethods?: AuthMethod[] }
) {
  sessions.set(tokens.accessToken, {
    userId: user.id,
    refreshToken: tokens.refreshToken,
    authMethods: user.authMethods ?? [],
  });
}

export function isPasswordBackedSession(session: { authMethods: AuthMethod[] }): boolean {
  return session.authMethods.some((method) => method === 'email' || method === 'password');
}

export type WalletMockState = {
  enrolled: boolean;
  unlocked: boolean;
  solanaPubkey?: string;
  authMethod?: 'password' | 'passkey';
  hasExternalWallet: boolean;
};

export const walletGlobal = globalThis as typeof globalThis & {
  __CEDROS_WALLET_STATE__?: WalletMockState;
};

export const getWalletState = (): WalletMockState =>
  walletGlobal.__CEDROS_WALLET_STATE__ ?? {
    enrolled: true,
    unlocked: true,
    solanaPubkey: 'SoLaNaWaLLeTaDDrEsS12345678901234567890123',
    authMethod: 'passkey',
    hasExternalWallet: false,
  };

export const setWalletState = (next: WalletMockState) => {
  walletGlobal.__CEDROS_WALLET_STATE__ = next;
};

export function resetMockState() {
  sessions.clear();
  registeredUsers.clear();
  walletGlobal.__CEDROS_WALLET_STATE__ = undefined;
  registeredUsers.set('test@example.com', {
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
  });
}
