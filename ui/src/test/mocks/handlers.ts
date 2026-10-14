/**
 * MSW request handlers for integration testing.
 *
 * Domain arrays are composed in the original route-precedence order. Keep
 * this file as the stable import surface for tests and the mock server.
 */
import { adminSettingsHandlers } from './handlers/adminSettingsHandlers';
import { adminUserHandlers } from './handlers/adminUserHandlers';
import { authHandlers } from './handlers/authHandlers';
import { baseHandlers } from './handlers/baseHandlers';
import { identityHandlers } from './handlers/identityHandlers';
import { organizationHandlers } from './handlers/organizationHandlers';
import { securityHandlers } from './handlers/securityHandlers';
import { walletHandlers } from './handlers/walletHandlers';

export { resetMockState, TAKEN_WALLET_ADDRESS } from './handlers/mockState';

export const handlers = [
  ...baseHandlers,
  ...authHandlers,
  ...securityHandlers,
  ...organizationHandlers,
  ...adminUserHandlers,
  ...adminSettingsHandlers,
  ...identityHandlers,
  ...walletHandlers,
];
