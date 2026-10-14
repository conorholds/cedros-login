import { describe, expect, it } from 'vitest';
import { ApiClient } from '../../utils/apiClient';
import { getMockSettingsResponse } from './handlers/settingsSupport';

describe('mock handler contracts', () => {
  // MSW uses first-match routing: the stats route must not be captured as a user ID.
  it.each(['http://localhost:8080', 'http://localhost:8080/auth'])(
    'routes admin statistics before parameterized user routes at %s',
    async (baseUrl) => {
      const client = new ApiClient({ baseUrl, retryAttempts: 0 });
      await expect(client.get('/admin/users/stats')).resolves.toMatchObject({
        total: 142,
        authMethodCounts: { email: 85 },
      });
    }
  );

  it('keeps settings fixture timestamps and secret flags consistent', () => {
    const response = getMockSettingsResponse();
    const settings = Object.values(response.settings).flat();

    expect(settings.length).toBeGreaterThan(0);
    expect(settings.every((setting) => setting.updatedAt === response.updatedAt)).toBe(true);
    expect(
      settings
        .filter((setting) => setting.isSecret)
        .map((setting) => setting.key)
        .sort()
    ).toEqual(['email_smtp_password', 'server_metrics_api_key']);
  });
});
