import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TabSync } from './tabSync';
import type { AuthUser } from '../types';

// Mock BroadcastChannel with addEventListener support
class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Map<string, Set<(event: MessageEvent) => void>> = new Map();

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  postMessage(data: unknown): void {
    // Broadcast to all other instances with same name
    MockBroadcastChannel.instances
      .filter((instance) => instance !== this && instance.name === this.name)
      .forEach((instance) => {
        const event = { data } as MessageEvent;
        // Call onmessage if set
        if (instance.onmessage) {
          instance.onmessage(event);
        }
        // Call addEventListener listeners
        instance.listeners.get('message')?.forEach((listener) => listener(event));
      });
  }

  close(): void {
    const index = MockBroadcastChannel.instances.indexOf(this);
    if (index > -1) {
      MockBroadcastChannel.instances.splice(index, 1);
    }
    this.listeners.clear();
  }

  static clear(): void {
    MockBroadcastChannel.instances = [];
  }
}

describe('TabSync', () => {
  const mockUser: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    authMethods: ['email'],
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  let originalBroadcastChannel: typeof BroadcastChannel;

  beforeEach(() => {
    MockBroadcastChannel.clear();
    // Save original and install mock
    originalBroadcastChannel = window.BroadcastChannel;
    // @ts-expect-error - installing mock
    window.BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(() => {
    // Restore original
    window.BroadcastChannel = originalBroadcastChannel;
  });

  describe('initialization', () => {
    it('should create a TabSync instance', () => {
      const tabSync = new TabSync();
      expect(tabSync).toBeInstanceOf(TabSync);
      tabSync.close();
    });

    it('should handle missing BroadcastChannel gracefully', () => {
      // Delete BroadcastChannel from window to simulate unsupported environment
      const originalBC = window.BroadcastChannel;
      // @ts-expect-error - intentionally deleting for test
      delete window.BroadcastChannel;

      // Should not throw
      const tabSync = new TabSync();
      expect(tabSync).toBeInstanceOf(TabSync);

      // Operations should not throw
      tabSync.broadcastLogin(mockUser);
      tabSync.broadcastLogout();
      tabSync.broadcastRefresh();
      tabSync.close();

      // Restore
      window.BroadcastChannel = originalBC;
    });
  });

  describe('broadcasting', () => {
    it('should broadcast login event to other tabs', () => {
      const tabSync1 = new TabSync();
      const tabSync2 = new TabSync();
      const callback = vi.fn();

      tabSync2.setCallback(callback);
      tabSync1.broadcastLogin(mockUser);

      expect(callback).toHaveBeenCalledWith({
        type: 'login',
        user: mockUser,
      });

      tabSync1.close();
      tabSync2.close();
    });

    it('should broadcast logout event to other tabs', () => {
      const tabSync1 = new TabSync();
      const tabSync2 = new TabSync();
      const callback = vi.fn();

      tabSync2.setCallback(callback);
      tabSync1.broadcastLogout();

      expect(callback).toHaveBeenCalledWith({
        type: 'logout',
      });

      tabSync1.close();
      tabSync2.close();
    });

    it('should broadcast refresh event to other tabs', () => {
      const tabSync1 = new TabSync();
      const tabSync2 = new TabSync();
      const callback = vi.fn();

      tabSync2.setCallback(callback);
      tabSync1.broadcastRefresh();

      expect(callback).toHaveBeenCalledWith({
        type: 'refresh',
      });

      tabSync1.close();
      tabSync2.close();
    });

    it('should not receive own broadcasts', () => {
      const tabSync = new TabSync();
      const callback = vi.fn();

      tabSync.setCallback(callback);
      tabSync.broadcastLogin(mockUser);

      // Should not receive own message
      expect(callback).not.toHaveBeenCalled();

      tabSync.close();
    });
  });

  describe('close', () => {
    it('should stop receiving messages after close', () => {
      const tabSync1 = new TabSync();
      const tabSync2 = new TabSync();
      const callback = vi.fn();

      tabSync2.setCallback(callback);
      tabSync2.close();

      tabSync1.broadcastLogin(mockUser);

      // Should not receive after close
      expect(callback).not.toHaveBeenCalled();

      tabSync1.close();
    });
  });

  describe('multiple tabs', () => {
    it('should sync across multiple tabs', () => {
      const tabSync1 = new TabSync();
      const tabSync2 = new TabSync();
      const tabSync3 = new TabSync();

      const callback2 = vi.fn();
      const callback3 = vi.fn();

      tabSync2.setCallback(callback2);
      tabSync3.setCallback(callback3);

      tabSync1.broadcastLogin(mockUser);

      // Both other tabs should receive
      expect(callback2).toHaveBeenCalledWith({
        type: 'login',
        user: mockUser,
      });
      expect(callback3).toHaveBeenCalledWith({
        type: 'login',
        user: mockUser,
      });

      tabSync1.close();
      tabSync2.close();
      tabSync3.close();
    });
  });
});
