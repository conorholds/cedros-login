import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RelyingPartySettings } from './RelyingPartySettings';

const pluginContext = {
  serverUrl: 'https://admin.test',
  getAccessToken: () => 'admin-token',
  hasPermission: () => true,
};

afterEach(() => vi.unstubAllGlobals());

it('configures and verifies Data with membership authority rather than introspection', async () => {
  const fetchMock = vi.fn<typeof fetch>(async (input) => {
    const body = String(input).endsWith('/verify')
      ? {
          relyingPartyId: 'cedros-data',
          diagnostic: 'ready',
          ready: true,
          membership: { status: 404, error: 'not_found' },
        }
      : {
          ready: false,
          relyingParties: [
            {
              relyingPartyId: 'cedros-data',
              displayName: 'Cedros platform',
              ready: false,
              tokenConfigured: false,
              policyConfigured: false,
              validationErrors: ['token_absent', 'policy_absent'],
            },
          ],
        };
    return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<RelyingPartySettings pluginContext={pluginContext} canManage />);

  expect(await screen.findByLabelText(/^Allowed scopes/)).toHaveValue('memberships:read');
  fireEvent.change(screen.getByLabelText('Shared service token'), {
    target: { value: 'data-service-token-at-least-32-bytes' },
  });
  fireEvent.change(screen.getByLabelText(/^Allowed session audiences/), {
    target: { value: 'cedros' },
  });
  fireEvent.change(screen.getByLabelText(/^Allowed organization IDs/), { target: { value: '*' } });
  fireEvent.click(screen.getByRole('button', { name: 'Verify relationship' }));

  expect(
    await screen.findByText(
      'Service authentication and organization membership authorization succeeded.'
    )
  ).toBeInTheDocument();
  const call = fetchMock.mock.calls.find(([input]) => String(input).endsWith('/verify'));
  expect(call).toBeDefined();
  expect(JSON.parse(String(call?.[1]?.body)).requiredScope).toBe('memberships:read');
});
