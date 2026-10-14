import { ApiClient, handleApiError } from './apiClient';

export interface RelyingPartyPolicySummary {
  allowedScopes: string[];
  allowedSessionAudiences: string[];
  allowedOrganizationIds: string[];
}

export interface RelyingPartyStatus {
  relyingPartyId: string;
  displayName: string;
  tokenConfigured: boolean;
  policyConfigured: boolean;
  ready: boolean;
  policySummary?: RelyingPartyPolicySummary;
  validationErrors: string[];
}

export interface RelyingPartyReadiness {
  ready: boolean;
  relyingParties: RelyingPartyStatus[];
}

export interface ConfigureRelyingPartyRequest {
  token?: string;
  allowedScopes: string[];
  allowedSessionAudiences: string[];
  allowedOrganizationIds: string[];
}

export interface VerifyRelyingPartyRequest {
  token: string;
  requiredScope: string;
  sessionAudience: string;
  organizationId: string;
}

export type RelyingPartyDiagnostic =
  | 'caller_unknown'
  | 'token_absent'
  | 'token_mismatch'
  | 'policy_absent'
  | 'policy_malformed'
  | 'scope_missing'
  | 'audience_policy_mismatch'
  | 'organization_policy_mismatch'
  | 'ready';

export interface RelyingPartyVerification {
  relyingPartyId: string;
  diagnostic: RelyingPartyDiagnostic;
  ready: boolean;
  introspection?: { active: false };
  identityProfile?: { status: 404; error: 'not_found' };
  membership?: { status: 404; error: 'not_found' };
}

export class RelyingPartyApiClient {
  private readonly client: ApiClient;

  constructor(baseUrl: string, getAccessToken: () => string | null) {
    this.client = new ApiClient({ baseUrl, getAccessToken });
  }

  async getReadiness(forceRefresh = false): Promise<RelyingPartyReadiness> {
    try {
      return await this.client.get('/admin/relying-parties', {
        forceRefresh,
        cacheTtlMs: 5_000,
        validator: parseReadiness,
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to load relying-party readiness');
    }
  }

  async configure(
    relyingPartyId: string,
    request: ConfigureRelyingPartyRequest
  ): Promise<RelyingPartyStatus> {
    try {
      return await this.client.request({
        method: 'PUT',
        path: `/admin/relying-parties/${encodeURIComponent(relyingPartyId)}`,
        body: request,
        skipRetry: true,
        validator: parseStatus,
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to configure relying party');
    }
  }

  async verify(
    relyingPartyId: string,
    request: VerifyRelyingPartyRequest
  ): Promise<RelyingPartyVerification> {
    try {
      return await this.client.post(
        `/admin/relying-parties/${encodeURIComponent(relyingPartyId)}/verify`,
        request,
        { skipRetry: true, validator: parseVerification }
      );
    } catch (error) {
      throw handleApiError(error, 'Failed to verify relying party');
    }
  }
}

function parseReadiness(data: unknown): RelyingPartyReadiness {
  const response = record(data, 'readiness');
  if (typeof response.ready !== 'boolean' || !Array.isArray(response.relyingParties)) {
    throw new Error('readiness response is malformed');
  }
  return {
    ready: response.ready,
    relyingParties: response.relyingParties.map(parseStatus),
  };
}

function parseStatus(data: unknown): RelyingPartyStatus {
  const status = record(data, 'relying-party status');
  rejectSecretResponseFields(status);
  if (
    typeof status.relyingPartyId !== 'string' ||
    typeof status.displayName !== 'string' ||
    typeof status.tokenConfigured !== 'boolean' ||
    typeof status.policyConfigured !== 'boolean' ||
    typeof status.ready !== 'boolean' ||
    !Array.isArray(status.validationErrors) ||
    !status.validationErrors.every((value) => typeof value === 'string')
  ) {
    throw new Error('relying-party status is malformed');
  }
  return {
    relyingPartyId: status.relyingPartyId,
    displayName: status.displayName,
    tokenConfigured: status.tokenConfigured,
    policyConfigured: status.policyConfigured,
    ready: status.ready,
    ...(status.policySummary !== undefined
      ? { policySummary: parsePolicySummary(status.policySummary) }
      : {}),
    validationErrors: status.validationErrors as string[],
  };
}

function parsePolicySummary(data: unknown): RelyingPartyPolicySummary {
  const summary = record(data, 'policy summary');
  return {
    allowedScopes: stringArray(summary.allowedScopes, 'allowedScopes'),
    allowedSessionAudiences: stringArray(
      summary.allowedSessionAudiences,
      'allowedSessionAudiences'
    ),
    allowedOrganizationIds: stringArray(summary.allowedOrganizationIds, 'allowedOrganizationIds'),
  };
}

function parseVerification(data: unknown): RelyingPartyVerification {
  const response = record(data, 'verification');
  rejectSecretResponseFields(response);
  const diagnostics: RelyingPartyDiagnostic[] = [
    'caller_unknown',
    'token_absent',
    'token_mismatch',
    'policy_absent',
    'policy_malformed',
    'scope_missing',
    'audience_policy_mismatch',
    'organization_policy_mismatch',
    'ready',
  ];
  if (
    typeof response.relyingPartyId !== 'string' ||
    typeof response.ready !== 'boolean' ||
    typeof response.diagnostic !== 'string' ||
    !diagnostics.includes(response.diagnostic as RelyingPartyDiagnostic)
  ) {
    throw new Error('verification response is malformed');
  }
  let introspection: { active: false } | undefined;
  if (response.introspection !== undefined) {
    const value = record(response.introspection, 'introspection');
    if (value.active !== false) throw new Error('verification introspection must be inactive');
    introspection = { active: false };
  }
  let identityProfile: { status: 404; error: 'not_found' } | undefined;
  if (response.identityProfile !== undefined) {
    const value = record(response.identityProfile, 'identity profile probe');
    if (value.status !== 404 || value.error !== 'not_found') {
      throw new Error('verification identity profile probe must stop before subject lookup');
    }
    identityProfile = { status: 404, error: 'not_found' };
  }
  let membership: { status: 404; error: 'not_found' } | undefined;
  if (response.membership !== undefined) {
    const value = record(response.membership, 'membership probe');
    if (value.status !== 404 || value.error !== 'not_found') {
      throw new Error('verification membership probe must stop before subject lookup');
    }
    membership = { status: 404, error: 'not_found' };
  }
  return {
    relyingPartyId: response.relyingPartyId,
    diagnostic: response.diagnostic as RelyingPartyDiagnostic,
    ready: response.ready,
    ...(introspection ? { introspection } : {}),
    ...(identityProfile ? { identityProfile } : {}),
    ...(membership ? { membership } : {}),
  };
}

function rejectSecretResponseFields(value: Record<string, unknown>): void {
  for (const key of ['token', 'serviceToken', 'policy', 'policySecret', 'rawPolicy']) {
    if (key in value) throw new Error(`secret field ${key} must not appear in a read response`);
  }
}

function stringArray(data: unknown, label: string): string[] {
  if (!Array.isArray(data) || !data.every((value) => typeof value === 'string')) {
    throw new Error(`${label} must be a string array`);
  }
  return data as string[];
}

function record(data: unknown, label: string): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} must be an object`);
  }
  return data as Record<string, unknown>;
}
