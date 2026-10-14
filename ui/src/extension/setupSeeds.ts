export type CedrosExtensionNotificationChannelKind = 'email' | 'discord' | 'slack' | 'telegram';

export type CedrosExtensionNotificationAudience = 'team' | 'personal';
export type CedrosExtensionNotificationSeverity = 'info' | 'warning' | 'error';

export interface CedrosExtensionNotificationSeedManifest {
  id: string;
  displayName: string;
  title: string;
  description?: string;
  eventId: string;
  audience: CedrosExtensionNotificationAudience;
  severity?: CedrosExtensionNotificationSeverity;
  defaultChannels?: CedrosExtensionNotificationChannelKind[];
  subjectTemplate?: string;
  bodyTemplate: string;
  tags?: string[];
}

export interface CedrosExtensionSetupSeedsManifest {
  notifications?: CedrosExtensionNotificationSeedManifest[];
}
