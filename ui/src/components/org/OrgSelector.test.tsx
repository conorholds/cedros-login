import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrgSelector } from './OrgSelector';
import type { OrgWithMembership } from '../../types';

const org: OrgWithMembership = {
  id: 'org-1',
  name: 'Acme',
  slug: 'acme',
  logoUrl: 'https://example.com/logo.png',
  isPersonal: false,
  membership: {
    id: 'mem-1',
    orgId: 'org-1',
    userId: 'user-1',
    role: 'admin',
    joinedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('OrgSelector', () => {
  it('renders small org avatars', () => {
    render(<OrgSelector orgs={[org]} activeOrg={org} onSelect={() => {}} />);

    const avatar = screen.getByRole('img', { name: 'Acme' });
    expect(avatar).toHaveClass('cedros-org-avatar');
    expect(avatar).not.toHaveClass('cedros-org-avatar-lg');
  });
});

it('keeps selection failures visible and restores trigger focus on Escape', async () => {
  const { default: userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  render(
    <OrgSelector
      orgs={[org]}
      activeOrg={null}
      onSelect={async () => {
        throw new Error('Try again later');
      }}
    />
  );
  const trigger = screen.getByRole('button', { name: 'Select organization' });
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: /Acme/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Try again later');
  expect(screen.getByRole('group')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('group')).not.toBeInTheDocument();
});

it('restores keyboard focus after an asynchronous successful switch', async () => {
  const { default: userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  render(<OrgSelector orgs={[org]} activeOrg={null} onSelect={async () => {}} />);
  const trigger = screen.getByRole('button', { name: 'Select organization' });
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: /Acme/ }));
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('group')).not.toBeInTheDocument();
});
