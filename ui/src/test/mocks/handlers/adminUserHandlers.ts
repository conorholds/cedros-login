import { http, HttpResponse } from 'msw';

import { TEST_SERVER_AUTH_URL, TEST_SERVER_URL } from './mockState';

export const adminUserHandlers = [
  // List user sessions
  http.get(`${TEST_SERVER_URL}/sessions`, () => {
    return HttpResponse.json({
      sessions: [
        {
          id: 'session-1',
          deviceInfo: 'Chrome on macOS',
          ipAddress: '192.168.1.1',
          location: 'San Francisco, CA',
          lastActive: new Date().toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          isCurrent: true,
        },
        {
          id: 'session-2',
          deviceInfo: 'Safari on iPhone',
          ipAddress: '192.168.1.50',
          location: 'San Francisco, CA',
          lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          isCurrent: false,
        },
      ],
    });
  }),

  // =============================================================================
  // ADMIN USER HANDLERS
  // =============================================================================

  // Admin: List all users
  http.get(`${TEST_SERVER_AUTH_URL}/admin/users`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const allUsers = [
      {
        id: 'user-001-abc123def456',
        email: 'alice@example.com',
        emailVerified: true,
        name: 'Alice Johnson',
        picture: 'https://i.pravatar.cc/150?u=alice',
        walletAddress: null,
        googleId: 'google-123',
        authMethods: ['email', 'google'],
        isSystemAdmin: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-06-01T14:20:00Z',
        lastLoginAt: '2024-06-01T14:20:00Z',
      },
      {
        id: 'user-002-xyz789ghi012',
        email: 'bob@example.com',
        emailVerified: true,
        name: 'Bob Smith',
        picture: 'https://i.pravatar.cc/150?u=bob',
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        googleId: null,
        authMethods: ['email', 'solana'],
        isSystemAdmin: false,
        createdAt: '2024-02-20T09:15:00Z',
        updatedAt: '2024-05-10T11:45:00Z',
        lastLoginAt: '2024-05-10T11:45:00Z',
      },
      {
        id: 'user-003-mno345pqr678',
        email: 'charlie@example.com',
        emailVerified: false,
        name: 'Charlie Brown',
        picture: null,
        walletAddress: null,
        googleId: null,
        authMethods: ['email'],
        isSystemAdmin: false,
        createdAt: '2024-03-10T16:00:00Z',
        updatedAt: '2024-03-10T16:00:00Z',
        lastLoginAt: null,
      },
      {
        id: 'user-004-stu901vwx234',
        email: 'diana@company.io',
        emailVerified: true,
        name: 'Diana Prince',
        picture: 'https://i.pravatar.cc/150?u=diana',
        walletAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM6',
        googleId: 'google-456',
        authMethods: ['google', 'solana', 'webauthn'],
        isSystemAdmin: false,
        createdAt: '2024-04-05T08:30:00Z',
        updatedAt: '2024-07-15T09:20:00Z',
        lastLoginAt: '2024-07-15T09:20:00Z',
      },
      {
        id: 'user-005-yza567bcd890',
        email: 'eve@startup.co',
        emailVerified: true,
        name: null,
        picture: null,
        walletAddress: null,
        googleId: 'google-789',
        authMethods: ['google'],
        isSystemAdmin: false,
        createdAt: '2024-05-22T12:00:00Z',
        updatedAt: '2024-05-22T12:00:00Z',
        lastLoginAt: '2024-05-22T12:00:00Z',
      },
    ];

    const paginatedUsers = allUsers.slice(offset, offset + limit);

    return HttpResponse.json({
      users: paginatedUsers,
      total: allUsers.length,
      limit,
      offset,
    });
  }),

  http.get(`${TEST_SERVER_URL}/admin/users`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const allUsers = [
      {
        id: 'user-001-abc123def456',
        email: 'alice@example.com',
        emailVerified: true,
        name: 'Alice Johnson',
        picture: 'https://i.pravatar.cc/150?u=alice',
        walletAddress: null,
        googleId: 'google-123',
        authMethods: ['email', 'google'],
        isSystemAdmin: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-06-01T14:20:00Z',
        lastLoginAt: '2024-06-01T14:20:00Z',
      },
      {
        id: 'user-002-xyz789ghi012',
        email: 'bob@example.com',
        emailVerified: true,
        name: 'Bob Smith',
        picture: 'https://i.pravatar.cc/150?u=bob',
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        googleId: null,
        authMethods: ['email', 'solana'],
        isSystemAdmin: false,
        createdAt: '2024-02-20T09:15:00Z',
        updatedAt: '2024-05-10T11:45:00Z',
        lastLoginAt: '2024-05-10T11:45:00Z',
      },
      {
        id: 'user-003-mno345pqr678',
        email: 'charlie@example.com',
        emailVerified: false,
        name: 'Charlie Brown',
        picture: null,
        walletAddress: null,
        googleId: null,
        authMethods: ['email'],
        isSystemAdmin: false,
        createdAt: '2024-03-10T16:00:00Z',
        updatedAt: '2024-03-10T16:00:00Z',
        lastLoginAt: null,
      },
      {
        id: 'user-004-stu901vwx234',
        email: 'diana@company.io',
        emailVerified: true,
        name: 'Diana Prince',
        picture: 'https://i.pravatar.cc/150?u=diana',
        walletAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM6',
        googleId: 'google-456',
        authMethods: ['google', 'solana', 'webauthn'],
        isSystemAdmin: false,
        createdAt: '2024-04-05T08:30:00Z',
        updatedAt: '2024-07-15T09:20:00Z',
        lastLoginAt: '2024-07-15T09:20:00Z',
      },
      {
        id: 'user-005-yza567bcd890',
        email: 'eve@startup.co',
        emailVerified: true,
        name: null,
        picture: null,
        walletAddress: null,
        googleId: 'google-789',
        authMethods: ['google'],
        isSystemAdmin: false,
        createdAt: '2024-05-22T12:00:00Z',
        updatedAt: '2024-05-22T12:00:00Z',
        lastLoginAt: '2024-05-22T12:00:00Z',
      },
    ];

    const paginatedUsers = allUsers.slice(offset, offset + limit);

    return HttpResponse.json({
      users: paginatedUsers,
      total: allUsers.length,
      limit,
      offset,
    });
  }),

  // Admin: Get user stats by auth method
  http.get(`${TEST_SERVER_AUTH_URL}/admin/users/stats`, () => {
    return HttpResponse.json({
      total: 142,
      verified: 118,
      newAccounts7d: 9,
      newAccounts30d: 31,
      authMethodCounts: {
        email: 85,
        google: 42,
        apple: 8,
        solana: 25,
        webauthn: 12,
        sso: 3,
      },
    });
  }),

  http.get(`${TEST_SERVER_URL}/admin/users/stats`, () => {
    return HttpResponse.json({
      total: 142,
      verified: 118,
      newAccounts7d: 9,
      newAccounts30d: 31,
      authMethodCounts: {
        email: 85,
        google: 42,
        apple: 8,
        solana: 25,
        webauthn: 12,
        sso: 3,
      },
    });
  }),

  // Admin: Get specific user (with /auth prefix)
  http.get(`${TEST_SERVER_AUTH_URL}/admin/users/:userId`, ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      id: userId,
      email: 'alice@example.com',
      emailVerified: true,
      name: 'Alice Johnson',
      picture: 'https://i.pravatar.cc/150?u=alice',
      walletAddress: null,
      googleId: 'google-123',
      authMethods: ['email', 'google'],
      isSystemAdmin: false,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-06-01T14:20:00Z',
      lastLoginAt: '2024-06-01T14:20:00Z',
    });
  }),

  // Admin: Set system admin status (with /auth prefix)
  http.patch(`${TEST_SERVER_AUTH_URL}/admin/users/:userId/system-admin`, async ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      message: `System admin status updated for user ${userId}`,
    });
  }),

  // Admin: Update user profile (with /auth prefix)
  http.patch(`${TEST_SERVER_AUTH_URL}/admin/users/:userId`, async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      emailVerified?: boolean;
    };
    return HttpResponse.json({
      id: userId,
      email: body.email || 'user@example.com',
      emailVerified: body.emailVerified ?? true,
      name: body.name || 'Updated User',
      picture: null,
      walletAddress: null,
      googleId: null,
      authMethods: ['email'],
      isSystemAdmin: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });
  }),

  // Admin: Delete user (with /auth prefix)
  http.delete(`${TEST_SERVER_AUTH_URL}/admin/users/:userId`, async ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      message: `User ${userId} deleted successfully`,
    });
  }),

  // Admin: Force password reset (with /auth prefix)
  http.post(
    `${TEST_SERVER_AUTH_URL}/admin/users/:userId/force-password-reset`,
    async ({ params }) => {
      const { userId } = params;
      return HttpResponse.json({
        message: `Password reset email queued for user ${userId}`,
      });
    }
  ),

  // Admin: Get specific user
  http.get(`${TEST_SERVER_URL}/admin/users/:userId`, ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      id: userId,
      email: 'user@example.com',
      emailVerified: true,
      name: 'Test User',
      picture: null,
      walletAddress: null,
      googleId: null,
      authMethods: ['email'],
      isSystemAdmin: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  }),

  // Admin: Set system admin status
  http.patch(`${TEST_SERVER_URL}/admin/users/:userId/system-admin`, async ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      message: `System admin status updated for user ${userId}`,
    });
  }),

  // Admin: Update user profile
  http.patch(`${TEST_SERVER_URL}/admin/users/:userId`, async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      emailVerified?: boolean;
    };
    return HttpResponse.json({
      id: userId,
      email: body.email || 'user@example.com',
      emailVerified: body.emailVerified ?? true,
      name: body.name || 'Updated User',
      picture: null,
      walletAddress: null,
      googleId: null,
      authMethods: ['email'],
      isSystemAdmin: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });
  }),

  // Admin: Delete user
  http.delete(`${TEST_SERVER_URL}/admin/users/:userId`, async ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      message: `User ${userId} deleted successfully`,
    });
  }),

  // Admin: Force password reset
  http.post(`${TEST_SERVER_URL}/admin/users/:userId/force-password-reset`, async ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      message: `Password reset email queued for user ${userId}`,
    });
  }),
];
