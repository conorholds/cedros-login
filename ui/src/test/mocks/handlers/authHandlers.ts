import { http, HttpResponse } from 'msw';

import {
  mockTokens,
  mockUser,
  registeredUsers,
  sessions,
  setSession,
  TEST_SERVER_URL,
} from './mockState';

export const authHandlers = [
  // Register
  http.post(`${TEST_SERVER_URL}/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };

    if (registeredUsers.has(body.email)) {
      return HttpResponse.json(
        { code: 'EMAIL_EXISTS', message: 'Email already registered' },
        { status: 409 }
      );
    }

    if (!body.email.includes('@')) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (body.password.length < 10) {
      return HttpResponse.json(
        { code: 'WEAK_PASSWORD', message: 'Password must be at least 10 characters' },
        { status: 400 }
      );
    }

    registeredUsers.set(body.email, {
      email: body.email,
      passwordHash: `hashed-${body.password}`,
      name: body.name,
    });

    const newUser = {
      ...mockUser,
      id: crypto.randomUUID(),
      email: body.email,
      name: body.name || null,
    };

    setSession(mockTokens, newUser);

    return HttpResponse.json(
      {
        user: newUser,
        tokens: mockTokens,
        isNewUser: true,
      },
      { status: 201 }
    );
  }),

  // Login
  http.post(`${TEST_SERVER_URL}/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    const user = registeredUsers.get(body.email);
    if (!user) {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Simple password check for tests
    if (user.passwordHash !== `hashed-${body.password}` && body.password !== 'TestPassword1!') {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const loggedInUser = {
      ...mockUser,
      email: user.email,
      name: user.name || null,
    };

    setSession(mockTokens, loggedInUser);

    return HttpResponse.json({
      user: loggedInUser,
      tokens: mockTokens,
      isNewUser: false,
    });
  }),

  // Get user
  http.get(`${TEST_SERVER_URL}/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ user: mockUser });
  }),

  // Refresh token
  http.post(`${TEST_SERVER_URL}/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };

    // Find session with this refresh token
    let foundSession = false;
    sessions.forEach((session) => {
      if (session.refreshToken === body.refreshToken) {
        foundSession = true;
      }
    });

    if (!foundSession) {
      return HttpResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const newTokens = {
      accessToken: `new-access-token-${Date.now()}`,
      refreshToken: `new-refresh-token-${Date.now()}`,
      expiresIn: 900,
    };

    setSession(newTokens, mockUser);

    return HttpResponse.json({
      tokens: newTokens,
      user: mockUser,
    });
  }),

  // Logout
  http.post(`${TEST_SERVER_URL}/logout`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      sessions.delete(token);
    }

    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Change password (authenticated)
  http.post(`${TEST_SERVER_URL}/change-password`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { currentPassword?: string; newPassword?: string };

    if (!body.currentPassword) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Current password required' },
        { status: 400 }
      );
    }

    if (!body.newPassword) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'New password required' },
        { status: 400 }
      );
    }

    // Simulate wrong current password
    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Validate new password (min 8 chars)
    if (body.newPassword.length < 8) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // Update profile (PATCH /auth/me)
  http.patch(`${TEST_SERVER_URL}/me`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { name?: string; picture?: string };

    // Validate name if provided
    if (body.name !== undefined) {
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      if (trimmed.length > 100) {
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Name must be 100 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate picture URL if provided
    if (body.picture !== undefined && body.picture.trim() !== '') {
      const trimmed = body.picture.trim();
      if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Picture must be a valid URL' },
          { status: 400 }
        );
      }
    }

    // Return updated user
    return HttpResponse.json({
      user: {
        ...mockUser,
        name: body.name !== undefined ? body.name.trim() : mockUser.name,
        picture: body.picture !== undefined ? body.picture.trim() || null : mockUser.picture,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Forgot password
  http.post(`${TEST_SERVER_URL}/forgot-password`, async ({ request }) => {
    const body = (await request.json()) as { email: string };

    if (!body.email.includes('@')) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Always return success (don't reveal if email exists)
    return HttpResponse.json({ message: 'Password reset email sent' });
  }),

  // Reset password
  http.post(`${TEST_SERVER_URL}/reset-password`, async ({ request }) => {
    const body = (await request.json()) as { token?: string; newPassword?: string };
    const newPassword = body.newPassword;

    if (!body.token) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing reset token' },
        { status: 400 }
      );
    }
    if (!newPassword) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing new password' },
        { status: 400 }
      );
    }

    // Simulate invalid/expired token
    if (body.token === 'expired-token') {
      return HttpResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Basic strength check (demo only)
    if (newPassword.length < 10) {
      return HttpResponse.json(
        { code: 'WEAK_PASSWORD', message: 'Password must be at least 10 characters' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'Password reset successfully' });
  }),
];
