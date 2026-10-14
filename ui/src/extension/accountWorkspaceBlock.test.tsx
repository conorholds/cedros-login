import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AccountWorkspaceBlock } from './accountWorkspaceBlock';

// Simulates the interactive island failing in the host (e.g. a chunk in its
// import graph cannot be resolved by the extension runtime loader). The lazy
// module resolves but rendering throws, which exercises the same error
// boundary path as a rejected dynamic import.
vi.mock('./interactiveAccountWorkspace', () => ({
  default: function ExplodingIsland(): never {
    throw new Error('interactive island failed to load');
  },
}));

describe('AccountWorkspaceBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the static shell when the interactive island fails instead of unmounting', async () => {
    // The boundary logs the caught error; keep test output quiet.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <AccountWorkspaceBlock props={{ title: 'Manage your account', body: 'Body copy' }} />
    );

    // The island mounts after the browser-mounted effect, throws, and the
    // boundary must restore the shell rather than leaving an empty root.
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    expect(screen.getByText('Manage your account')).toBeInTheDocument();
    expect(container.querySelector('.cedros-account-workspace-block')).not.toBeNull();
    expect(container).not.toBeEmptyDOMElement();
  });
});
