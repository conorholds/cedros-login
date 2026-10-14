import { describe, expect, it } from 'vitest';
import { isIpAddressHostname, mapWebAuthnDomError } from './webauthnErrors';

function domException(name: string): Error {
  const err = new Error('boom');
  err.name = name;
  return err;
}

describe('isIpAddressHostname', () => {
  it('detects IPv4 and IPv6 literals', () => {
    expect(isIpAddressHostname('127.0.0.1')).toBe(true);
    expect(isIpAddressHostname('192.168.1.50')).toBe(true);
    expect(isIpAddressHostname('[::1]')).toBe(true);
    expect(isIpAddressHostname('::1')).toBe(true);
  });

  it('rejects DNS hostnames and empty values', () => {
    expect(isIpAddressHostname('localhost')).toBe(false);
    expect(isIpAddressHostname('app.example.com')).toBe(false);
    expect(isIpAddressHostname('1.2.3.4.5')).toBe(false);
    expect(isIpAddressHostname('')).toBe(false);
    expect(isIpAddressHostname(undefined)).toBe(false);
  });
});

describe('mapWebAuthnDomError', () => {
  it('explains the IP-address restriction for SecurityError on IP origins', () => {
    const mapped = mapWebAuthnDomError(domException('SecurityError'), '127.0.0.1');
    expect(mapped?.code).toBe('VALIDATION_ERROR');
    expect(mapped?.message).toContain('127.0.0.1');
    expect(mapped?.message).toContain('http://localhost');
  });

  it('keeps the relying-party guidance for SecurityError on DNS origins', () => {
    const mapped = mapWebAuthnDomError(domException('SecurityError'), 'app.example.com');
    expect(mapped?.code).toBe('VALIDATION_ERROR');
    expect(mapped?.message).toContain('WEBAUTHN_RP_ID');
  });

  it('maps NotAllowedError and InvalidStateError', () => {
    expect(mapWebAuthnDomError(domException('NotAllowedError'), 'localhost')?.message).toContain(
      'cancelled or timed out'
    );
    expect(mapWebAuthnDomError(domException('InvalidStateError'), 'localhost')?.code).toBe(
      'VALIDATION_ERROR'
    );
  });

  it('returns null for unrecognized errors and non-Error values', () => {
    expect(mapWebAuthnDomError(domException('TypeError'), 'localhost')).toBeNull();
    expect(mapWebAuthnDomError({ code: 'SERVER_ERROR', message: 'x' }, 'localhost')).toBeNull();
  });
});
