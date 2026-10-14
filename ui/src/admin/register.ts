import adminRuntimeStyles from '../styles/login.css?inline';
import authBlockStyles from '../extension/auth-blocks.css?inline';
import { cedrosLoginExtensionManifest } from '../extension/manifest';
import type { CedrosExtensionBootstrap } from '../extension/contracts';
import { cedrosLoginExtensionAdminModule } from './cedrosAdminModule';
import { ensureCedrosLoginAdminStyles } from './adminStyles';
import {
  cedrosLoginTeamDirectoryHostService,
  type CedrosLoginTeamDirectoryHostServiceRegistration,
} from './teamDirectoryHostService';

// The host imports this compiled entry directly from the intake ZIP, with no
// HTML page linking login-react.css. Inject the bundled stylesheet on import so
// the admin sections are styled instead of falling back to browser defaults.
ensureCedrosLoginAdminStyles(`${adminRuntimeStyles}\n${authBlockStyles}`);

export type CedrosLoginAdminBootstrap = CedrosExtensionBootstrap & {
  hostServices: CedrosLoginTeamDirectoryHostServiceRegistration[];
};

export const cedrosLoginAdminExtensionBootstrap: CedrosLoginAdminBootstrap = {
  manifest: cedrosLoginExtensionManifest,
  modules: [cedrosLoginExtensionAdminModule],
  hostServices: [cedrosLoginTeamDirectoryHostService],
};

export const cedrosLoginAdminBootstrap = cedrosLoginAdminExtensionBootstrap;

export {
  CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID,
  cedrosLoginTeamDirectoryHostService,
  createCedrosLoginTeamDirectoryService,
} from './teamDirectoryHostService';
export type {
  CedrosLoginTeamDirectoryEntry,
  CedrosLoginTeamDirectoryListResult,
  CedrosLoginTeamDirectoryService,
  CedrosLoginTeamDirectoryHostServiceRegistration,
} from './teamDirectoryHostService';

export function registerCedrosAdminSurface(): CedrosLoginAdminBootstrap {
  return cedrosLoginAdminExtensionBootstrap;
}

export const registerCedrosLoginAdminSurface = registerCedrosAdminSurface;

export default registerCedrosAdminSurface;
