import type { AuthMethod, AuthUser } from '../types';

const CHANNEL_NAME = 'cedros_auth_sync';
const AUTH_METHODS: AuthMethod[] = ['email', 'google', 'apple', 'solana', 'webauthn', 'sso'];

type AuthSyncEvent = { type: 'login'; user: AuthUser } | { type: 'logout' } | { type: 'refresh' };

type AuthSyncCallback = (event: AuthSyncEvent) => void;

/**
 * Cross-tab synchronization for auth state using BroadcastChannel.
 */
export class TabSync {
  private channel: BroadcastChannel | null = null;
  private callback: AuthSyncCallback | null = null;
  private boundHandler: ((event: MessageEvent<unknown>) => void) | null = null;

  constructor(scope?: string) {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(scope ? `${CHANNEL_NAME}:${scope}` : CHANNEL_NAME);
      // Store the bound handler so close() can remove the exact listener.
      this.boundHandler = this.handleMessage.bind(this);
      this.channel.addEventListener('message', this.boundHandler);
    }
  }

  /**
   * Handle incoming sync messages.
   * Validate message shape to prevent forged auth state from same-origin XSS.
   */
  private handleMessage(event: MessageEvent<unknown>): void {
    const data = event.data;
    if (!isAuthSyncEvent(data)) return;
    this.callback?.(data);
  }

  /**
   * Set the callback for sync events from other tabs
   */
  setCallback(callback: AuthSyncCallback): void {
    this.callback = callback;
  }

  /**
   * Broadcast login event to other tabs
   */
  broadcastLogin(user: AuthUser): void {
    this.channel?.postMessage({ type: 'login', user });
  }

  /**
   * Broadcast logout event to other tabs
   */
  broadcastLogout(): void {
    this.channel?.postMessage({ type: 'logout' });
  }

  /**
   * Broadcast token refresh event to other tabs
   */
  broadcastRefresh(): void {
    this.channel?.postMessage({ type: 'refresh' });
  }

  /**
   * Close the channel and clean up references.
   */
  close(): void {
    if (this.channel) {
      if (this.boundHandler) {
        this.channel.removeEventListener('message', this.boundHandler);
        this.boundHandler = null;
      }
      this.channel.close();
      this.channel = null;
    }
    this.callback = null;
  }
}

function isAuthSyncEvent(data: unknown): data is AuthSyncEvent {
  if (!isRecord(data) || typeof data.type !== 'string') return false;
  if (data.type === 'logout' || data.type === 'refresh') return true;
  return data.type === 'login' && isAuthUser(data.user);
}

function isAuthUser(user: unknown): user is AuthUser {
  return (
    isRecord(user) &&
    typeof user.id === 'string' &&
    optionalString(user.email) &&
    optionalString(user.name) &&
    optionalString(user.username) &&
    optionalString(user.picture) &&
    optionalString(user.walletAddress) &&
    Array.isArray(user.authMethods) &&
    user.authMethods.every(isAuthMethod) &&
    typeof user.emailVerified === 'boolean' &&
    optionalBoolean(user.totpEnabled) &&
    typeof user.createdAt === 'string' &&
    typeof user.updatedAt === 'string' &&
    optionalString(user.welcomeCompletedAt) &&
    optionalString(user.referralCode)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthMethod(value: unknown): value is AuthMethod {
  return typeof value === 'string' && AUTH_METHODS.some((method) => method === value);
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function optionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean';
}
