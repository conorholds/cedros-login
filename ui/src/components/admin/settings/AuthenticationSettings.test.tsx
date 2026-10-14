import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CedrosLoginAdminRuntimeProvider } from '../../../admin/CedrosLoginAdminRuntimeProvider';
import type { AdminSectionProps } from '../../../admin/types';
import type { InviteCode, SystemSetting } from '../../../types';
import {
  useSettingsAutosave,
  type UseSettingsAutosaveReturn,
} from '../../../hooks/useSettingsAutosave';
import { AuthenticationSettings } from './AuthenticationSettings';

vi.mock('../../../hooks/useSettingsAutosave', () => ({
  useSettingsAutosave: vi.fn(),
}));

const listAdminCodesMock = vi.fn();
const createAdminCodeMock = vi.fn();
const updateAdminCodeMock = vi.fn();
const deleteAdminCodeMock = vi.fn();
const getEarlyAccessStateMock = vi.fn();
const setEarlyAccessEnabledMock = vi.fn();

vi.mock('../../../utils/inviteCodeApi', () => {
  class MockInviteCodeApiClient {
    listAdminCodes = listAdminCodesMock;
    createAdminCode = createAdminCodeMock;
    updateAdminCode = updateAdminCodeMock;
    deleteAdminCode = deleteAdminCodeMock;
  }

  return { InviteCodeApiClient: MockInviteCodeApiClient };
});

const fetchSettings = vi.fn();
const handleChange = vi.fn();

