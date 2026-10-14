import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsAutosave } from '../../../hooks/useSettingsAutosave';
import {
  createBehaviorAutosaveState,
  expectTextOrder,
  handleChange,
  renderSettings,
} from './AuthenticationSettings.behaviorTestUtils';

vi.mock('../../../hooks/useSettingsAutosave', () => ({
  useSettingsAutosave: vi.fn(),
}));

describe('AuthenticationSettings behavior panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsAutosave).mockReturnValue(createBehaviorAutosaveState());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps Pay wiring and plan seats out of the enabled subscription flow', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const state = createBehaviorAutosaveState();
    vi.mocked(useSettingsAutosave).mockReturnValue({
      ...state,
      edits: { subscription_selection_required: 'true' },
    });
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expect(screen.getByText('Plan chooser page')).toBeInTheDocument();
    expect(screen.queryByText('Cedros Pay location')).not.toBeInTheDocument();
    expect(screen.queryByText('Team seats per plan')).not.toBeInTheDocument();
    expect(screen.queryByText('Not in Cedros Pay')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the admin runtime Cedros Pay state to block subscription selection', () => {
    renderSettings({ cedrosPayInstalled: false });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expect(screen.getByRole('heading', { name: 'After login flow' })).toBeInTheDocument();
    expect(screen.queryByText('Subscription selection')).not.toBeInTheDocument();
    expect(screen.getByText('Subscription selection is blocked')).toBeInTheDocument();
    expect(screen.queryByText('Require subscription selection')).not.toBeInTheDocument();
  });

  it('renders social buttons first and redirect as the fixed final step', () => {
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expectTextOrder([
      'Social button order',
      'After login flow',
      'Require subscription selection',
      'Require username selection',
      'Enable welcome page',
      'Prompt profile completion',
      'Redirect URL',
    ]);
    const redirectInput = screen.getByPlaceholderText('Redirect URL');
    expect(redirectInput).toBeEnabled();
    expect(screen.getByRole('list', { name: 'After login flow order' })).not.toContainElement(
      redirectInput
    );
    expect(
      screen.getByText(
        'Final step: send users here after all login and registration steps are complete. Leave empty for the consumer app default.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Changes save automatically.')).not.toBeInTheDocument();
  });

  it('renders behavior controls from a saved custom post-login flow order', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createBehaviorAutosaveState('username,profile,subscription,welcome')
    );
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expectTextOrder([
      'Require username selection',
      'Prompt profile completion',
      'Require subscription selection',
      'Enable welcome page',
      'Redirect URL',
    ]);
  });

  it('persists a new post-login flow order after drag and drop', () => {
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));
    const usernameStep = screen.getByRole('listitem', { name: 'Username selection flow step' });
    const subscriptionStep = screen.getByRole('listitem', {
      name: 'Subscription selection flow step',
    });

    const usernameHandle = usernameStep.querySelector('.cedros-sortable-handle');
    if (!usernameHandle) throw new Error('username reorder handle missing');
    fireEvent.dragStart(usernameHandle);
    fireEvent.dragOver(subscriptionStep);
    fireEvent.drop(subscriptionStep);

    expect(handleChange).toHaveBeenCalledWith(
      'postlogin_flow_order',
      'username,subscription,welcome,profile'
    );
  });

  it('supports keyboard-only reordering with a position announcement', () => {
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move Subscription selection down' }));

    expect(handleChange).toHaveBeenCalledWith(
      'postlogin_flow_order',
      'username,subscription,welcome,profile'
    );
    expect(screen.getByText('Subscription selection moved to position 2 of 4.')).toHaveAttribute(
      'role',
      'status'
    );
  });

  it('keeps blocked subscription selection in its flow position', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createBehaviorAutosaveState('username,subscription,welcome,profile')
    );
    renderSettings({ cedrosPayInstalled: false });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expectTextOrder([
      'Require username selection',
      'Subscription selection is blocked',
      'Enable welcome page',
      'Prompt profile completion',
      'Redirect URL',
    ]);
  });

  it('omits unavailable flow steps instead of rendering handle-only rows', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createBehaviorAutosaveState('subscription,username,welcome,profile', {
        includeSubscription: false,
      })
    );
    renderSettings({ cedrosPayInstalled: true });

    fireEvent.click(screen.getByRole('tab', { name: 'Behavior' }));

    expect(
      screen.queryByRole('listitem', { name: 'Subscription selection flow step' })
    ).not.toBeInTheDocument();
    expectTextOrder([
      'Require username selection',
      'Enable welcome page',
      'Prompt profile completion',
      'Redirect URL',
    ]);
  });
});
