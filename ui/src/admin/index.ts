/**
 * cedros-login admin entrypoint.
 *
 * Exposes Cedros Login admin modules, host services, and their contracts.
 * The consuming application owns its admin shell and routing.
 */

export { cedrosLoginPlugin, CEDROS_LOGIN_SECTION_IDS } from './plugin';
export { CEDROS_LOGIN_ADMIN_SECTION_IDS } from './adminIds';
export {
  cedrosLoginAdminModule,
  cedrosLoginExtensionAdminModule,
  cedrosLoginSettingsAdminModule,
} from './cedrosAdminModule';
export {
  CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID,
  cedrosLoginTeamDirectoryHostService,
  createCedrosLoginTeamDirectoryService,
} from './teamDirectoryHostService';
export type {
  CedrosLoginTeamDirectoryEntry,
  CedrosLoginTeamDirectoryHostServiceRegistration,
  CedrosLoginTeamDirectoryListResult,
  CedrosLoginTeamDirectoryService,
} from './teamDirectoryHostService';
export {
  HOST_SERVICE_IDS,
  buildAdminHostServiceBag,
  createAdminHostServiceBag,
  getHostService,
  getServiceFromBag,
} from './platform';
export { CedrosLoginAdminRuntimeProvider } from './CedrosLoginAdminRuntimeProvider';
export { useCedrosLoginAdminClientContext } from '../hooks/useCedrosLoginAdminClientContext';
export { useSettingsAutosave } from '../hooks/useSettingsAutosave';
export type {
  UseSettingsAutosaveReturn,
  AutosaveStatus as SettingsAutosaveStatus,
} from '../hooks/useSettingsAutosave';
export { SettingsSection, AutosaveStatus } from '../components/admin/settings';
export type { SettingsSectionProps, AutosaveStatusProps } from '../components/admin/settings';
export {
  AutosaveConflictDialog,
  AutosaveRetryBanner,
  AutosaveStatusIndicator,
  CEDROS_AUTOSAVE_DEBOUNCE_PROFILES,
  CedrosAutosaveProvider,
  createCedrosAutosavePersistence,
  createIndexedDbAutosavePersistence,
  createMemoryAutosavePersistence,
  useCedrosAutosave,
  useCedrosAutosaveTelemetry,
} from '../autosave';
export type {
  AutosaveResourceDefinition,
  CedrosAutosaveConflict,
  CedrosAutosaveConflictStrategy,
  CedrosAutosaveController,
  CedrosAutosaveDebounceProfile,
  CedrosAutosaveDebounceProfileName,
  CedrosAutosaveFailure,
  CedrosAutosaveMetadata,
  CedrosAutosaveOptions,
  CedrosAutosavePersistence,
  CedrosAutosavePersistenceSnapshot,
  CedrosAutosavePersistenceStorage,
  CedrosAutosaveProviderProps,
  CedrosAutosaveProviderValue,
  CedrosAutosaveResult,
  CedrosAutosaveSaveMetadata,
  CedrosAutosaveSaveResult,
  CedrosAutosaveState,
  CedrosAutosaveStatus,
  CedrosAutosaveTelemetryEvent,
  CedrosAutosaveValidationResult,
  UseCedrosAutosaveOptions,
  UseCedrosAutosaveReturn,
} from '../autosave';
export type {
  AdminHostContext,
  AdminHostServiceBag,
  AdminPlugin,
  AdminPageAccess,
  AdminSectionConfig,
  AdminGroupConfig,
  AdminSectionProps,
  HostContext,
  PluginContext,
  PluginId,
  SectionId,
  QualifiedSectionId,
  PluginPermission,
} from './types';