describe('AuthenticationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsAutosave).mockReturnValue(createAutosaveState());
    listAdminCodesMock.mockResolvedValue({ codes: [] });
    createAdminCodeMock.mockResolvedValue(inviteCode());
    updateAdminCodeMock.mockImplementation(async (_id, request) => ({
      ...inviteCode(),
      ...request,
    }));
    deleteAdminCodeMock.mockResolvedValue(undefined);
    getEarlyAccessStateMock.mockResolvedValue(earlyAccessState());
    setEarlyAccessEnabledMock.mockResolvedValue(earlyAccessState({ enabled: true }));
  });

  it.each([
    ['email enabled', {}],
    ['no methods enabled', { auth_email_enabled: 'false' }],
    ['incomplete Google configuration', { auth_google_enabled: 'true', auth_google_client_id: '' }],
  ])('renders methods without the readiness box with %s', (_name, edits) => {
    vi.mocked(useSettingsAutosave).mockReturnValue(createAutosaveState({ edits }));
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Methods' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('switch', { name: 'Email' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sign-in readiness' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review methods' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send test email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Preview sign-in' })).not.toBeInTheDocument();
  });

  it('renders readable provider configuration links', () => {
    renderSettings();
    expect(
      screen.getByRole('link', { name: 'Google Cloud Console > Credentials' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apple Developer > Identifiers' })).toBeInTheDocument();
    expect(screen.queryByText(/&gt;/)).not.toBeInTheDocument();
  });

  it('does not claim early access is unavailable while the host state loads', async () => {
    let resolveState: (state: ReturnType<typeof earlyAccessState>) => void = () => {};
    getEarlyAccessStateMock.mockReturnValue(
      new Promise((resolve) => {
        resolveState = resolve;
      })
    );
    renderSettings({ earlyAccessHost: createEarlyAccessHost() });

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    // Loading copy must already be the settled copy, or the card grows when state lands.
    const description = await screen.findByText(/Let invited members sign up/);
    expect(
      screen.queryByText(/Available when the Cedros platform host provides waitlist controls/)
    ).not.toBeInTheDocument();

    resolveState(earlyAccessState());

    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Early access mode' })).toBeEnabled()
    );
    expect(description).toHaveTextContent(/Let invited members sign up/);
  });

  it('renders invite codes as a pill tab and shows the real panel when selected', async () => {
    renderSettings();

    const inviteCodesTab = screen.getByRole('tab', { name: 'Invite codes' });
    expect(inviteCodesTab).toHaveClass('cedros-admin-tab');
    expect(inviteCodesTab).not.toHaveClass('cedros-admin-tab-active');
    expect(screen.queryByRole('heading', { name: 'Invite codes' })).not.toBeInTheDocument();

    fireEvent.click(inviteCodesTab);

    expect(inviteCodesTab).toHaveClass('cedros-admin-tab-active');
    expect(screen.queryByRole('heading', { name: 'Invite codes' })).not.toBeInTheDocument();
    expect(await screen.findByRole('switch', { name: 'Require invite codes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add custom code' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Custom code')).not.toBeInTheDocument();
    const emptyCopy = await screen.findByText('No custom invite codes have been created.');
    expect(emptyCopy.closest('.cedros-data-table-wrap')).toBeInTheDocument();
    expect(emptyCopy.closest('.cedros-data-empty-state')).toHaveClass(
      'cedros-data-empty-state--in-table'
    );
    expect(screen.getByRole('table')).toContainElement(emptyCopy);
    expect(emptyCopy.closest('td')).toHaveAttribute('colspan', '8');
    expect(listAdminCodesMock).toHaveBeenCalledTimes(1);
  });

  it('configures signup limits', () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Signup limits' }));

    const enabled = screen.getByRole('switch', { name: 'Signup limits' });
    expect(enabled).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Maximum signups')).toBeInTheDocument();
    const showRemaining = screen.getByRole('switch', { name: 'Show remaining spots' });
    expect(showRemaining).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(enabled);
    expect(handleChange).toHaveBeenCalledWith('signup_limit_enabled', 'false');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'weekly' } });
    expect(handleChange).toHaveBeenCalledWith('signup_limit_period', 'weekly');

    const maximum = screen.getByRole('spinbutton');
    expect(maximum).toHaveAttribute('min', '1');
    expect(maximum).toHaveAttribute('max', '1000000');
    fireEvent.change(maximum, { target: { value: '250' } });
    expect(handleChange).toHaveBeenCalledWith('signup_limit_max', '250');

    fireEvent.click(showRemaining);
    expect(handleChange).toHaveBeenCalledWith('signup_limit_show_remaining', 'true');
  });

  it('shows host-backed early access beside invite codes and refreshes its prerequisite', async () => {
    renderSettings({ earlyAccessHost: createEarlyAccessHost() });

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    const earlyAccess = await screen.findByRole('switch', { name: 'Early access mode' });
    expect(earlyAccess).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Require invite codes' })).not.toBeChecked();

    fireEvent.click(earlyAccess);

    await waitFor(() => expect(setEarlyAccessEnabledMock).toHaveBeenCalledWith(true));
    expect(earlyAccess).toBeChecked();
    expect(fetchSettings).toHaveBeenCalledTimes(2);
  });

  it('does not disable invite-code policy when Early Access is disabled', async () => {
    getEarlyAccessStateMock.mockResolvedValue(earlyAccessState({ enabled: true }));
    setEarlyAccessEnabledMock.mockResolvedValue(earlyAccessState({ enabled: false }));
    renderSettings({ earlyAccessHost: createEarlyAccessHost() });

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    const earlyAccess = await screen.findByRole('switch', { name: 'Early access mode' });
    fireEvent.click(earlyAccess);

    await waitFor(() => expect(setEarlyAccessEnabledMock).toHaveBeenCalledWith(false));
    expect(handleChange).not.toHaveBeenCalledWith('invite_codes_enabled', expect.anything());
    expect(fetchSettings).toHaveBeenCalledTimes(1);
  });

  it('keeps early access off when the host update fails', async () => {
    setEarlyAccessEnabledMock.mockRejectedValue(new Error('Cedros platform could not save the mode.'));
    renderSettings({ earlyAccessHost: createEarlyAccessHost() });

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    const earlyAccess = await screen.findByRole('switch', { name: 'Early access mode' });
    fireEvent.click(earlyAccess);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cedros platform could not save the mode.'
    );
    expect(earlyAccess).not.toBeChecked();
  });

  it('requires the host site to be in Waitlist mode before early access can be enabled', async () => {
    getEarlyAccessStateMock.mockResolvedValue(earlyAccessState({ waitlistModeEnabled: false }));
    renderSettings({ earlyAccessHost: createEarlyAccessHost() });

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    const earlyAccess = await screen.findByRole('switch', { name: 'Early access mode' });
    expect(earlyAccess).toBeDisabled();
    expect(screen.getByText(/Switch the site to Waitlist mode/)).toBeInTheDocument();
  });

  it('creates a custom invite code from a modal', async () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    await screen.findByText('No custom invite codes have been created.');
    fireEvent.click(screen.getByRole('button', { name: 'Add custom code' }));
    fireEvent.change(screen.getByLabelText('Custom code'), { target: { value: 'welcome' } });
    fireEvent.change(screen.getByLabelText('Max uses'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create invite code' }));

    expect(await screen.findByText('WELCOME')).toBeInTheDocument();
    expect(createAdminCodeMock).toHaveBeenCalledWith({
      code: 'welcome',
      maxUses: 10,
      startsAt: null,
      expiresAt: null,
      discountPercent: null,
      discountMonths: null,
    });
  });

  it('submits the fixed-month offer from the admin form', async () => {
    renderSettings();
    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    await screen.findByText('No custom invite codes have been created.');
    fireEvent.click(screen.getByRole('button', { name: 'Add custom code' }));
    fireEvent.change(screen.getByLabelText('Custom code'), { target: { value: 'FREE3' } });
    fireEvent.change(screen.getByLabelText('Subscription discount (% off)'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Discount duration (months)'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create invite code' }));
    await waitFor(() =>
      expect(createAdminCodeMock).toHaveBeenCalledWith({
        code: 'FREE3',
        maxUses: null,
        startsAt: null,
        expiresAt: null,
        discountPercent: 100,
        discountMonths: 3,
      })
    );
  });

  it('loads a saved term and allows switching it back to forever', async () => {
    listAdminCodesMock.mockResolvedValue({
      codes: [{ ...inviteCode(), discountPercent: 50, discountMonths: 3 }],
    });
    renderSettings();
    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    await screen.findByText('WELCOME');
    fireEvent.click(screen.getByRole('button', { name: 'Edit invite code WELCOME' }));
    expect(screen.getByLabelText('Discount duration (months)')).toHaveValue(3);
    fireEvent.change(screen.getByLabelText('Discount duration (months)'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save invite code' }));
    await waitFor(() =>
      expect(updateAdminCodeMock).toHaveBeenCalledWith(inviteCode().id, { discountMonths: null })
    );
  });

  it('focuses the invite-code form and restores focus when Escape closes it', async () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    await screen.findByText('No custom invite codes have been created.');
    const opener = screen.getByRole('button', { name: 'Add custom code' });
    opener.focus();
    fireEvent.click(opener);

    expect(screen.getByLabelText('Custom code')).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Create invite code' })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('hides user-issued invite code limits until user invite codes are enabled', async () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    expect(await screen.findByText('Give users invite codes')).toBeInTheDocument();
    expect(screen.queryByText('Codes per user')).not.toBeInTheDocument();
    expect(screen.queryByText('User code reset interval')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Give users invite codes' }));

    expect(handleChange).toHaveBeenCalledWith('invite_codes_users_can_issue', 'true');
  });

  it('does not render manual reset or save buttons for autosaved auth changes', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createAutosaveState({ autosaveStatus: 'debouncing' })
    );
    renderSettings();
    expect(
      screen.queryByRole('button', { name: /^(Reset|Save Changes)$/ })
    ).not.toBeInTheDocument();
  });

  it('keeps the page frame and retries the existing settings request after an error', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createAutosaveState({ error: new Error('raw backend details') })
    );
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Cedros couldn't load authentication settings"
    );
    expect(screen.queryByText('raw backend details')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(fetchSettings).toHaveBeenCalledTimes(2);
  });

  it('renders a stable page-shaped skeleton during initial load', () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createAutosaveState({ settings: {}, isLoading: true })
    );

    renderSettings();

    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByText('Loading settings…')).toBeInTheDocument();
    expect(document.querySelectorAll('.cedros-login-admin-skeleton')).toHaveLength(3);
    expect(screen.queryByRole('heading', { name: 'Sign-in readiness' })).not.toBeInTheDocument();
  });

  it('shows user-issued invite code limits inside the enabled card', async () => {
    vi.mocked(useSettingsAutosave).mockReturnValue(
      createAutosaveState({ edits: { invite_codes_users_can_issue: 'true' } })
    );
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    const issueCodesCard = (await screen.findByText('Give users invite codes')).closest(
      '.cedros-auth-method-card'
    );
    if (!issueCodesCard) throw new Error('give users invite codes card missing');

    expect(within(issueCodesCard as HTMLElement).getByText('Codes per user')).toBeInTheDocument();
    expect(
      within(issueCodesCard as HTMLElement).getByText('User code reset interval')
    ).toBeInTheDocument();
  });

  it('shows existing custom invite codes in a stats table with actions', async () => {
    const startsAt = '2026-01-02T03:04:05.000Z';
    const expiresAt = '2026-01-03T03:04:05.000Z';
    listAdminCodesMock.mockResolvedValue({
      codes: [
        inviteCode({ usesCount: 3, maxUses: 12, active: false }),
        inviteCode({ id: 'code-2', code: 'DATED', startsAt, expiresAt }),
      ],
    });
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));

    expect(await screen.findByRole('columnheader', { name: 'Current uses' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Max uses' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Any time')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
    const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
    expect(screen.getByText(dateTime.format(new Date(startsAt)))).toBeInTheDocument();
    expect(screen.getByText(dateTime.format(new Date(expiresAt)))).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit invite code WELCOME' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite code WELCOME actions' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete invite code' })).not.toBeInTheDocument();
  });

  it('keeps destructive invite-code actions in the row overflow menu', async () => {
    listAdminCodesMock.mockResolvedValue({ codes: [inviteCode()] });
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Invite code WELCOME actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete invite code' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete invite code WELCOME?' });
    expect(dialog).toHaveClass('cedros-data-dialog');
    expect(within(dialog).getByRole('heading').parentElement).toHaveClass(
      'cedros-data-dialog__heading'
    );
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Delete invite code' }));

    await waitFor(() => expect(deleteAdminCodeMock).toHaveBeenCalledWith('code-1'));
  });

  it('returns focus to the invite-code overflow trigger when Escape closes the menu', async () => {
    listAdminCodesMock.mockResolvedValue({ codes: [inviteCode()] });
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    const trigger = await screen.findByRole('button', { name: 'Invite code WELCOME actions' });
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu');
    expect(trigger.closest('.cedros-data-table-wrap')).not.toContainElement(menu);
    expect(menu.parentElement).toHaveClass('cedros-login-admin-root', 'cedros-data');
    expect(screen.getByRole('menuitem', { name: 'Delete invite code' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('edits a custom invite code from the table action', async () => {
    listAdminCodesMock.mockResolvedValue({
      codes: [inviteCode({ maxUses: 12 })],
    });
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit invite code WELCOME' }));
    fireEvent.change(screen.getByLabelText('Invite code'), { target: { value: 'LAUNCH' } });
    fireEvent.click(screen.getByLabelText('Active'));
    fireEvent.click(screen.getByRole('button', { name: 'Save invite code' }));

    expect(await screen.findByText('LAUNCH')).toBeInTheDocument();
    expect(updateAdminCodeMock).toHaveBeenCalledWith('code-1', {
      code: 'LAUNCH',
      active: false,
    });
  });

  it('validates modal max uses before creating a custom invite code', async () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Invite codes' }));
    await screen.findByText('No custom invite codes have been created.');
    fireEvent.click(screen.getByRole('button', { name: 'Add custom code' }));
    fireEvent.change(screen.getByLabelText('Max uses'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create invite code' }));

    expect(await screen.findByText('Max uses must be greater than 0.')).toBeInTheDocument();
    expect(createAdminCodeMock).not.toHaveBeenCalled();
  });

  it('keeps invite code controls out of the advanced tab', () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: 'Advanced' }));

    expect(screen.getByRole('switch', { name: 'Two-factor authentication' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Invite codes' })).not.toBeInTheDocument();
    expect(listAdminCodesMock).not.toHaveBeenCalled();
  });
});

function renderSettings({
  cedrosPayInstalled,
  earlyAccessHost,
}: {
  cedrosPayInstalled?: boolean;
  earlyAccessHost?: ReturnType<typeof createEarlyAccessHost>;
} = {}) {
  const pluginContext: AdminSectionProps['pluginContext'] = {
    getAccessToken: vi.fn(() => 'admin-token'),
    hasPermission: vi.fn(() => true),
    pluginData: {
      user: { id: 'admin-1', email: 'owner@example.com' },
      cedrosPayInstalled,
      cedrosLoginEarlyAccess: earlyAccessHost,
    },
    serverUrl: 'https://auth.example.com/extensions/cedros-login',
  };

  return render(
    <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext}>
      <AuthenticationSettings />
    </CedrosLoginAdminRuntimeProvider>
  );
}

function createEarlyAccessHost() {
  return {
    getState: getEarlyAccessStateMock,
    setEnabled: setEarlyAccessEnabledMock,
  };
}

function earlyAccessState(overrides: Record<string, boolean> = {}) {
  return {
    available: true,
    editable: true,
    waitlistModeEnabled: true,
    enabled: false,
    ...overrides,
  };
}

function createAutosaveState(
  overrides: Partial<UseSettingsAutosaveReturn> = {}
): UseSettingsAutosaveReturn {
  const state: UseSettingsAutosaveReturn = {
    settings: {
      auth: [
        setting('auth_email_enabled', 'true'),
        setting('feature_mfa', 'true'),
        setting('security_require_mfa', 'false'),
        setting('auth_new_device_alert_enabled', 'true'),
        setting('auth_instantlink_enabled', 'false'),
        setting('invite_codes_enabled', 'false'),
        setting('invite_codes_users_can_issue', 'false'),
        setting('invite_codes_per_user', '1'),
        setting('invite_codes_reset_interval_days', '0'),
        setting('signup_limit_enabled', 'true'),
        setting('signup_limit_period', 'monthly'),
        setting('signup_limit_max', '100'),
        setting('signup_limit_show_remaining', 'false'),
      ],
      postlogin: [
        setting('postlogin_flow_order', 'subscription,username,welcome,profile'),
        setting('postlogin_username_enabled', 'false'),
        setting('postlogin_welcome_enabled', 'false'),
        setting('postlogin_welcome_route', '/welcome'),
        setting('postlogin_complete_enabled', 'false'),
        setting('postlogin_redirect_url', ''),
      ],
      'postlogin.subscription': [
        setting('subscription_selection_required', 'false'),
        setting('subscription_selection_route', '/subscribe'),
        setting('subscription_selection_pay_base_url', ''),
      ],
    },
    edits: {},
    isLoading: false,
    autosaveStatus: 'idle',
    autosaveError: null,
    hasManualChanges: false,
    manualChangeCount: 0,
    isManualSaving: false,
    manualSaveError: null,
    confirmManualSetting: vi.fn(),
    discardManualSetting: vi.fn(),
    isManualSettingSaving: vi.fn(() => false),
    getManualSettingError: vi.fn(() => null),
    error: null,
    fetchSettings,
    handleChange,
    getEffectiveValue: (key) => key,
    flushAutosave: vi.fn(),
    saveManualChanges: vi.fn(),
    resetManualChanges: vi.fn(),
  };
  return { ...state, ...overrides };
}

function setting(key: string, value: string): SystemSetting {
  return {
    key,
    value,
    description: null,
    isSecret: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: null,
  };
}

function inviteCode(overrides: Partial<InviteCode> = {}): InviteCode {
  return { ...inviteCodeBase(), ...overrides };
}

function inviteCodeBase(): InviteCode {
  return {
    id: 'code-1',
    code: 'WELCOME',
    maxUses: 5,
    usesCount: 0,
    startsAt: null,
    expiresAt: null,
    active: true,
    ownerUserId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
