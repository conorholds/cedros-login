/**
 * Component tests for OrgSwitcher
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrgSwitcher } from './OrgSwitcher';
import type { OrgWithMembership } from '../../types';

const ORGS: OrgWithMembership[] = [
  {
    id: 'org-1',
    name: 'Acme',
    slug: 'acme',
    logoUrl: undefined,
    isPersonal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    membership: {
      id: 'membership-1',
      userId: 'user-1',
      orgId: 'org-1',
      role: 'owner',
      joinedAt: '2024-01-01T00:00:00Z',
    },
  },
];

describe('OrgSwitcher', () => {
  it('resets view mode when modal is closed and reopened', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const onCreate = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <OrgSwitcher
        isOpen
        onClose={onClose}
        orgs={ORGS}
        activeOrg={ORGS[0]}
        onSelect={onSelect}
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create new organization' }));
    expect(screen.getByRole('heading', { name: 'Create organization' })).toBeInTheDocument();

    rerender(
      <OrgSwitcher
        isOpen={false}
        onClose={onClose}
        orgs={ORGS}
        activeOrg={ORGS[0]}
        onSelect={onSelect}
        onCreate={onCreate}
      />
    );

    rerender(
      <OrgSwitcher
        isOpen
        onClose={onClose}
        orgs={ORGS}
        activeOrg={ORGS[0]}
        onSelect={onSelect}
        onCreate={onCreate}
      />
    );

    expect(screen.getByRole('heading', { name: 'Switch organization' })).toBeInTheDocument();
  });
});

it('keeps switching errors visible and closes only after a successful retry', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onSelect = vi
    .fn()
    .mockRejectedValueOnce(new Error('Membership was removed'))
    .mockResolvedValueOnce(undefined);
  render(<OrgSwitcher isOpen orgs={ORGS} activeOrg={null} onSelect={onSelect} onClose={onClose} />);
  await user.click(screen.getByRole('button', { name: /Acme/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Membership was removed');
  expect(onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: /Acme/ }));
  expect(onClose).toHaveBeenCalledOnce();
});
