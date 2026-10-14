// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { _internalGoogleScriptLoader } from './useGoogleAuth';

describe('Google script loader (SSR)', () => {
  it('rejects when window/document are unavailable', async () => {
    _internalGoogleScriptLoader._reset();
    await expect(_internalGoogleScriptLoader.load()).rejects.toThrow(/SSR/);
  });
});
