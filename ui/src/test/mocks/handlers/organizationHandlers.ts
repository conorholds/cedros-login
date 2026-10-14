import { http, HttpResponse } from 'msw';

import { mockUser, TEST_SERVER_AUTH_URL, TEST_SERVER_URL } from './mockState';

export const organizationHandlers = [
  // =============================================================================
  // ORGANIZATION HANDLERS (for Admin stories)
  // =============================================================================

  // List organizations (returns { orgs: [...] })
  http.get(`${TEST_SERVER_URL}/orgs`, () => {
    return HttpResponse.json({
      orgs: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Acme Corp',
          slug: 'acme-corp',
          role: 'owner',
          isPersonal: false,
          createdAt: new Date('2024-01-01').toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Personal',
          slug: 'personal',
          role: 'owner',
          isPersonal: true,
          createdAt: new Date('2024-01-01').toISOString(),
        },
      ],
    });
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/orgs`, () => {
    return HttpResponse.json({
      orgs: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Acme Corp',
          slug: 'acme-corp',
          role: 'owner',
          isPersonal: false,
          createdAt: new Date('2024-01-01').toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Personal',
          slug: 'personal',
          role: 'owner',
          isPersonal: true,
          createdAt: new Date('2024-01-01').toISOString(),
        },
      ],
    });
  }),

  // Get user permissions (POST /permissions with { orgId })
  http.post(`${TEST_SERVER_AUTH_URL}/permissions`, () => {
    return HttpResponse.json({
      role: 'owner',
      permissions: [
        'member:read',
        'member:invite',
        'member:remove',
        'member:role_change',
        'invite:create',
        'invite:cancel',
        'org:read',
        'org:update',
        'org:delete',
      ],
    });
  }),

  http.post(`${TEST_SERVER_URL}/permissions`, () => {
    return HttpResponse.json({
      role: 'owner',
      permissions: [
        'member:read',
        'member:invite',
        'member:remove',
        'member:role_change',
        'invite:create',
        'invite:cancel',
        'org:read',
        'org:update',
        'org:delete',
      ],
    });
  }),

  // List organization members
  http.get(`${TEST_SERVER_AUTH_URL}/orgs/:orgId/members`, () => {
    return HttpResponse.json({
      members: [
        {
          id: 'member-1',
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: 'owner',
          joinedAt: new Date('2024-01-01').toISOString(),
        },
        {
          id: 'member-2',
          userId: 'user-2',
          email: 'john@example.com',
          name: 'John Smith',
          role: 'admin',
          joinedAt: new Date('2024-02-15').toISOString(),
        },
        {
          id: 'member-3',
          userId: 'user-3',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'member',
          joinedAt: new Date('2024-03-20').toISOString(),
        },
      ],
      total: 3,
    });
  }),

  http.get(`${TEST_SERVER_URL}/orgs/:orgId/members`, () => {
    return HttpResponse.json({
      members: [
        {
          id: 'member-1',
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: 'owner',
          joinedAt: new Date('2024-01-01').toISOString(),
        },
        {
          id: 'member-2',
          userId: 'user-2',
          email: 'john@example.com',
          name: 'John Smith',
          role: 'admin',
          joinedAt: new Date('2024-02-15').toISOString(),
        },
        {
          id: 'member-3',
          userId: 'user-3',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'member',
          joinedAt: new Date('2024-03-20').toISOString(),
        },
      ],
      total: 3,
    });
  }),

  // List organization invites
  http.get(`${TEST_SERVER_AUTH_URL}/orgs/:orgId/invites`, () => {
    return HttpResponse.json({
      invites: [
        {
          id: 'invite-1',
          email: 'newuser@example.com',
          role: 'member',
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      total: 1,
    });
  }),

  http.get(`${TEST_SERVER_URL}/orgs/:orgId/invites`, () => {
    return HttpResponse.json({
      invites: [
        {
          id: 'invite-1',
          email: 'newuser@example.com',
          role: 'member',
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      total: 1,
    });
  }),

  // Create invite
  http.post(`${TEST_SERVER_AUTH_URL}/orgs/:orgId/invites`, async ({ request }) => {
    const body = (await request.json()) as { email: string; role: string };
    return HttpResponse.json({
      id: `invite-${Date.now()}`,
      email: body.email,
      role: body.role,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  http.post(`${TEST_SERVER_URL}/orgs/:orgId/invites`, async ({ request }) => {
    const body = (await request.json()) as { email: string; role: string };
    return HttpResponse.json({
      id: `invite-${Date.now()}`,
      email: body.email,
      role: body.role,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),
];
