export type FeatureFlagStatus = 'stable' | 'experimental';

export interface FeatureFlagDefinition {
  name: string;
  description: string;
  defaultEnabled: boolean;
  status: FeatureFlagStatus;
  envVar: string;
  autoDiscoverable: boolean;
}

export const FEATURE_FLAG_ENV_PREFIX = 'CEDROS_FEATURE_';

/**
 * Single source of truth for package feature flags.
 *
 * To roll out a feature:
 * 1. Add it here with a positive name.
 * 2. Ship it with `defaultEnabled: false`.
 * 3. Flip only `defaultEnabled` to `true` when ready.
 */
export const FEATURE_FLAG_REGISTRY = {
  email: {
    name: 'email',
    description: 'Enable email/password authentication.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_EMAIL',
    autoDiscoverable: true,
  },
  google: {
    name: 'google',
    description: 'Enable Google OAuth authentication.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_GOOGLE',
    autoDiscoverable: true,
  },
  apple: {
    name: 'apple',
    description: 'Enable Apple Sign In authentication.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_APPLE',
    autoDiscoverable: true,
  },
  solana: {
    name: 'solana',
    description: 'Enable Solana wallet authentication.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_SOLANA',
    autoDiscoverable: true,
  },
  webauthn: {
    name: 'webauthn',
    description: 'Enable passkey authentication.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_WEBAUTHN',
    autoDiscoverable: true,
  },
  instantLink: {
    name: 'instantLink',
    description: 'Enable passwordless instant-link sign-in.',
    defaultEnabled: false,
    status: 'experimental',
    envVar: 'CEDROS_FEATURE_INSTANT_LINK',
    autoDiscoverable: true,
  },
  walletEnrollment: {
    name: 'walletEnrollment',
    description: 'Enable embedded wallet auto-enrollment after registration.',
    defaultEnabled: true,
    status: 'stable',
    envVar: 'CEDROS_FEATURE_WALLET_ENROLLMENT',
    autoDiscoverable: false,
  },
} as const satisfies Record<string, FeatureFlagDefinition>;

export type FeatureFlagName = keyof typeof FEATURE_FLAG_REGISTRY;
export type FeatureFlags = Partial<Record<FeatureFlagName, boolean>>;
export type ResolvedFeatureFlags = Record<FeatureFlagName, boolean>;
export type FeatureFlagEnvValue = string | boolean | undefined;
export type FeatureFlagEnv = Record<string, FeatureFlagEnvValue>;

export interface ResolveFeatureFlagsOptions {
  config?: FeatureFlags;
  env?: FeatureFlagEnv;
  /**
   * Lower-precedence flag values from another source, such as server discovery.
   */
  base?: FeatureFlags;
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export function getFeatureFlagDefinition(name: FeatureFlagName): FeatureFlagDefinition {
  return FEATURE_FLAG_REGISTRY[name];
}

export function getFeatureFlagDefinitions(): FeatureFlagDefinition[] {
  return Object.values(FEATURE_FLAG_REGISTRY);
}

export function getFeatureFlagEnvVar(name: FeatureFlagName): string {
  return FEATURE_FLAG_REGISTRY[name].envVar;
}

export function parseFeatureFlagBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return undefined;
}

export function getDefaultFeatureFlags(): ResolvedFeatureFlags {
  return Object.fromEntries(
    Object.entries(FEATURE_FLAG_REGISTRY).map(([name, definition]) => [
      name,
      definition.defaultEnabled,
    ])
  ) as ResolvedFeatureFlags;
}

export function readFeatureFlagEnv(envSource?: FeatureFlagEnv): FeatureFlags {
  const overrides: FeatureFlags = {};

  for (const definition of getFeatureFlagDefinitions()) {
    const parsed = parseFeatureFlagBoolean(envSource?.[definition.envVar]);
    if (parsed !== undefined) {
      overrides[definition.name as FeatureFlagName] = parsed;
    }
  }

  return overrides;
}

export function resolveFeatureFlags(
  options: ResolveFeatureFlagsOptions = {}
): ResolvedFeatureFlags {
  const defaults = getDefaultFeatureFlags();
  const envOverrides = readFeatureFlagEnv(options.env);
  const resolved = { ...defaults };

  for (const name of Object.keys(FEATURE_FLAG_REGISTRY) as FeatureFlagName[]) {
    resolved[name] =
      options.config?.[name] ?? envOverrides[name] ?? options.base?.[name] ?? defaults[name];
  }

  return resolved;
}

export function isFeatureEnabled(
  name: FeatureFlagName,
  options: ResolveFeatureFlagsOptions & {
    flags?: FeatureFlags | ResolvedFeatureFlags;
  } = {}
): boolean {
  if (options.flags) {
    return options.flags[name] ?? FEATURE_FLAG_REGISTRY[name].defaultEnabled;
  }

  return resolveFeatureFlags(options)[name];
}

export function getAutoDiscoverableFeatureFlagNames(): FeatureFlagName[] {
  return getFeatureFlagDefinitions()
    .filter((definition) => definition.autoDiscoverable)
    .map((definition) => definition.name as FeatureFlagName);
}

export function getAutoDiscoverableFeatureDefaults(): FeatureFlags {
  const defaults = getDefaultFeatureFlags();
  const autoDiscoverable: FeatureFlags = {};

  for (const name of getAutoDiscoverableFeatureFlagNames()) {
    autoDiscoverable[name] = defaults[name];
  }

  return autoDiscoverable;
}
